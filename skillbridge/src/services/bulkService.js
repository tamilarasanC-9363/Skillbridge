import { db, isSimulationMode } from '../firebase/firebaseConfig';
import { 
  collection, 
  getDocs, 
  addDoc,
  updateDoc,
  doc
} from 'firebase/firestore';

const MOCK_BULK_REQUESTS = [
  {
    requestId: 'bulk_1',
    businessName: 'Apex Construction Ltd',
    categories: ['Plumbing', 'Mason / Construction'],
    numberOfWorkers: 5,
    requiredSkills: ['Pipe Installation', 'Brick Wall Construction', 'Cement Work'],
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Adyar Industrial Park',
    description: 'Require skilled masonry workers and plumbers for a commercial building project phase 2.',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

if (typeof window !== 'undefined' && !localStorage.getItem('sb_mock_bulk')) {
  localStorage.setItem('sb_mock_bulk', JSON.stringify(MOCK_BULK_REQUESTS));
}

/**
 * Submit a bulk request
 */
export async function submitBulkRequest(requestData) {
  const payload = {
    status: 'pending',
    createdAt: isSimulationMode ? new Date().toISOString() : new Date(),
    ...requestData
  };

  if (isSimulationMode) {
    const requests = JSON.parse(localStorage.getItem('sb_mock_bulk') || '[]');
    const requestId = 'bulk_' + Math.random().toString(36).substr(2, 9);
    const newReq = { requestId, ...payload };
    requests.push(newReq);
    localStorage.setItem('sb_mock_bulk', JSON.stringify(requests));
    return newReq;
  } else {
    try {
      const docRef = await addDoc(collection(db, 'bulkRequests'), payload);
      await updateDoc(docRef, { requestId: docRef.id });
      return { requestId: docRef.id, ...payload };
    } catch (error) {
      console.error('Error submitting bulk request:', error);
      throw error;
    }
  }
}

/**
 * Fetch all bulk requests (Admin view)
 */
export async function getAllBulkRequests() {
  if (isSimulationMode) {
    const requests = JSON.parse(localStorage.getItem('sb_mock_bulk') || '[]');
    return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    try {
      const colRef = collection(db, 'bulkRequests');
      const snapshot = await getDocs(colRef);
      const results = snapshot.docs.map(doc => doc.data());
      return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching bulk requests:', error);
      throw error;
    }
  }
}

/**
 * Update status of a bulk request
 */
export async function updateBulkRequestStatus(requestId, status) {
  if (isSimulationMode) {
    const requests = JSON.parse(localStorage.getItem('sb_mock_bulk') || '[]');
    const index = requests.findIndex(r => r.requestId === requestId);
    if (index !== -1) {
      requests[index].status = status;
      localStorage.setItem('sb_mock_bulk', JSON.stringify(requests));
    }
    return true;
  } else {
    try {
      const docRef = doc(db, 'bulkRequests', requestId);
      await updateDoc(docRef, { status });
      return true;
    } catch (error) {
      console.error('Error updating bulk status:', error);
      throw error;
    }
  }
}
