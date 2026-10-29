import { db, isSimulationMode } from '../firebase/firebaseConfig.js';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';

const MOCK_BULK_REQUESTS = [
  {
    requestId: 'BULK_REQ_001',
    organizationName: 'L&T Infotech Tech Park',
    contactPerson: 'Senthil Kumaran',
    contactPhone: '9842104512',
    contactEmail: 'senthil.k@ltinfotech.demo',
    category: 'Electrical',
    requiredSkills: ['Wiring Installation', 'MCB / DB Repair', 'Switch / Socket Repair'],
    workersRequired: 8,
    jobLocation: 'Peelamedu, Coimbatore',
    startDate: '2026-11-05',
    endDate: '2026-11-20',
    additionalRequirements: 'Commercial building floor renovation. Must bring proper safety gear.',
    status: 'Approved',
    assignedWorkerIds: ['W002', 'W007', 'W012'],
    groupLeadId: 'W002',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

if (typeof window !== 'undefined' && !localStorage.getItem('sb_mock_bulk')) {
  localStorage.setItem('sb_mock_bulk', JSON.stringify(MOCK_BULK_REQUESTS));
}

/**
 * Submit a bulk hiring request
 */
export async function submitBulkRequest(requestData) {
  const payload = {
    organizationName: requestData.organizationName || requestData.businessName || '',
    businessName: requestData.organizationName || requestData.businessName || '',
    contactPerson: requestData.contactPerson || '',
    contactPhone: requestData.contactPhone || '',
    contactEmail: requestData.contactEmail || '',
    category: requestData.category || (Array.isArray(requestData.categories) ? requestData.categories[0] : 'General'),
    categories: Array.isArray(requestData.categories) ? requestData.categories : [requestData.category].filter(Boolean),
    requiredSkills: Array.isArray(requestData.requiredSkills) ? requestData.requiredSkills : [],
    workersRequired: Number(requestData.workersRequired || requestData.numberOfWorkers || 1),
    numberOfWorkers: Number(requestData.workersRequired || requestData.numberOfWorkers || 1),
    jobLocation: requestData.jobLocation || requestData.location || '',
    location: requestData.jobLocation || requestData.location || '',
    startDate: requestData.startDate || '',
    endDate: requestData.endDate || '',
    additionalRequirements: requestData.additionalRequirements || requestData.description || '',
    description: requestData.additionalRequirements || requestData.description || '',
    status: 'Pending Review',
    assignedWorkerIds: [],
    isDemo: false,
    createdAt: isSimulationMode ? new Date().toISOString() : serverTimestamp(),
    updatedAt: isSimulationMode ? new Date().toISOString() : serverTimestamp()
  };

  if (isSimulationMode) {
    const requests = JSON.parse(localStorage.getItem('sb_mock_bulk') || '[]');
    const requestId = 'BULK_REQ_' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newReq = { requestId, ...payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    requests.unshift(newReq);
    localStorage.setItem('sb_mock_bulk', JSON.stringify(requests));
    return newReq;
  } else {
    try {
      const docRef = await addDoc(collection(db, 'bulkHiringRequests'), payload);
      const requestId = 'BULK_REQ_' + docRef.id.slice(0, 6).toUpperCase();
      await updateDoc(docRef, { requestId, id: docRef.id });
      return { id: docRef.id, requestId, ...payload, createdAt: new Date().toISOString() };
    } catch (error) {
      console.error('Error submitting bulk hiring request:', error);
      throw error;
    }
  }
}

/**
 * Fetch all bulk hiring requests (Admin view)
 */
export async function getAllBulkRequests() {
  if (isSimulationMode) {
    const requests = JSON.parse(localStorage.getItem('sb_mock_bulk') || '[]');
    return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    try {
      // First fetch from bulkHiringRequests
      const colRef = collection(db, 'bulkHiringRequests');
      const snapshot = await getDocs(colRef);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Also read any legacy bulkRequests if they exist and aren't already included
      try {
        const legacySnap = await getDocs(collection(db, 'bulkRequests'));
        legacySnap.docs.forEach(doc => {
          const leg = doc.data();
          const exists = results.some(r => r.requestId === (leg.requestId || doc.id) || r.id === doc.id);
          if (!exists) {
            results.push({
              id: doc.id,
              requestId: leg.requestId || doc.id,
              organizationName: leg.businessName || leg.organizationName || 'Corporate Client',
              contactPerson: leg.contactPerson || 'Business Representative',
              contactPhone: leg.contactPhone || 'N/A',
              contactEmail: leg.contactEmail || 'N/A',
              category: leg.category || (leg.categories && leg.categories[0]) || 'General',
              requiredSkills: leg.requiredSkills || [],
              workersRequired: Number(leg.numberOfWorkers || leg.workersRequired || 1),
              jobLocation: leg.location || leg.jobLocation || 'Site Location',
              startDate: leg.startDate || '',
              endDate: leg.endDate || '',
              additionalRequirements: leg.description || leg.additionalRequirements || '',
              status: leg.status === 'pending' ? 'Pending Review' : (leg.status || 'Pending Review'),
              assignedWorkerIds: leg.assignedWorkerIds || [],
              createdAt: leg.createdAt?.seconds ? new Date(leg.createdAt.seconds * 1000).toISOString() : leg.createdAt,
              updatedAt: leg.updatedAt?.seconds ? new Date(leg.updatedAt.seconds * 1000).toISOString() : leg.updatedAt
            });
          }
        });
      } catch (err) {
        console.warn('Legacy bulk collection check skipped:', err);
      }

      return results.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error fetching bulk hiring requests:', error);
      throw error;
    }
  }
}

/**
 * Update status of a bulk request
 * Valid statuses: 'Pending Review', 'Approved', 'Workers Assigned', 'In Progress', 'Completed', 'Rejected'
 */
export async function updateBulkRequestStatus(requestId, status, additionalPayload = {}) {
  if (isSimulationMode) {
    const requests = JSON.parse(localStorage.getItem('sb_mock_bulk') || '[]');
    const index = requests.findIndex(r => r.requestId === requestId || r.id === requestId);
    if (index !== -1) {
      requests[index] = { ...requests[index], status, ...additionalPayload, updatedAt: new Date().toISOString() };
      localStorage.setItem('sb_mock_bulk', JSON.stringify(requests));
    }
    return true;
  } else {
    try {
      const docRef = doc(db, 'bulkHiringRequests', requestId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await updateDoc(docRef, { 
          status, 
          ...additionalPayload, 
          updatedAt: serverTimestamp() 
        });
      } else {
        // Check by requestId query or legacy bulkRequests
        const allSnap = await getDocs(collection(db, 'bulkHiringRequests'));
        const found = allSnap.docs.find(d => d.data().requestId === requestId);
        if (found) {
          await updateDoc(doc(db, 'bulkHiringRequests', found.id), {
            status,
            ...additionalPayload,
            updatedAt: serverTimestamp()
          });
        } else {
          // Legacy doc
          const legRef = doc(db, 'bulkRequests', requestId);
          await updateDoc(legRef, { status, updatedAt: serverTimestamp() });
        }
      }
      return true;
    } catch (error) {
      console.error('Error updating bulk status:', error);
      throw error;
    }
  }
}

/**
 * Assign multiple workers to a bulk hiring request
 */
export async function assignWorkersToBulkRequest(requestId, workerIds, groupLeadId = null) {
  const updateData = {
    assignedWorkerIds: workerIds,
    status: workerIds.length > 0 ? 'Workers Assigned' : 'Approved'
  };
  if (groupLeadId) {
    updateData.groupLeadId = groupLeadId;
  }
  return updateBulkRequestStatus(requestId, updateData.status, updateData);
}
