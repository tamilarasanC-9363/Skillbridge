import { db, isSimulationMode } from '../firebase/firebaseConfig.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { generateDefaultAIReport } from './aiVerificationService.js';
import workersData from '../../data/workers.json' with { type: 'json' };

const CSV_WORKERS = workersData.map((w) => ({
  ...w,
  aiAuditReport: generateDefaultAIReport(w.name, 'Government Identity Proof', `id_${w.workerId.toLowerCase()}.jpg`)
}));

// Fallback seed workers for Local Simulation Mode
// Includes all 30 CSV imported workers
export const MOCK_WORKERS = [
  ...CSV_WORKERS,
  {
    userId: 'worker1',
    name: 'Ramesh Kumar',
    email: 'ramesh.kumar@skillbridge.demo',
    profileImageUrl: null,
    categories: ['Plumbing'],
    skills: ['Pipe Leakage Repair', 'Tap / Faucet Repair', 'Water Tank Installation'],
    experience: 5,
    location: 'Chennai Central',
    availability: true,
    rating: 4.9,
    reviewCount: 15,
    completedJobs: 24,
    verified: true,
    priceRange: '₹300 – ₹700',
    bio: 'Professional plumber with 5+ years of experience in residential leakage repair and faucet installations.',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    aiAuditReport: generateDefaultAIReport('Ramesh Kumar', 'Government Identity Proof', 'aadhaar_ramesh_kumar.jpg'),
    createdAt: new Date()
  },
  {
    userId: 'worker2',
    name: 'Kumar Swamy',
    email: 'kumar.swamy@skillbridge.demo',
    profileImageUrl: null,
    categories: ['Plumbing'],
    skills: ['Pipe Leakage Repair', 'Toilet Repair', 'Drain Blockage'],
    experience: 4,
    location: 'Chennai Central',
    availability: true,
    rating: 4.7,
    reviewCount: 12,
    completedJobs: 18,
    verified: true,
    priceRange: '₹400 – ₹800',
    bio: 'Specialist in toilet and drainage repair works. Fast response and quality service guaranteed.',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    aiAuditReport: generateDefaultAIReport('Kumar Swamy', 'Government Identity Proof', 'voter_id_kumar_swamy.jpg'),
    createdAt: new Date()
  },
  {
    userId: 'worker3',
    name: 'Arun Prasath',
    email: 'arun.prasath@skillbridge.demo',
    profileImageUrl: null,
    categories: ['Plumbing'],
    skills: ['Pipe Leakage Repair', 'Pipe Installation'],
    experience: 6,
    location: 'Adyar',
    availability: true,
    rating: 4.4,
    reviewCount: 8,
    completedJobs: 11,
    verified: true,
    priceRange: '₹500 – ₹1000',
    bio: 'Experienced pipe installation expert. Available for all home plumbing maintenance.',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    aiAuditReport: generateDefaultAIReport('Arun Prasath', 'Government Identity Proof', 'id_proof_arun.jpg'),
    createdAt: new Date()
  },
  {
    userId: 'worker4',
    name: 'Manoj Singh',
    email: 'manoj.singh@skillbridge.demo',
    profileImageUrl: null,
    categories: ['Electrical'],
    skills: ['Wiring Installation', 'Short-Circuit Troubleshooting', 'MCB / DB Repair'],
    experience: 8,
    location: 'Chennai Central',
    availability: true,
    rating: 4.8,
    reviewCount: 22,
    completedJobs: 35,
    verified: true,
    priceRange: '₹500 – ₹1200',
    bio: 'Licensed electrician specializing in troubleshooting and home rewiring. Safety first.',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    aiAuditReport: generateDefaultAIReport('Manoj Singh', 'Government Identity Proof', 'national_id_manoj.jpg'),
    createdAt: new Date()
  },
  {
    userId: 'worker5',
    name: 'Suresh Raina',
    email: 'suresh.raina@skillbridge.demo',
    profileImageUrl: null,
    categories: ['Cleaning'],
    skills: ['Home Deep Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning'],
    experience: 3,
    location: 'Adyar',
    availability: true,
    rating: 4.6,
    reviewCount: 9,
    completedJobs: 15,
    verified: true,
    priceRange: '₹400 – ₹900',
    bio: 'Professional cleaner for home and office spaces. Eco-friendly cleaning products used.',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    aiAuditReport: generateDefaultAIReport('Suresh Raina', 'Trade & Vocational Certificate', 'hygiene_cert_suresh.jpg'),
    createdAt: new Date().toISOString()
  },
  {
    userId: 'worker6',
    name: 'Karthik Varma',
    email: 'karthik.varma@skillbridge.demo',
    profileImageUrl: null,
    categories: ['Painting'],
    skills: ['Interior Painting', 'Exterior Painting', 'Wall Putty Detailing'],
    experience: 4,
    location: 'Chennai Central',
    availability: true,
    rating: 4.8,
    reviewCount: 7,
    completedJobs: 11,
    verified: true,
    priceRange: '₹500 – ₹1200',
    bio: 'Professional painter with 4 years experience in residential interior repainting, waterproofing, and texture walls.',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    aiAuditReport: generateDefaultAIReport('Karthik Varma', 'Government Identity Proof', 'aadhaar_karthik.jpg'),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userId: 'worker7',
    name: 'Dinesh Raj',
    email: 'dinesh.raj@skillbridge.demo',
    profileImageUrl: null,
    categories: ['Carpentry'],
    skills: ['Door Repair', 'Custom Cabinetry', 'Modular Kitchen Fittings'],
    experience: 6,
    location: 'Adyar',
    availability: true,
    rating: 4.7,
    reviewCount: 9,
    completedJobs: 14,
    verified: true,
    priceRange: '₹450 – ₹1000',
    bio: 'Master carpenter specializing in solid wood door installations, hinge replacements, and bespoke kitchen storage.',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    aiAuditReport: generateDefaultAIReport('Dinesh Raj', 'Government Identity Proof', 'voter_id_dinesh.jpg'),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userId: 'worker8',
    name: 'Vikram Sen',
    email: 'vikram.sen@skillbridge.demo',
    profileImageUrl: null,
    categories: ['Mason / Construction'],
    skills: ['Brick Wall Construction', 'Wall Repair', 'Cement Work', 'Demolition Work'],
    experience: 8,
    location: 'Chennai Central',
    availability: true,
    rating: 4.9,
    reviewCount: 16,
    completedJobs: 29,
    verified: true,
    priceRange: '₹600 – ₹2000',
    bio: 'Experienced construction mason specializing in brickwork, partition wall builds, plastering, and plaster repairs.',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    aiAuditReport: generateDefaultAIReport('Vikram Sen', 'Government Identity Proof', 'aadhaar_vikram.jpg'),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userId: 'worker_unverified_1',
    name: 'Rajesh Khanna',
    email: 'rajesh.khanna@skillbridge.demo',
    profileImageUrl: null,
    categories: ['Painting'],
    skills: ['Interior Painting', 'Wall Putty Detailing'],
    experience: 3,
    location: 'Chennai Central',
    availability: true,
    rating: 0,
    reviewCount: 0,
    completedJobs: 0,
    verified: false,
    priceRange: '₹400 – ₹1000',
    bio: 'Residential painting applicator seeking verification for home interior coatings.',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    aiAuditReport: generateDefaultAIReport('Rajesh Khanna', 'Government Identity Proof', 'aadhaar_rajesh_khanna.jpg'),
    createdAt: new Date().toISOString()
  },
  {
    userId: 'worker_unverified_2',
    name: 'Ganesh Acharya',
    email: 'ganesh.acharya@skillbridge.demo',
    profileImageUrl: null,
    categories: ['Carpentry'],
    skills: ['Furniture Assembly', 'Custom Cabinetry'],
    experience: 5,
    location: 'Adyar',
    availability: true,
    rating: 0,
    reviewCount: 0,
    completedJobs: 0,
    verified: false,
    priceRange: '₹500 – ₹1200',
    bio: 'Specialist in custom wooden wardrobe design and modular kitchen cabinetry layout.',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    aiAuditReport: generateDefaultAIReport('Ganesh Acharya', 'Trade & Skill Certificate', 'woodwork_cert_ganesh.jpg'),
    createdAt: new Date().toISOString()
  }
];

// Seed initial workers to localStorage if empty or missing emails / AI reports
if (typeof window !== 'undefined') {
  const currentMock = JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
  const hasAIReports = currentMock.length > 0 && currentMock.every(w => w.aiAuditReport && w.email);
  if (!hasAIReports || currentMock.length < MOCK_WORKERS.length) {
    localStorage.setItem('sb_mock_workers', JSON.stringify(MOCK_WORKERS));
  }
}

/**
 * Returns a ranked list of workers for a given job.
 * @param {string} categoryName - The category (e.g. "Plumbing")
 * @param {string} jobType - The selected job (e.g., "Pipe Leakage Repair")
 * @param {string} customerLocation - Customer's entered location (text)
 * @returns {Promise<Array>} - Sorted array of worker objects with `recommendationScore`
 */
export async function getRecommendedWorkers(categoryName, jobType, customerLocation) {
  let workers;

  if (isSimulationMode) {
    // Local simulation retrieval
    const stored = localStorage.getItem('sb_mock_workers');
    const allWorkers = stored ? JSON.parse(stored) : MOCK_WORKERS;
    
    // Filter: matching category, verified, available
    workers = allWorkers.filter(w => 
      w.categories.includes(categoryName) && 
      w.verified === true && 
      w.availability === true
    );
  } else {
    // Live Firebase Firestore query
    try {
      const q = query(
        collection(db, 'workerProfiles'),
        where('categories', 'array-contains', categoryName),
        where('verified', '==', true),
        where('availability', '==', true)
      );
      const snapshot = await getDocs(q);
      workers = snapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching workers from Firestore:', error);
      return [];
    }
  }

  // Calculate scores and rank
  const scoredWorkers = workers.map(worker => {
    // 1. Rating Score: normalized (0-5 -> 0-1) * 35%
    const ratingVal = worker.rating || 0;
    const ratingScore = (ratingVal / 5.0) * 0.35;

    // 2. Skill Match Score: exact job match is 1.0, otherwise 0.5 * 25%
    const hasExactSkill = worker.skills && worker.skills.includes(jobType);
    const skillScore = (hasExactSkill ? 1.0 : 0.5) * 0.25;

    // 3. Availability Score: (availability ? 1 : 0) * 15%
    const availabilityScore = (worker.availability ? 1.0 : 0.0) * 0.15;

    // 4. Location Proximity Score: text match or distance * 15%
    let locationScore;
    if (customerLocation && worker.location) {
      const cLoc = customerLocation.toLowerCase().trim();
      const wLoc = worker.location.toLowerCase().trim();
      if (wLoc.includes(cLoc) || cLoc.includes(wLoc)) {
        locationScore = 1.0;
      } else {
        // Partial text match (split into words)
        const cWords = cLoc.split(/\s+/);
        const wWords = wLoc.split(/\s+/);
        const overlap = cWords.filter(w => wWords.includes(w));
        locationScore = overlap.length > 0 ? 0.6 : 0.1;
      }
    } else {
      locationScore = 0.5; // Neutral default if not provided
    }
    const finalLocationScore = locationScore * 0.15;

    // 5. Experience Score: normalized (Math.min(worker.experience, 10) / 10) * 10%
    const expVal = Number(worker.experience) || 0;
    const experienceScore = (Math.min(expVal, 10) / 10.0) * 0.10;

    // Total Score
    const totalScore = ratingScore + skillScore + availabilityScore + finalLocationScore + experienceScore;

    return {
      ...worker,
      recommendationScore: totalScore,
      ratingScore,
      skillScore,
      availabilityScore,
      locationScore: finalLocationScore,
      experienceScore
    };
  });

  // Sort by recommendationScore descending
  scoredWorkers.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return scoredWorkers;
}
