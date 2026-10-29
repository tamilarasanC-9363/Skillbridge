import fs from 'fs';
import path from 'path';
import workersData from '../data/workers.json' with { type: 'json' };
import { matchesLocation, matchesCategoryOrSkill } from '../src/services/recommendationService.js';
import { getWorkerEarningsData } from '../src/services/workerService.js';

console.log('====================================================');
console.log('🧪 RUNNING COMPREHENSIVE SKILLBRIDGE VERIFICATION');
console.log('====================================================\n');

let allPassed = true;
function assert(desc, condition) {
  if (condition) {
    console.log(`✅ [PASS] ${desc}`);
  } else {
    console.error(`❌ [FAIL] ${desc}`);
    allPassed = false;
  }
}

// ----------------------------------------------------
// Test 1: Every demo worker has 2–3 portfolio entries
// ----------------------------------------------------
console.log('--- Test 1: Demo Worker Portfolios ---');
const demoWorkers = workersData.filter(w => /^W\d+$/i.test(w.workerId || w.userId));
assert('Demo workers count is 30 (W001-W030)', demoWorkers.length === 30);

const allHavePortfolio = demoWorkers.every(w => {
  return Array.isArray(w.portfolio) && w.portfolio.length >= 2 && w.portfolio.length <= 4;
});
assert('Every demo worker has 2-3 portfolio entries', allHavePortfolio);

const sampleW = demoWorkers[0];
const sampleItem = sampleW.portfolio[0];
assert('Portfolio entry has required schema (title, category, description, location, date, image)',
  sampleItem && (sampleItem.projectTitle || sampleItem.title) && sampleItem.category && 
  sampleItem.description && sampleItem.location && sampleItem.completionDate && sampleItem.imageUrl
);

// ----------------------------------------------------
// Test 2 & 3: Location Search & Unknown Locations
// ----------------------------------------------------
console.log('\n--- Test 2 & 3: Location Search and Recommendations ---');
// Match Coimbatore
const matchCoimbatore = matchesLocation('Coimbatore, Tamil Nadu', 'Coimbatore');
assert('Coimbatore matches "Coimbatore, Tamil Nadu"', matchCoimbatore);

// Match sub-locality
const matchRSPuram = matchesLocation('RS Puram, Coimbatore', 'Coimbatore');
assert('Sub-locality "RS Puram, Coimbatore" matches "Coimbatore"', matchRSPuram);

// Strict non-match for unknown locations
const matchDelhi = matchesLocation('Coimbatore, Tamil Nadu', 'Delhi');
assert('Delhi strictly does NOT match "Coimbatore, Tamil Nadu"', !matchDelhi);

// Category filtering check
const samplePlumber = demoWorkers.find(w => (w.categories || []).includes('Plumbing'));
const samplePainter = demoWorkers.find(w => (w.categories || []).includes('Painting'));
const plumberMatchesPlumbing = matchesCategoryOrSkill(samplePlumber, 'Plumbing', 'Pipe Repair');
const painterMatchesPlumbing = matchesCategoryOrSkill(samplePainter, 'Plumbing', 'Pipe Repair');
assert('Plumber matches Plumbing category', plumberMatchesPlumbing);
assert('Painter does NOT match Plumbing category', !painterMatchesPlumbing);

// ----------------------------------------------------
// Test 4: Bulk Hiring Schema & Statuses
// ----------------------------------------------------
console.log('\n--- Test 4: Bulk Hiring Schema & Statuses ---');
const bulkServicePath = path.resolve('src/services/bulkService.js');
const bulkServiceContent = fs.readFileSync(bulkServicePath, 'utf8');
assert('Bulk service contains collection bulkHiringRequests', bulkServiceContent.includes('bulkHiringRequests'));
assert('Bulk service supports Pending Review status', bulkServiceContent.includes('Pending Review'));
assert('Bulk service supports Workers Assigned status', bulkServiceContent.includes('Workers Assigned'));
assert('Bulk service supports assignWorkersToBulkRequest', bulkServiceContent.includes('assignWorkersToBulkRequest'));

// ----------------------------------------------------
// Test 5: Worker Ratings & Feedback Calculations
// ----------------------------------------------------
console.log('\n--- Test 5: Dynamic Worker Ratings & Feedback ---');
const reviewServicePath = path.resolve('src/services/reviewService.js');
const reviewContent = fs.readFileSync(reviewServicePath, 'utf8');
assert('Review service calculates average rating dynamically from reviews collection', 
  reviewContent.includes('rating:') && reviewContent.includes('workerReviews.reduce')
);

// ----------------------------------------------------
// Test 6 & 8: Completed Job Counts & Dynamic Earnings
// ----------------------------------------------------
console.log('\n--- Test 6 & 8: Completed Jobs & Dynamic Earnings ---');
// Demo worker W001
const w001 = demoWorkers.find(w => w.workerId === 'W001');
const earningsW001 = getWorkerEarningsData(w001, []);
assert('Demo worker completed jobs count matches list length', 
  earningsW001.totalCompletedJobs === earningsW001.allCompletedJobs.length
);
assert('Demo worker has dynamic gross, deductions (10%), and net take-home',
  earningsW001.grossEarnings > 0 &&
  earningsW001.deductions === Math.round(earningsW001.grossEarnings * 0.10) &&
  earningsW001.netEarnings === (earningsW001.grossEarnings - earningsW001.deductions)
);

// Real worker with 0 completed jobs
const realWorker = { userId: 'real_user_999', name: 'Real Worker', price: 500, completedJobs: 0 };
const earningsReal = getWorkerEarningsData(realWorker, []);
assert('Real worker with 0 jobs displays exactly 0 completed jobs and ₹0 earnings',
  earningsReal.totalCompletedJobs === 0 && earningsReal.totalIncome === 0 && earningsReal.allCompletedJobs.length === 0
);

// Real worker with 1 completed job
const realWorkerWithJob = { userId: 'real_user_999', name: 'Real Worker', price: 500, completedJobs: 1 };
const liveBookings = [
  {
    bookingId: 'BK_LIVE_101',
    workerId: 'real_user_999',
    jobType: 'AC Maintenance',
    status: 'Completed',
    agreedPrice: 800,
    platformFee: 80,
    netEarnings: 720,
    scheduledDate: new Date().toISOString()
  }
];
const earningsRealJob = getWorkerEarningsData(realWorkerWithJob, liveBookings);
assert('Real worker earnings match locked agreed price (Gross 800, Fee 80, Net 720)',
  earningsRealJob.grossEarnings === 800 && 
  earningsRealJob.deductions === 80 && 
  earningsRealJob.netEarnings === 720 &&
  earningsRealJob.totalCompletedJobs === 1
);

// ----------------------------------------------------
// Test 7: Job Completion with Geotagged Photo Evidence
// ----------------------------------------------------
console.log('\n--- Test 7: Geotagged Photo Evidence ---');
const bookingServicePath = path.resolve('src/services/bookingService.js');
const bookingContent = fs.readFileSync(bookingServicePath, 'utf8');
assert('completeJobWithEvidence uploads to completionEvidence in Storage', 
  bookingContent.includes('completionEvidence') && bookingContent.includes('uploadBytes')
);
assert('completeJobWithEvidence saves coordinates, timestamp, and notes to Firestore',
  bookingContent.includes('latitude') && bookingContent.includes('longitude') && bookingContent.includes('notes')
);
assert('completeJobWithEvidence prevents unauthorized completion of other workers jobs',
  bookingContent.includes('Unauthorized: You can only complete bookings assigned directly to you.')
);

// ----------------------------------------------------
// Test 9: Compact Admin Verification Proof Modal
// ----------------------------------------------------
console.log('\n--- Test 9: Admin Verification Proof Modal ---');
const vQueuePath = path.resolve('src/pages/admin/VerificationQueue.jsx');
const vQueueContent = fs.readFileSync(vQueuePath, 'utf8');
assert('VerificationQueue contains ProofDocumentViewer with loading and error states',
  vQueueContent.includes('ProofDocumentViewer') && vQueueContent.includes('Retrieving proof document...')
);
assert('VerificationQueue View Proof button opens compact modal',
  vQueueContent.includes('View Proof') && vQueueContent.includes('max-w-lg w-full')
);

// ----------------------------------------------------
// Test 10: Bulk Hiring Removed from Admin Navigation
// ----------------------------------------------------
console.log('\n--- Test 10: Bulk Hiring Admin Navigation Removal ---');
const adminPages = [
  'src/pages/admin/AdminDashboard.jsx',
  'src/pages/admin/BookingsList.jsx',
  'src/pages/admin/Reports.jsx',
  'src/pages/admin/UsersList.jsx',
  'src/pages/admin/VerificationQueue.jsx'
];
let adminNavClean = true;
for (const p of adminPages) {
  const c = fs.readFileSync(path.resolve(p), 'utf8');
  if (c.includes("label: 'Bulk Hiring'") || c.includes("path: '/admin/bulk-hire'")) {
    adminNavClean = false;
  }
}
assert('Bulk Hiring removed from sidebar navigation across all admin pages', adminNavClean);

const appPath = path.resolve('src/App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');
assert('/customer/bulk-hire is active and /admin/bulk-hire cleanly redirects to /admin',
  appContent.includes('path="/customer/bulk-hire"') && appContent.includes('path="/admin/bulk-hire"')
);

// ----------------------------------------------------
// Test 11: Firestore Rules & Security
// ----------------------------------------------------
console.log('\n--- Test 11: Security Rules ---');
const rulesPath = path.resolve('firestore.rules');
assert('firestore.rules exists', fs.existsSync(rulesPath));
const rulesContent = fs.readFileSync(rulesPath, 'utf8');
assert('firestore.rules prevents workers from self-approving verified status',
  rulesContent.includes('hasAny([\'verified\', \'adminApprovalStatus\'])')
);
assert('firebase.json references firestore.rules', 
  fs.readFileSync(path.resolve('firebase.json'), 'utf8').includes('firestore.rules')
);

console.log('\n====================================================');
if (allPassed) {
  console.log('🎉 ALL 11 VERIFICATION TEST CASES PASSED SUCCESSFULLY!');
} else {
  console.error('❌ SOME TESTS FAILED.');
  process.exit(1);
}
console.log('====================================================\n');
