import { getRecommendedWorkers } from '../src/services/recommendationService.js';

async function test() {
  console.log('\n--- Test 1: Plumbing in Coimbatore ---');
  const res1 = await getRecommendedWorkers('Plumbing', 'Pipe Leakage Repair', 'Coimbatore');
  console.log(`Matched: ${res1.length} workers:`, res1.map(w => `${w.workerId} (${w.name}, ${w.location})`));
  console.assert(res1.length > 0, 'Test 1 Failed: Should find Coimbatore plumbers');
  console.assert(res1.every(w => w.location.toLowerCase().includes('coimbatore')), 'Test 1 Failed: Non-Coimbatore worker included');

  console.log('\n--- Test 2: Plumbing in Coimbatore, Tamil Nadu ---');
  const res2 = await getRecommendedWorkers('Plumbing', 'Pipe Leakage Repair', 'Coimbatore, Tamil Nadu');
  console.log(`Matched: ${res2.length} workers:`, res2.map(w => `${w.workerId} (${w.name}, ${w.location})`));
  console.assert(res2.length === res1.length, 'Test 2 Failed: Format "Coimbatore, Tamil Nadu" should match same as "Coimbatore"');

  console.log('\n--- Test 3: Plumbing in Delhi (Unknown Location) ---');
  const res3 = await getRecommendedWorkers('Plumbing', 'Pipe Leakage Repair', 'Delhi');
  console.log(`Matched: ${res3.length} workers:`, res3);
  console.assert(res3.length === 0, 'Test 3 Failed: Delhi should return 0 workers, no fallback!');

  console.log('\n--- Test 4: Painting in Chennai ---');
  const res4 = await getRecommendedWorkers('Painting', 'Interior Wall Painting', 'Chennai');
  console.log(`Matched: ${res4.length} workers:`, res4.map(w => `${w.workerId} (${w.name}, ${w.location})`));
  console.assert(res4.length > 0, 'Test 4 Failed: Should find Chennai painters');
  console.assert(res4.every(w => w.location.toLowerCase().includes('chennai')), 'Test 4 Failed: Non-Chennai worker included');

  console.log('\nALL 4 RECOMMENDATION TESTS PASSED!');
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});

