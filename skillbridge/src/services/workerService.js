import { db, storage, isSimulationMode } from '../firebase/firebaseConfig.js';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { syncWorkerVerificationEligibility } from './verificationEligibilityService.js';
import { MOCK_WORKERS } from './recommendationService.js';

/**
 * Fetch a worker profile by userId
 */
export async function getWorkerProfile(userId) {
  if (isSimulationMode) {
    const stored = localStorage.getItem('sb_mock_workers');
    const workers = stored ? JSON.parse(stored) : MOCK_WORKERS;
    const worker = workers.find(w => w.userId === userId || w.workerId === userId);
    return worker || null;
  } else {
    try {
      const docRef = doc(db, 'workerProfiles', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching worker profile:', error);
      throw error;
    }
  }
}

/**
 * Fetch all worker profiles (Admin view)
 */
export async function getAllWorkerProfiles() {
  if (isSimulationMode) {
    const stored = localStorage.getItem('sb_mock_workers');
    return stored ? JSON.parse(stored) : MOCK_WORKERS;
  } else {
    try {
      const colRef = collection(db, 'workerProfiles');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching all worker profiles:', error);
      throw error;
    }
  }
}

/**
 * Update worker profile data
 */
export async function updateWorkerProfile(userId, profileData) {
  if (isSimulationMode) {
    const workers = JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
    const index = workers.findIndex(w => w.userId === userId);
    
    if (index !== -1) {
      workers[index] = { ...workers[index], ...profileData, userId };
    } else {
      // If profile didn't exist in mock, create it
      workers.push({ ...profileData, userId, rating: 0, reviewCount: 0, completedJobs: 0, verified: false });
    }
    
    localStorage.setItem('sb_mock_workers', JSON.stringify(workers));
    
    // Also update users representation name if changed
    if (profileData.name) {
      const users = JSON.parse(localStorage.getItem('sb_mock_users') || '{}');
      if (users[userId]) {
        users[userId].name = profileData.name;
        localStorage.setItem('sb_mock_users', JSON.stringify(users));
      }
    }
    
    return workers.find(w => w.userId === userId);
  } else {
    try {
      const docRef = doc(db, 'workerProfiles', userId);
      await updateDoc(docRef, profileData);

      if (profileData.name) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { name: profileData.name });
      }
      return getWorkerProfile(userId);
    } catch (error) {
      console.error('Error updating worker profile:', error);
      throw error;
    }
  }
}

/**
 * Toggle availability status
 */
export async function toggleAvailability(userId, availability) {
  return updateWorkerProfile(userId, { availability });
}

/**
 * Upload profile/verification documents
 */
export async function uploadWorkerFile(userId, file, type) {
  // type is 'profile', 'id_proof', or 'certificate'
  if (isSimulationMode) {
    // Generate a dummy object URL or unsplash URL
    return new Promise((resolve) => {
      setTimeout(() => {
        if (type === 'profile') {
          resolve('https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150');
        } else if (type === 'id_proof') {
          resolve('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        } else {
          resolve('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        }
      }, 500);
    });
  } else {
    try {
      const extension = file.name.split('.').pop();
      const path = `workers/${userId}/${type}.${extension}`;
      const fileRef = ref(storage, path);
      
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      // Update download url directly on the profile
      const updatePayload = {};
      if (type === 'profile') updatePayload.profileImageUrl = downloadUrl;
      if (type === 'id_proof') updatePayload.idProofUrl = downloadUrl;
      if (type === 'certificate') updatePayload.certificateUrl = downloadUrl;
      
      await updateWorkerProfile(userId, updatePayload);
      
      return downloadUrl;
    } catch (error) {
      console.error(`Error uploading worker file (${type}):`, error);
      throw new Error('Document upload failed. Please check your file and retry.', { cause: error });
    }
  }
}

/**
 * Admin Approval / Rejection of a Worker Profile
 */
export async function setWorkerVerificationStatus(userId, verified, rejectionReason = '') {
  const existingProfile = await getWorkerProfile(userId);
  const updatedAIReport = existingProfile?.aiAuditReport ? {
    ...existingProfile.aiAuditReport,
    status: verified ? 'admin_approved' : 'admin_rejected',
    adminDecisionAt: new Date().toISOString(),
    adminDecision: verified ? 'Approved by Admin' : `Rejected: ${rejectionReason}`
  } : null;

  const updatePayload = { 
    verified: Boolean(verified),
    adminApprovalStatus: verified ? 'approved' : 'rejected',
    workVerificationStatus: verified ? 'Approved' : 'Rejected',
    ...(updatedAIReport && { aiAuditReport: updatedAIReport })
  };
  
  if (!verified && rejectionReason) {
    updatePayload.rejectionReason = rejectionReason;
  } else if (verified) {
    updatePayload.rejectionReason = '';
  }
  
  // Calculate complete 3-criteria eligibility
  await updateWorkerProfile(userId, updatePayload);
  return syncWorkerVerificationEligibility(userId, updatePayload);
}

const SAMPLE_CUSTOMER_NAMES = [
  'Anand Kumar', 'Priya Sundaram', 'Karthik V', 'Meera Nair', 'Rajesh Mohan',
  'Divya Krishnan', 'Senthil Raj', 'Deepa Patel', 'Vigneshwaran M', 'Lakshmi Narayanan',
  'Gowri Shankar', 'Pavithra R', 'Arvind Swaminathan', 'Kavitha Balaji', 'Sanjay Dutt',
  'Aishwarya R', 'Bala Subramanian', 'Revathi K', 'Harish Raghavan', 'Saravanan T'
];

/**
 * Calculate dynamic and consistent worker earnings and history matching dataset
 */
export function getWorkerEarningsData(profile, bookings = []) {
  if (!profile) {
    return {
      totalCompletedJobs: 0,
      totalIncome: 0,
      averageEarnings: 0,
      allCompletedJobs: []
    };
  }

  const liveCompleted = (bookings || []).filter(b => b && b.status === 'Completed');
  const targetCompletedCount = Math.max(
    Number(profile.completedJobs) || 0,
    liveCompleted.length
  );

  // New worker with 0 completed jobs
  if (targetCompletedCount === 0) {
    return {
      totalCompletedJobs: 0,
      totalIncome: 0,
      averageEarnings: 0,
      allCompletedJobs: []
    };
  }

  const basePrice = Number(profile.price) || 400;
  const skills = (Array.isArray(profile.skills) && profile.skills.length > 0)
    ? profile.skills
    : (Array.isArray(profile.categories) && profile.categories.length > 0)
      ? profile.categories
      : [profile.category || 'General Service'];

  // Parse live completed bookings
  const liveJobs = liveCompleted.map(b => {
    let amount = basePrice;
    if (b.price && !isNaN(Number(b.price))) {
      amount = Number(b.price);
    } else if (b.estimatedPrice) {
      const match = String(b.estimatedPrice).replace(/[^0-9–]/g, '').split('–');
      amount = (match && match[0] && !isNaN(Number(match[0]))) ? Number(match[0]) : basePrice;
    }
    return {
      bookingId: b.bookingId || b.id || `live_${Math.random().toString(36).substr(2, 6)}`,
      jobType: b.jobType || b.serviceName || skills[0],
      scheduledDate: b.scheduledDate || b.date || b.createdAt || new Date().toISOString(),
      customerName: b.customerName || 'Direct Client',
      estimatedPrice: `₹${amount}`,
      payoutAmount: amount,
      status: 'Completed',
      isLive: true
    };
  });

  const historicalNeeded = Math.max(0, targetCompletedCount - liveJobs.length);
  const historicalJobs = [];

  const workerSeed = (profile.workerId || profile.userId || 'W001')
    .toString()
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  for (let i = 0; i < historicalNeeded; i++) {
    const jobSkill = skills[(i + workerSeed) % skills.length];
    const customer = SAMPLE_CUSTOMER_NAMES[(i + workerSeed * 3) % SAMPLE_CUSTOMER_NAMES.length];

    // Controlled realistic variance (+/- 10-15%) centered around the worker's base price
    const varianceFactor = (((i * 7 + workerSeed) % 7) - 3) * 0.04;
    const jobAmount = Math.max(150, Math.round((basePrice * (1 + varianceFactor)) / 10) * 10);

    // Stagger dates in past days/months
    const daysAgo = Math.floor((i + 1) * 2.5 + ((workerSeed + i) % 3));
    const jobDate = new Date(now - daysAgo * ONE_DAY).toISOString();

    historicalJobs.push({
      bookingId: `hist_${profile.workerId || profile.userId || 'w'}_${i + 1}`,
      jobType: jobSkill,
      scheduledDate: jobDate,
      customerName: customer,
      estimatedPrice: `₹${jobAmount}`,
      payoutAmount: jobAmount,
      status: 'Completed',
      isLive: false
    });
  }

  // Combine and sort by date descending
  const allCompletedJobs = [...liveJobs, ...historicalJobs].sort((a, b) => {
    const dateA = new Date(a.scheduledDate || 0).getTime();
    const dateB = new Date(b.scheduledDate || 0).getTime();
    return dateB - dateA;
  });

  const totalIncome = allCompletedJobs.reduce((sum, job) => sum + (Number(job.payoutAmount) || 0), 0);
  const averageEarnings = allCompletedJobs.length > 0 ? Math.round(totalIncome / allCompletedJobs.length) : 0;

  return {
    totalCompletedJobs: allCompletedJobs.length,
    totalIncome,
    averageEarnings,
    allCompletedJobs
  };
}

