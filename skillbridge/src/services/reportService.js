import { db, isSimulationMode } from '../firebase/firebaseConfig.js';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

const INITIAL_DEMO_REPORTS = [
  {
    reportId: 'REP_DEMO_001',
    userId: 'mock_customer_uid',
    userName: 'Karthik Raja',
    userRole: 'customer',
    bookingId: 'BK_HIST_01',
    bookingSummary: 'Plumbing - Pipe Leakage Repair',
    category: 'Payment Problem',
    description: 'Specialist requested ₹200 additional cash payment beyond the agreed contract price for basic sealing washers.',
    urgency: 'Medium',
    status: 'Resolved',
    adminNotes: 'Mediated with service provider. Verified agreed contract rate applied without unapproved surcharges.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    reportId: 'REP_DEMO_002',
    userId: 'mock_customer_uid',
    userName: 'Karthik Raja',
    userRole: 'customer',
    bookingId: 'BK_HIST_02',
    bookingSummary: 'Carpentry - Door Latch Repair',
    category: 'Booking Issue',
    description: 'Worker arrived 90 minutes past the scheduled window without advance chat notification.',
    urgency: 'Low',
    status: 'Under Review',
    adminNotes: 'Support team reached out to tradesman regarding adherence to scheduled arrival windows.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    reportId: 'REP_DEMO_003',
    userId: 'W001',
    userName: 'Ramesh Kumar',
    userRole: 'worker',
    bookingId: 'BK_HIST_03',
    bookingSummary: 'Plumbing - Bathroom Pipe Replacement',
    category: 'Customer Issue',
    description: 'Customer location was inaccessible due to gated society security refusal and customer was unreachable by phone.',
    urgency: 'Medium',
    status: 'Under Review',
    adminNotes: 'Coordinating with customer to confirm access clearance guidelines.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    reportId: 'REP_DEMO_004',
    userId: 'W001',
    userName: 'Ramesh Kumar',
    userRole: 'worker',
    bookingId: 'BK_HIST_04',
    bookingSummary: 'Plumbing - Water Meter Installation',
    category: 'Booking Dispute',
    description: 'Job required heavy commercial excavation that was not specified in the standard residential booking description.',
    urgency: 'High',
    status: 'Pending',
    adminNotes: '',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function getStoredMockReports() {
  if (typeof localStorage === 'undefined') return INITIAL_DEMO_REPORTS;
  const stored = localStorage.getItem('sb_reports');
  if (!stored) {
    localStorage.setItem('sb_reports', JSON.stringify(INITIAL_DEMO_REPORTS));
    return INITIAL_DEMO_REPORTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_DEMO_REPORTS;
  }
}

function saveStoredMockReports(reports) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('sb_reports', JSON.stringify(reports));
  }
}

/**
 * Submit a new incident or dispute report
 */
export async function submitReport({
  userId,
  userName = 'User',
  userRole = 'customer',
  bookingId = null,
  bookingSummary = null,
  category,
  description,
  urgency = 'Medium'
}) {
  if (!userId) throw new Error('User authentication is required to submit a report.');
  if (!category) throw new Error('Please select a dispute or issue category.');
  if (!description || description.trim().length < 10) {
    throw new Error('Please provide a detailed description (minimum 10 characters).');
  }

  const reportId = 'REP_' + Date.now().toString(36).toUpperCase() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = new Date().toISOString();

  const reportData = {
    reportId,
    userId,
    userName,
    userRole,
    bookingId: bookingId || null,
    bookingSummary: bookingSummary || null,
    category,
    description: description.trim(),
    urgency,
    status: 'Pending',
    adminNotes: '',
    createdAt: timestamp,
    updatedAt: timestamp,
    submittedAt: serverTimestamp ? serverTimestamp() : timestamp
  };

  if (isSimulationMode || !db) {
    const list = getStoredMockReports();
    list.unshift(reportData);
    saveStoredMockReports(list);
    return reportData;
  }

  try {
    const docRef = doc(db, 'reports', reportId);
    await setDoc(docRef, reportData);
    
    // Also keep local fallback synced
    const list = getStoredMockReports();
    list.unshift(reportData);
    saveStoredMockReports(list);

    return reportData;
  } catch (error) {
    console.warn('Firestore setDoc failed for report, falling back to local storage:', error.message);
    const list = getStoredMockReports();
    list.unshift(reportData);
    saveStoredMockReports(list);
    return reportData;
  }
}

/**
 * Get all reports submitted by a specific user (customer or worker)
 */
export async function getReportsForUser(userId, role = null) {
  if (!userId) return [];

  if (isSimulationMode || !db) {
    const list = getStoredMockReports();
    return list.filter(r => r.userId === userId || (role && r.userRole === role));
  }

  try {
    const colRef = collection(db, 'reports');
    const q = query(colRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Check fallback mock for demo users
      const list = getStoredMockReports();
      return list.filter(r => r.userId === userId || (role && r.userRole === role));
    }

    const reports = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    reports.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return reports;
  } catch (error) {
    console.warn('Firestore query failed for user reports, using fallback:', error.message);
    const list = getStoredMockReports();
    return list.filter(r => r.userId === userId || (role && r.userRole === role));
  }
}

/**
 * Get all platform reports (Admin view)
 */
export async function getAllReports() {
  if (isSimulationMode || !db) {
    return getStoredMockReports();
  }

  try {
    const colRef = collection(db, 'reports');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return getStoredMockReports();
    }
    const reports = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    reports.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return reports;
  } catch (error) {
    console.warn('Firestore query failed for all reports, using fallback:', error.message);
    return getStoredMockReports();
  }
}

/**
 * Update report status and resolution notes (Admin action)
 */
export async function updateReportStatus(reportId, newStatus, adminNotes = '') {
  const timestamp = new Date().toISOString();

  // Update in local mock
  const list = getStoredMockReports();
  const idx = list.findIndex(r => r.reportId === reportId || r.id === reportId);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      status: newStatus,
      adminNotes: adminNotes || list[idx].adminNotes || '',
      updatedAt: timestamp
    };
    saveStoredMockReports(list);
  }

  if (!isSimulationMode && db) {
    try {
      const docRef = doc(db, 'reports', reportId);
      await updateDoc(docRef, {
        status: newStatus,
        adminNotes: adminNotes || '',
        updatedAt: timestamp
      });
    } catch (error) {
      console.warn('Firestore updateDoc failed for report:', error.message);
    }
  }

  return { reportId, status: newStatus, adminNotes, updatedAt: timestamp };
}

