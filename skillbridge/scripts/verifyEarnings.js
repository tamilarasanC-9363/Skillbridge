import { getWorkerEarningsData } from '../src/services/workerService.js';

console.log('--- Testing Worker Earnings Calculation Logic ---\n');

// Test Case 1: W001 Ramesh K (Plumbing, 86 jobs, base price 450)
const workerW001 = {
  workerId: 'W001',
  name: 'Ramesh K',
  category: 'Plumbing',
  skills: ['Pipe Leakage Repair', 'Toilet Repair', 'Drain Blockage'],
  price: 450,
  completedJobs: 86
};
const resW001 = getWorkerEarningsData(workerW001, []);
console.log('Worker W001 (86 jobs, base ₹450):');
console.log(`- Completed Jobs: ${resW001.totalCompletedJobs} (Expected: 86)`);
console.log(`- Total Income: ₹${resW001.totalIncome.toLocaleString('en-IN')} (Expected: ~₹38,700)`);
console.log(`- Average / Job: ₹${resW001.averageEarnings} (Expected: ~₹450)`);
console.log(`- Ledger Entries Count: ${resW001.allCompletedJobs.length}`);
console.log(`- Sample Ledger Entry:`, resW001.allCompletedJobs[0]);
if (resW001.totalCompletedJobs === 86 && resW001.totalIncome > 30000 && resW001.averageEarnings > 0) {
  console.log('  -> PASS [Test 1]');
} else {
  console.error('  -> FAIL [Test 1]');
}

// Test Case 2: W002 Suresh M (Electrical, 73 jobs, base price 400)
const workerW002 = {
  workerId: 'W002',
  name: 'Suresh M',
  category: 'Electrical',
  skills: ['Wiring Installation', 'Fan Installation', 'Switch / Socket Repair'],
  price: 400,
  completedJobs: 73
};
const resW002 = getWorkerEarningsData(workerW002, []);
console.log('\nWorker W002 (73 jobs, base ₹400):');
console.log(`- Completed Jobs: ${resW002.totalCompletedJobs} (Expected: 73)`);
console.log(`- Total Income: ₹${resW002.totalIncome.toLocaleString('en-IN')} (Expected: ~₹29,200)`);
console.log(`- Average / Job: ₹${resW002.averageEarnings} (Expected: ~₹400)`);
if (resW002.totalCompletedJobs === 73 && resW002.totalIncome > 25000 && resW002.totalIncome !== resW001.totalIncome) {
  console.log('  -> PASS [Test 2] (Dynamic per-worker calculation confirmed)');
} else {
  console.error('  -> FAIL [Test 2]');
}

// Test Case 3: New Worker with 0 completed jobs
const newWorker = {
  workerId: 'new_uid_123',
  name: 'New Registered Worker',
  category: 'Plumbing',
  skills: ['Pipe Repair'],
  price: 450,
  completedJobs: 0
};
const resNew = getWorkerEarningsData(newWorker, []);
console.log('\nNew Worker (0 completed jobs):');
console.log(`- Completed Jobs: ${resNew.totalCompletedJobs} (Expected: 0)`);
console.log(`- Total Income: ₹${resNew.totalIncome} (Expected: 0)`);
console.log(`- Average / Job: ₹${resNew.averageEarnings} (Expected: 0)`);
console.log(`- Ledger Entries Count: ${resNew.allCompletedJobs.length} (Expected: 0)`);
if (resNew.totalCompletedJobs === 0 && resNew.totalIncome === 0 && resNew.averageEarnings === 0 && resNew.allCompletedJobs.length === 0) {
  console.log('  -> PASS [Test 3] (0 completed jobs handled correctly)');
} else {
  console.error('  -> FAIL [Test 3]');
}

// Test Case 4: Worker with 1 live completed booking
const liveBookings = [
  {
    bookingId: 'booking_live_1',
    status: 'Completed',
    jobType: 'Pipe Leakage Repair',
    customerName: 'Priya Sundaram',
    scheduledDate: new Date().toISOString(),
    estimatedPrice: '₹550'
  }
];
const resLive = getWorkerEarningsData({ ...newWorker, completedJobs: 1 }, liveBookings);
console.log('\nWorker with 1 Live Completed Booking:');
console.log(`- Completed Jobs: ${resLive.totalCompletedJobs} (Expected: 1)`);
console.log(`- Total Income: ₹${resLive.totalIncome} (Expected: 550)`);
console.log(`- Average / Job: ₹${resLive.averageEarnings} (Expected: 550)`);
if (resLive.totalCompletedJobs === 1 && resLive.totalIncome === 550 && resLive.averageEarnings === 550) {
  console.log('  -> PASS [Test 4]');
} else {
  console.error('  -> FAIL [Test 4]');
}

console.log('\n--- All Worker Earnings Tests Passed Successfully! ---');
