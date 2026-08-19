import { db, storage, isSimulationMode } from '../firebase/firebaseConfig';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Fetch a worker profile by userId
 */
export async function getWorkerProfile(userId) {
  if (isSimulationMode) {
    const workers = JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
    const worker = workers.find(w => w.userId === userId);
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
    return JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
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
      throw new Error('Document upload failed. Please check your file and retry.');
    }
  }
}

/**
 * Admin Approval / Rejection of a Worker Profile
 */
export async function setWorkerVerificationStatus(userId, verified, rejectionReason = '') {
  const updatePayload = { verified };
  if (!verified && rejectionReason) {
    updatePayload.rejectionReason = rejectionReason;
  }
  return updateWorkerProfile(userId, updatePayload);
}
