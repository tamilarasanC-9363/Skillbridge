import { db, isSimulationMode } from '../firebase/firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';
import { generateDefaultAIReport } from './aiVerificationService.js';
import workersData from '../data/workers.json' with { type: 'json' };

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

// Normalization & Fuzzy Matching Utilities
const STOP_WORDS = new Set([
  'and', 'or', 'the', 'in', 'at', 'of', 'for', 'with', 'a', 'an', 'to', 'on', 'near', 'by', 'all', 'any'
]);

const GENERIC_ACTION_WORDS = new Set([
  'repair', 'repairs', 'repairing', 'repaired',
  'install', 'instal', 'installation', 'installations', 'installing', 'installed',
  'fix', 'fixing', 'fixes', 'fixed',
  'service', 'services', 'servicing',
  'maintenance', 'work', 'works', 'working',
  'deep', 'general', 'home', 'labor', 'specialist'
]);

const DOMAIN_CATEGORY_MAP = {
  plumb: 'Plumbing',
  electr: 'Electrical',
  carpent: 'Carpentry',
  paint: 'Painting',
  clean: 'Cleaning',
  mason: 'Mason / Construction',
  construct: 'Mason / Construction',
  plaster: 'Mason / Construction',
  tile: 'Mason / Construction',
  brick: 'Mason / Construction',
  cement: 'Mason / Construction'
};

const DOMAIN_STEMS = {
  plumbing: 'plumb', plumber: 'plumb', plumbers: 'plumb',
  electrical: 'electr', electrician: 'electr', electricians: 'electr', electricity: 'electr',
  carpentry: 'carpent', carpenter: 'carpent', carpenters: 'carpent',
  painting: 'paint', painter: 'paint', painters: 'paint',
  cleaning: 'clean', cleaner: 'clean', cleaners: 'clean',
  masonry: 'mason', mason: 'mason', masons: 'mason',
  construction: 'construct', contractor: 'contract',
  plastering: 'plaster', plaster: 'plaster', plastered: 'plaster', plasters: 'plaster',
  wiring: 'wire', wire: 'wire', wires: 'wire',
  leakage: 'leak', leak: 'leak', leaks: 'leak', leaking: 'leak',
  faucet: 'tap', faucets: 'tap', tap: 'tap', taps: 'tap',
  toilet: 'toilet', toilets: 'toilet',
  drainage: 'drain', drain: 'drain', drains: 'drain',
  switch: 'switch', switches: 'switch',
  repair: 'repair', repairs: 'repair', repairing: 'repair', repaired: 'repair',
  install: 'instal', installation: 'instal', installing: 'instal', installed: 'instal'
};

export function normalizeText(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesLocation(workerLoc, searchLoc) {
  if (!searchLoc || !searchLoc.trim()) return true;
  if (!workerLoc || !workerLoc.trim()) return false;

  const normSearch = normalizeText(searchLoc);
  const normWorker = normalizeText(workerLoc);

  if (normWorker.includes(normSearch) || normSearch.includes(normWorker)) {
    return true;
  }

  const LOC_FILLER = new Set(['in', 'at', 'near', 'by', 'district', 'dist', 'city', 'area', 'state', 'india', 'road', 'street']);
  const searchTokens = normSearch.split(/[\s,]+/).filter(t => t.length >= 3 && !LOC_FILLER.has(t));
  const workerTokens = normWorker.split(/[\s,]+/).filter(t => t.length >= 3 && !LOC_FILLER.has(t));

  for (const sToken of searchTokens) {
    for (const wToken of workerTokens) {
      if (sToken === wToken || sToken.includes(wToken) || wToken.includes(sToken)) {
        return true;
      }
    }
  }

  if (normSearch.includes('tamil nadu') && (normWorker.includes('coimbatore') || normWorker.includes('chennai') || normWorker.includes('tamil nadu'))) {
    return true;
  }
  if (normSearch.includes('kerala') && (normWorker.includes('kochi') || normWorker.includes('ernakulam') || normWorker.includes('thrissur') || normWorker.includes('kozhikode') || normWorker.includes('kottayam') || normWorker.includes('kerala'))) {
    return true;
  }

  return false;
}

export function matchesCategoryOrSkill(worker, categoryName, jobType) {
  const normCat = normalizeText(categoryName);
  const normJob = normalizeText(jobType);

  const wCats = (Array.isArray(worker.categories) ? worker.categories : [worker.category])
    .filter(Boolean)
    .map(c => normalizeText(c));
  const wSkills = (Array.isArray(worker.skills) ? worker.skills : String(worker.skills || '').split(';'))
    .filter(Boolean)
    .map(s => normalizeText(s));

  // If a category was chosen, worker MUST belong to that trade category
  if (normCat) {
    let catMatched = wCats.some(c => c === normCat || c.includes(normCat) || normCat.includes(c));

    if (!catMatched) {
      if ((normCat.includes('mason') || normCat.includes('construct') || normCat.includes('plaster') || normCat.includes('tile')) &&
          wCats.some(c => c.includes('mason') || c.includes('construct'))) {
        catMatched = true;
      } else if (normCat.includes('plumb') && wCats.some(c => c.includes('plumb'))) {
        catMatched = true;
      } else if (normCat.includes('electr') && wCats.some(c => c.includes('electr'))) {
        catMatched = true;
      } else if (normCat.includes('carpent') && wCats.some(c => c.includes('carpent'))) {
        catMatched = true;
      } else if (normCat.includes('paint') && wCats.some(c => c.includes('paint'))) {
        catMatched = true;
      } else if (normCat.includes('clean') && wCats.some(c => c.includes('clean'))) {
        catMatched = true;
      }
    }

    // Strictly exclude workers who do not belong to the requested category
    if (!catMatched) {
      return false;
    }

    // Category matched! If no specific job requested, worker is valid.
    if (!normJob) return true;

    // Check specific skill match
    const jobMatched = wSkills.some(s => s === normJob || s.includes(normJob) || normJob.includes(s));
    if (jobMatched) return true;

    const jobTokens = tokenize(normJob).filter(t => !GENERIC_ACTION_WORDS.has(t) && t.length >= 3);
    if (jobTokens.length > 0) {
      for (const skill of wSkills) {
        const sTokens = tokenize(skill);
        if (jobTokens.some(jt => sTokens.includes(jt))) {
          return true;
        }
      }
    }

    return true;
  }

  // If no category was specified, match by jobType
  if (normJob) {
    const jobMatched = wSkills.some(s => s === normJob || s.includes(normJob) || normJob.includes(s));
    if (jobMatched) return true;

    const jobTokens = tokenize(normJob).filter(t => !GENERIC_ACTION_WORDS.has(t));
    if (jobTokens.length > 0) {
      for (const skill of wSkills) {
        const sTokens = tokenize(skill);
        if (jobTokens.some(jt => sTokens.includes(jt))) {
          return true;
        }
      }
    }
  }

  return false;
}

export function stemWord(word) {
  if (!word || word.length < 3) return word;
  if (DOMAIN_STEMS[word]) return DOMAIN_STEMS[word];
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('es') && word.length > 4 && (word.endsWith('shes') || word.endsWith('ches') || word.endsWith('sses') || word.endsWith('xes'))) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
}

export function tokenize(text) {
  const norm = normalizeText(text);
  if (!norm) return [];
  return norm.split(' ').filter(w => w && !STOP_WORDS.has(w)).map(stemWord);
}

/**
 * Calculates a multi-factor recommendation score (0-100) for a worker.
 * Considers:
 * - Skill & category match (0-40)
 * - Location proximity & token match (0-25)
 * - Verification status (5-15)
 * - Rating (0-10)
 * - Experience (0-5)
 * - Completed jobs (0-5)
 * - Availability (1-5)
 */
function scoreWorker(worker, categoryName, jobType, customerLocation) {
  const normCategory = normalizeText(categoryName);
  const normJob = normalizeText(jobType);
  const normLoc = normalizeText(customerLocation);

  const queryStrings = [normJob, normCategory].filter(Boolean);
  const combinedQuery = queryStrings.join(' ');
  const queryTokens = Array.from(new Set(tokenize(combinedQuery)));

  // Normalize worker categories, skills, and location
  const wCategories = (Array.isArray(worker.categories) ? worker.categories : [worker.category]).filter(Boolean);
  const wSkills = (Array.isArray(worker.skills) ? worker.skills : String(worker.skills || '').split(';')).map(s => s.trim()).filter(Boolean);
  const wBioNorm = normalizeText(worker.bio || '');

  let skillScore = 0;
  let matchReason = '';

  // 1. Skill Matching (Check both jobType and category against all worker skills)
  for (const skill of wSkills) {
    const sNorm = normalizeText(skill);
    const sTokens = tokenize(skill);

    // Exact or substring match on jobType or category
    if (normJob && (sNorm === normJob || sNorm.includes(normJob) || normJob.includes(sNorm))) {
      skillScore = Math.max(skillScore, 40);
      matchReason = `Direct skill match: "${skill}"`;
      break;
    }
    if (normCategory && (sNorm === normCategory || sNorm.includes(normCategory) || normCategory.includes(sNorm))) {
      skillScore = Math.max(skillScore, 38);
      matchReason = `Skill matched category: "${skill}"`;
      break;
    }

    // Token overlap between query and worker skill
    const overlap = queryTokens.filter(t => sTokens.includes(t) || sTokens.some(st => st.includes(t) || t.includes(st)));
    const substantiveOverlap = overlap.filter(t => !GENERIC_ACTION_WORDS.has(t));

    if (substantiveOverlap.length > 0) {
      const tokenScore = 30 + Math.min(8, substantiveOverlap.length * 4);
      if (tokenScore > skillScore) {
        skillScore = tokenScore;
        matchReason = `Keyword match in skill: "${skill}" (${substantiveOverlap.join(', ')})`;
      }
    } else if (overlap.length > 0 && skillScore < 8) {
      skillScore = 8;
      matchReason = matchReason || `Action word overlap in skill: "${skill}"`;
    }
  }

  // 2. Category Matching
  for (const cat of wCategories) {
    const cNorm = normalizeText(cat);
    const cTokens = tokenize(cat);

    if (normCategory && (cNorm === normCategory || cNorm.includes(normCategory) || normCategory.includes(cNorm))) {
      if (skillScore < 32) {
        skillScore = Math.max(skillScore, 32);
        matchReason = matchReason || `Category matched: "${cat}"`;
      }
    } else if (normJob && (cNorm === normJob || cNorm.includes(normJob) || normJob.includes(cNorm))) {
      if (skillScore < 32) {
        skillScore = Math.max(skillScore, 32);
        matchReason = matchReason || `Category matched job: "${cat}"`;
      }
    }

    const overlap = queryTokens.filter(t => cTokens.includes(t) || cTokens.some(ct => ct.includes(t) || t.includes(ct)));
    const substantiveOverlap = overlap.filter(t => !GENERIC_ACTION_WORDS.has(t));
    if (substantiveOverlap.length > 0 && skillScore < 28) {
      skillScore = Math.max(skillScore, 28);
      matchReason = matchReason || `Keyword match in category: "${cat}" (${substantiveOverlap.join(', ')})`;
    }
  }

  // Domain synonym mapping (e.g. plaster -> Mason / Construction, wire -> Electrical, pipe -> Plumbing)
  for (const t of queryTokens) {
    if (DOMAIN_CATEGORY_MAP[t]) {
      const expectedCat = DOMAIN_CATEGORY_MAP[t];
      if (wCategories.some(c => c.toLowerCase().includes(expectedCat.toLowerCase()) || expectedCat.toLowerCase().includes(c.toLowerCase()))) {
        if (skillScore < 26) {
          skillScore = 26;
          matchReason = matchReason || `Domain aligned with ${expectedCat}`;
        }
      }
    }
  }

  // 3. Bio / Broad Domain Fallback Matching
  if (skillScore === 0) {
    const bioTokens = tokenize(wBioNorm);
    const bioOverlap = queryTokens.filter(t => bioTokens.includes(t) && !GENERIC_ACTION_WORDS.has(t));
    if (bioOverlap.length > 0) {
      skillScore = 15;
      matchReason = `Mentioned in bio (${bioOverlap.join(', ')})`;
    }
  }

  // 4. Strict Location Matching & Scoring (0 or 25 pts)
  const isLocMatched = matchesLocation(worker.location, customerLocation);
  let locationScore;
  let locationReason;

  if (normLoc) {
    if (isLocMatched) {
      locationScore = 25;
      locationReason = 'Direct locality match';
    } else {
      locationScore = 0;
      locationReason = 'Outside requested locality';
    }
  } else {
    locationScore = 15;
    locationReason = 'No customer location specified';
  }

  // 5. Verification Status (15 pts if verified, 5 pts if unverified)
  const isVerified = worker.verified === true || String(worker.verified).toLowerCase() === 'true';
  const verifyScore = isVerified ? 15 : 5;

  // 6. Rating (0 - 10 pts)
  const ratingVal = Number(worker.rating) || 0;
  const ratingScore = ratingVal > 0 ? (Math.min(5, ratingVal) / 5) * 10 : 6;

  // 7. Experience (0 - 5 pts)
  const expVal = Number(worker.experience || worker.experienceYears || 0);
  const expScore = (Math.min(10, Math.max(0, expVal)) / 10) * 5;

  // 8. Completed Jobs (0 - 5 pts)
  const jobsVal = Number(worker.completedJobs || 0);
  const jobsScore = (Math.min(100, Math.max(0, jobsVal)) / 100) * 5;

  // 9. Availability (5 pts if available, 1 pt if unavailable)
  const isAvail = worker.availability === true || String(worker.availability).toLowerCase() === 'available' || String(worker.availability).toLowerCase() === 'true';
  const availScore = isAvail ? 5 : 1;

  // Total Score (out of 100)
  const totalScore = skillScore + locationScore + verifyScore + ratingScore + expScore + jobsScore + availScore;

  // Strict relevance check: Must genuinely satisfy category/skill AND location
  const isCatOrSkillMatched = matchesCategoryOrSkill(worker, categoryName, jobType);
  const isGenuineMatch = isLocMatched && isCatOrSkillMatched && (skillScore >= 20 || isCatOrSkillMatched);

  const normalizedWorker = {
    ...worker,
    userId: worker.userId || worker.workerId || worker.id,
    workerId: worker.workerId || worker.userId || worker.id,
    name: worker.name || 'Trade Specialist',
    category: wCategories[0] || 'General Service',
    categories: wCategories,
    skills: wSkills,
    location: worker.location || 'Location upon request',
    availability: isAvail,
    verified: isVerified,
    rating: ratingVal,
    reviewCount: Number(worker.reviewCount || worker.reviews || 0),
    experience: expVal,
    completedJobs: jobsVal,
    priceRange: worker.priceRange || (worker.price ? `₹${worker.price} – ₹${Number(worker.price) + 200}` : '₹300 – ₹700'),
    recommendationScore: Number(totalScore.toFixed(1)),
    skillScore,
    locationScore,
    verifyScore,
    ratingScore,
    experienceScore: expScore,
    completedJobsScore: jobsScore,
    availabilityScore: availScore,
    matchReason: isGenuineMatch ? (matchReason ? `${matchReason} • ${locationReason}` : locationReason) : (!isLocMatched ? 'Excluded: Location does not match' : 'Excluded: Category/skills do not match'),
    isRelevant: isGenuineMatch
  };

  return normalizedWorker;
}

/**
 * Returns a ranked list of workers for a given job.
 * @param {string} categoryName - The category (e.g. "Plumbing", "Mason / Construction")
 * @param {string} jobType - The selected job (e.g., "Plastering", "Pipe Leakage Repair")
 * @param {string} customerLocation - Customer's entered location (e.g. "Coimbatore", "Coimbatore, Tamil Nadu")
 * @returns {Promise<Array>} - Sorted array of worker objects with `recommendationScore`
 */
export async function getRecommendedWorkers(categoryName, jobType, customerLocation) {
  let allWorkers;

  if (isSimulationMode) {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('sb_mock_workers') : null;
    allWorkers = stored ? JSON.parse(stored) : MOCK_WORKERS;
  } else {
    try {
      const snapshot = await getDocs(collection(db, 'workerProfiles'));
      allWorkers = snapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() }));
      if (allWorkers.length === 0) {
        allWorkers = MOCK_WORKERS;
      }
    } catch (error) {
      console.warn('Firestore fetch error, falling back to local dataset:', error);
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('sb_mock_workers') : null;
      allWorkers = stored ? JSON.parse(stored) : MOCK_WORKERS;
    }
  }

  if (!allWorkers || allWorkers.length === 0) {
    allWorkers = MOCK_WORKERS;
  }

  // Calculate scores and evaluate strict relevance for all workers
  const scoredWorkers = allWorkers.map(w => scoreWorker(w, categoryName, jobType, customerLocation));

  // Filter only workers that genuinely satisfy both the location and service criteria
  const matchedWorkers = scoredWorkers.filter(w => w.isRelevant);

  // Sort by recommendationScore descending
  matchedWorkers.sort((a, b) => b.recommendationScore - a.recommendationScore);

  // Debugging logs for search query, selected location, worker count, and filtering results
  const normCategory = normalizeText(categoryName);
  const normJob = normalizeText(jobType);
  const normLoc = normalizeText(customerLocation);

  console.group(`🔍 [SkillBridge Matcher] Query: "${jobType || ''}" | Domain: "${categoryName || ''}" | Loc: "${customerLocation || ''}"`);
  console.log('1. Customer Query:', { category: categoryName, jobType, location: customerLocation });
  console.log('2. Normalized Query:', { normCategory, normJob, normLoc });
  console.log('3. Workers in Database:', allWorkers.length);
  console.log('4. Workers Matching Criteria:', matchedWorkers.length);
  if (matchedWorkers.length > 0) {
    console.log('5. Top Matched Specialists:');
    matchedWorkers.slice(0, 5).forEach((w, i) => {
      console.log(`   #${i + 1} [Score: ${w.recommendationScore}] ${w.name} | Cat: ${w.category} | Loc: ${w.location} | Match: ${w.matchReason}`);
    });
  } else {
    console.log('5. No workers matched search criteria for location:', customerLocation);
  }
  console.log('6. All Worker Filtering Audit:', scoredWorkers.map(w => ({
    workerId: w.workerId || w.userId,
    name: w.name,
    category: w.category,
    location: w.location,
    score: w.recommendationScore,
    status: w.isRelevant ? 'MATCHED' : 'REJECTED',
    reason: w.matchReason
  })));
  console.groupEnd();

  return matchedWorkers;
}
