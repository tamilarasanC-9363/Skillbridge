import { db, isSimulationMode } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Fallback seed workers for Local Simulation Mode
const MOCK_WORKERS = [
  {
    userId: 'worker1',
    name: 'Ramesh Kumar',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
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
    createdAt: new Date()
  },
  {
    userId: 'worker2',
    name: 'Kumar Swamy',
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
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
    createdAt: new Date()
  },
  {
    userId: 'worker3',
    name: 'Arun Prasath',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
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
    createdAt: new Date()
  },
  {
    userId: 'worker4',
    name: 'Manoj Singh',
    profileImageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
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
    createdAt: new Date()
  },
  {
    userId: 'worker5',
    name: 'Suresh Raina',
    profileImageUrl: 'https://images.unsplash.com/photo-1520341280432-4749d4d7bcf9?w=150',
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
    createdAt: new Date().toISOString()
  },
  {
    userId: 'worker6',
    name: 'Karthik Varma',
    profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    categories: ['Painting'],
    skills: ['Interior Painting', 'Exterior Painting', 'Wall Putty Detailing'],
    experience: 4,
    location: 'Chennai Central',
    availability: true,
    rating: 0,
    reviewCount: 0,
    completedJobs: 0,
    verified: false,
    priceRange: '₹500 – ₹1200',
    bio: 'Professional painter with 4 years experience in residential interior repainting, waterproofing, and texture walls.',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userId: 'worker7',
    name: 'Dinesh Raj',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    categories: ['Carpentry'],
    skills: ['Door Repair', 'Custom Cabinetry', 'Modular Kitchen Fittings'],
    experience: 6,
    location: 'Adyar',
    availability: true,
    rating: 0,
    reviewCount: 0,
    completedJobs: 0,
    verified: false,
    priceRange: '₹450 – ₹1000',
    bio: 'Master carpenter specializing in solid wood door installations, hinge replacements, and bespoke kitchen storage.',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Seed initial workers to localStorage if empty or outdated
if (typeof window !== 'undefined') {
  const currentMock = JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
  const hasUnverified = currentMock.some(w => !w.verified);
  if (!hasUnverified) {
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
  let workers = [];

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
    let locationScore = 0;
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
