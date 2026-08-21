/**
 * SkillBridge Work Verification & Eligibility Module
 * 
 * Rules for the 🏅 Verified Worker Badge:
 * 1. Rating >= 4.0 (Client Satisfaction)
 * 2. Experience >= 2 years (Trade Experience)
 * 3. Work Verification Approved (Profile photo + Proof of Work approved by Admin)
 * 
 * New workers or workers pending these conditions show "New Worker".
 */

import { db, isSimulationMode } from '../firebase/firebaseConfig.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

/**
 * Evaluate the 3 core verification eligibility criteria for a worker
 * 
 * @param {Object} worker - Worker profile data
 * @returns {Object} - Complete eligibility breakdown and audit metadata
 */
export function evaluateWorkerEligibility(worker) {
  if (!worker) {
    return {
      isEligible: false,
      isVerified: false,
      metCount: 0,
      totalCriteria: 3,
      eligibilityScore: 0,
      badgeLabel: 'New Worker',
      criteria: {
        rating: { met: false, current: 0, required: 4.0, label: 'Client Satisfaction (Rating ≥ 4.0)', detail: '0 / 5.0 Rating' },
        experience: { met: false, current: 0, required: 2, label: 'Trade Experience (≥ 2 Years)', detail: '0 Years' },
        workVerification: { met: false, status: 'Pending', label: 'Work Verification (Proof of Work & Photo)', detail: 'Pending Admin Approval' }
      },
      disclaimer: 'SkillBridge Work Verification audits practical proof of work and client feedback before issuing Verified Worker badges.'
    };
  }

  // 1. Rating Benchmark: Rating >= 4.0 (for workers with reviews; if 0 reviews yet, must be completed via jobs or admin verification)
  const currentRating = typeof worker.rating === 'number' ? worker.rating : 0;
  const ratingMet = currentRating >= 4.0 || (worker.completedJobs === 0 && worker.verified === true);

  // 2. Experience Benchmark: Experience >= 2 Years
  const currentExperience = Number(worker.experience) || 0;
  const experienceMet = currentExperience >= 2;

  // 3. Work Verification: Approved by Admin / Valid Proof of Work
  const isWorkApproved = Boolean(
    worker.workVerificationStatus === 'Approved' || 
    worker.verified === true ||
    worker.adminApprovalStatus === 'approved'
  );

  // All 3 conditions must be satisfied to earn the Verified Worker badge
  const satisfiesAllCriteria = Boolean(ratingMet && experienceMet && isWorkApproved);
  const isVerifiedBadge = Boolean(worker.verified === true || satisfiesAllCriteria);

  const metCount = (ratingMet ? 1 : 0) + (experienceMet ? 1 : 0) + (isWorkApproved ? 1 : 0);
  const eligibilityPercentage = isVerifiedBadge ? 100 : Math.round((metCount / 3) * 100);

  return {
    isEligible: isVerifiedBadge,
    isVerified: isVerifiedBadge,
    metCount: isVerifiedBadge ? 3 : metCount,
    totalCriteria: 3,
    eligibilityScore: eligibilityPercentage,
    badgeLabel: isVerifiedBadge ? 'Verified Worker' : 'New Worker',
    criteria: {
      rating: {
        met: isVerifiedBadge || ratingMet,
        current: currentRating,
        required: 4.0,
        label: 'Client Satisfaction (Rating ≥ 4.0)',
        detail: currentRating > 0 
          ? `${currentRating} / 5.0 Star Rating` 
          : (isVerifiedBadge ? 'Satisfied / Approved' : 'New Worker (Requires 4.0+ rating after initial jobs)')
      },
      experience: {
        met: isVerifiedBadge || experienceMet,
        current: currentExperience,
        required: 2,
        label: 'Trade Experience (≥ 2 Years)',
        detail: `${currentExperience} Years field experience`
      },
      workVerification: {
        met: isWorkApproved,
        status: isWorkApproved ? 'Approved by Admin' : (worker.proofOfWorkUrl ? 'Submitted for Admin Approval' : 'Pending Submission'),
        label: 'SkillBridge Work Verification',
        detail: isWorkApproved 
          ? 'Profile photo, proof of work & trade credentials approved by Admin' 
          : 'Requires valid profile photo + proof of work (photos, invoice, work order)'
      }
    },
    disclaimer: 'SkillBridge Work Verification audits practical proof of work and client feedback before issuing Verified Worker badges.'
  };
}

/**
 * Automatically sync and recalculate worker verification eligibility in Firestore / localStorage
 * 
 * @param {string} userId - Worker UID
 * @param {Object} updatedFields - Fields being modified
 */
export async function syncWorkerVerificationEligibility(userId, updatedFields = {}) {
  if (isSimulationMode) {
    const workers = JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
    const index = workers.findIndex(w => w.userId === userId);
    
    if (index !== -1) {
      const mergedWorker = { ...workers[index], ...updatedFields };
      const eligibility = evaluateWorkerEligibility(mergedWorker);
      const finalVerified = Boolean(eligibility.isEligible);

      mergedWorker.verified = finalVerified;
      mergedWorker.verificationEligibility = eligibility;
      
      workers[index] = mergedWorker;
      localStorage.setItem('sb_mock_workers', JSON.stringify(workers));
      return mergedWorker;
    }
    return null;
  } else {
    try {
      const docRef = doc(db, 'workerProfiles', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        const mergedWorker = { ...currentData, ...updatedFields };
        const eligibility = evaluateWorkerEligibility(mergedWorker);
        const finalVerified = Boolean(eligibility.isEligible);

        mergedWorker.verified = finalVerified;
        mergedWorker.verificationEligibility = eligibility;
        
        await updateDoc(docRef, {
          ...updatedFields,
          verificationEligibility: eligibility,
          verified: finalVerified
        });
        
        return mergedWorker;
      }
      return null;
    } catch (error) {
      console.error('Error syncing worker verification eligibility in Firestore:', error);
      throw error;
    }
  }
}
