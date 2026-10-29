import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, collection, getDocs, writeBatch } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

const env = {};
fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const k = trimmed.slice(0, eqIdx).trim();
    let v = trimmed.slice(eqIdx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
});

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
});
const db = getFirestore(app);

// Category project images for portfolios
const PORTFOLIO_IMAGE_POOL = {
  Plumbing: [
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
  ],
  Electrical: [
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=800&q=80'
  ],
  Carpentry: [
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80'
  ],
  Painting: [
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  ],
  Cleaning: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
  ],
  'Mason / Construction': [
    'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'
  ]
};

const PORTFOLIO_TEMPLATES = {
  Plumbing: [
    { title: 'Concealed Pipeline Replacement', desc: 'Complete replacement of aging concealed galvanized pipes with CPVC high-pressure piping.' },
    { title: 'Dual-Flush Cistern & Faucet Fitment', desc: 'Installation of wall-hung WC fixtures and premium quarter-turn taps with pressure regulators.' },
    { title: 'Apartment Sump & Tank Automation', desc: 'Configured automated multi-inlet overhead water storage distribution with overflow bypass valves.' }
  ],
  Electrical: [
    { title: 'Distribution Board & MCB Rewiring', desc: 'Upgraded 3-phase modular distribution panel with RCCB earth leakage protection.' },
    { title: 'Commercial Office LED & Inverter Setup', desc: 'Installed commercial energy-efficient LED panel lighting and 5kVA backup UPS inverter.' },
    { title: 'Residential Short-Circuit Isolation', desc: 'Diagnosed conduit insulation failure, re-pulled fire-retardant wiring across living hall.' }
  ],
  Carpentry: [
    { title: 'Custom Teak Modular Wardrobe', desc: 'Handcrafted floor-to-ceiling 3-door sliding wardrobe with soft-close Blum runners.' },
    { title: 'Solid Teak Main Door Frame & Polish', desc: 'Precision carved traditional entry door installed with multi-point brass security mortise lock.' },
    { title: 'Kitchen Overhead Wall Cabinet Units', desc: 'Built moisture-resistant marine ply overhead cabinets with hydraulic lift hinges.' }
  ],
  Painting: [
    { title: 'Velvet Touch Emulsion Finish', desc: 'Putty leveling, primer application, and dual-coat luxury sheen emulsion for 3BHK flat.' },
    { title: 'Exterior Weatherproof Silicon Coating', desc: 'High-durability antifungal exterior weather guard application on two-story villa facade.' },
    { title: 'Textured Accent Feature Wall', desc: 'Metallic stencil and rustic textured plaster feature wall created for modern living lounge.' }
  ],
  Cleaning: [
    { title: 'Post-Renovation Heavy Debris Clean', desc: 'Comprehensive chemical scrubbing of paint splatters, grout haze removal, and window buffing.' },
    { title: 'Kitchen & Chimney Degreasing Service', desc: 'Industrial steam cleaning and baffle filter decarbonization for commercial residential kitchen.' },
    { title: 'Hospital-Grade Bathroom Sanitization', desc: 'Scale descaling on ceramic tiles, fixture polishing, and high-pressure steam floor disinfection.' }
  ],
  'Mason / Construction': [
    { title: 'Vitrified Floor Tiling & Grouting', desc: 'Precision laser-leveled anti-skid floor tiling with epoxy grouting in master kitchen.' },
    { title: 'Interlocking Paver Driveway & Wall', desc: 'Constructed brick perimeter boundary wall and laid 60mm heavy vehicle interlocking pavers.' },
    { title: 'Structural Plastering & Sealing', desc: 'Repaired cracked exterior masonry with polymer-modified cement mortar and elastomeric basecoat.' }
  ]
};

const REVIEW_COMMENTS = {
  Plumbing: [
    { text: 'Prompt arrival and quickly identified the hidden wall leak without breaking unnecessary tiles. Very impressed!', rating: 5 },
    { text: 'Neat work on replacing the bathroom shower mixer and washbasin drain. Transparent pricing.', rating: 5 },
    { text: 'Fixed our overhead tank overflow sensor and cleaned the main pipeline. Working flawlessly now.', rating: 4 },
    { text: 'Very polite professional. Brought all required fittings and completed the tap replacement in 45 mins.', rating: 5 },
    { text: 'Good job overall. Had to wait 15 minutes due to traffic, but service quality was top notch.', rating: 4 },
    { text: 'Sorted out our persistent kitchen sink drainage blockage. Cleaned up the area after finishing.', rating: 5 },
    { text: 'Fair pricing and reliable workmanship on the toilet flush repair. Will hire again!', rating: 4 }
  ],
  Electrical: [
    { text: 'Excellent diagnosis of recurring tripping MCB breaker. Replaced the faulty fuse box safely.', rating: 5 },
    { text: 'Installed 4 ceiling fans and chandelier with clean conceal wiring. Very skilled electrician.', rating: 5 },
    { text: 'Quick emergency fix for power blackout in our office room. Arrived within 30 minutes!', rating: 5 },
    { text: 'Tested all earthing points and installed inverter changeover switch seamlessly.', rating: 4 },
    { text: 'Professional demeanor and proper safety equipment used while handling high voltage lines.', rating: 5 },
    { text: 'Good work on fitting heavy appliance modular sockets in the kitchen. Recommended.', rating: 4 },
    { text: 'Very thorough inspection. Resolved neutral wire fault that other electricians missed.', rating: 5 }
  ],
  Carpentry: [
    { text: 'Craftsmanship on our bedroom wardrobe sliding track was superb. Moves whisper quiet.', rating: 5 },
    { text: 'Fixed misaligned wooden door latch and planed swollen frames. Perfect fit now.', rating: 4 },
    { text: 'Assembled a complex modular TV entertainment console with great patience and accuracy.', rating: 5 },
    { text: 'Installed kitchen cabinet hydraulic hinges neatly. Good recommendations on timber care.', rating: 5 },
    { text: 'Very disciplined carpenter. Brought professional power tools and left the room spotless.', rating: 5 },
    { text: 'Solid work on repairing wooden dining chairs and reinforcing joint dowels.', rating: 4 },
    { text: 'Master craftsman! Custom shelf fits the wall recess like a glove.', rating: 5 }
  ],
  Painting: [
    { text: 'Flawless roller finish on our living room walls. Edge cut-ins near the ceiling are razor sharp.', rating: 5 },
    { text: 'Protected all furniture with plastic drop sheets and finished two coats ahead of schedule.', rating: 5 },
    { text: 'The texture accent wall turned out even better than the catalog reference. Highly pleased!', rating: 5 },
    { text: 'Good paint application and putty work. Slight paint smell lingered for a day, but finish is great.', rating: 4 },
    { text: 'Super clean painter. Very patient with color mixing and sample patch testing on wall.', rating: 5 },
    { text: 'Waterproofing primer applied thoroughly on exterior damp patches. No bubbles or peeling.', rating: 5 },
    { text: 'Reliable painter who honors commitments. Finished 2BHK repaint within 3 days as promised.', rating: 4 }
  ],
  Cleaning: [
    { text: 'Spectacular deep clean! The kitchen exhaust grease and bathroom limescale were completely gone.', rating: 5 },
    { text: 'Very hard working crew. Cleaned behind refrigerators, under beds, and scrubbed window tracks.', rating: 5 },
    { text: 'Floor scrubbing machine left our marble floors sparkling like new. Well worth the price.', rating: 5 },
    { text: 'Thorough sofa shampooing and stain extraction. Dried out quickly without any chemical odor.', rating: 4 },
    { text: 'Punctual, organized, and followed our special requests for pet-friendly cleaning agents.', rating: 5 },
    { text: 'Post-renovation dust cleaning was handled efficiently. Delivered what was promised.', rating: 4 },
    { text: 'Deep sanitization service done with great attention to detail. Courteous staff.', rating: 5 }
  ],
  'Mason / Construction': [
    { text: 'Leveled and laid vitrified tiles with absolute zero hollow sound. Perfectly sloped for drainage.', rating: 5 },
    { text: 'Sturdy brick masonry work for our garden terrace boundary. Mixed cement ratio correctly.', rating: 5 },
    { text: 'Fast demolition of non-loadbearing partition and cleared debris neatly.', rating: 4 },
    { text: 'Repaired concrete honeycomb patch on driveway with industrial bond mortar. Rock solid.', rating: 5 },
    { text: 'Very experienced mason who gave valuable advice on waterproofing additives.', rating: 5 },
    { text: 'Quality wall plastering with smooth sponge finish. Ready for direct paint application.', rating: 5 },
    { text: 'Punctual contractor with skilled laborers. Completed tile installation within budget.', rating: 4 }
  ]
};

const CLIENT_NAMES = [
  'Aravind Ramanathan', 'Sunita Sundaresan', 'Vikramaditya Rao', 'Preeti Nair',
  'Karthikeyan Balaji', 'Ananya Krishnamurthy', 'Deepak Chandran', 'Radhika Menon',
  'Gowtham Subramanian', 'Meenakshi Iyer', 'Siddharth Natarajan', 'Shalini Swaminathan',
  'Rajagopalan V', 'Divya Padmanabhan', 'Murali Krishna', 'Bhavani Shankar'
];

async function seed() {
  console.log('=== Starting SkillBridge Fast Batch Seeding ===');

  const workersSnap = await getDocs(collection(db, 'workerProfiles'));
  const workers = workersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Loaded ${workers.length} worker profiles from Firestore.`);

  const demoWorkers = workers.filter(w => /^W\d+$/i.test(w.workerId || w.id));
  console.log(`Processing ${demoWorkers.length} demo workers (W001 - W030)...`);

  const reviewsSnap = await getDocs(collection(db, 'reviews'));
  const existingReviews = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Existing reviews: ${existingReviews.length}`);

  let batch = writeBatch(db);
  let opCount = 0;
  const commitBatchIfNeeded = async (force = false) => {
    if (force && opCount > 0) {
      await batch.commit();
      batch = writeBatch(db);
      opCount = 0;
    } else if (opCount >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      opCount = 0;
    }
  };

  const updatedWorkersList = [];

  for (let idx = 0; idx < demoWorkers.length; idx++) {
    const w = demoWorkers[idx];
    const cat = w.category || (w.categories && w.categories[0]) || 'Plumbing';
    const imgPool = PORTFOLIO_IMAGE_POOL[cat] || PORTFOLIO_IMAGE_POOL.Plumbing;
    const tplPool = PORTFOLIO_TEMPLATES[cat] || PORTFOLIO_TEMPLATES.Plumbing;
    const revPool = REVIEW_COMMENTS[cat] || REVIEW_COMMENTS.Plumbing;

    const workerSeed = idx * 7 + (w.workerId?.charCodeAt(w.workerId.length - 1) || 0);

    // 1. Portfolio items (2 to 3)
    const portfolio = [0, 1, 2].map(pIdx => {
      const template = tplPool[pIdx % tplPool.length];
      const img = imgPool[(pIdx + workerSeed) % imgPool.length];
      const daysAgo = 20 + pIdx * 35 + (workerSeed % 15);
      const compDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      return {
        projectTitle: `${template.title} - ${w.location?.split(',')[0] || 'Local'}`,
        category: cat,
        description: template.desc,
        location: w.location || 'Coimbatore, Tamil Nadu',
        completionDate: compDate,
        imageUrl: img,
        isDemoPortfolio: true
      };
    });

    // 2. Reviews
    const workerReviews = existingReviews.filter(r => r.workerId === w.workerId || r.workerId === w.id);
    let workerRatingSum = 0;
    let totalReviewsForWorker = 0;

    if (workerReviews.length < 6) {
      const needed = 6 - workerReviews.length;
      for (let rIdx = 0; rIdx < needed; rIdx++) {
        const revTpl = revPool[(rIdx + workerSeed) % revPool.length];
        const client = CLIENT_NAMES[(rIdx * 3 + workerSeed) % CLIENT_NAMES.length];
        const daysAgo = 5 + rIdx * 14 + (workerSeed % 10);
        const revDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

        const revDocRef = doc(collection(db, 'reviews'));
        const newRev = {
          reviewId: revDocRef.id,
          workerId: w.workerId || w.id,
          customerId: `demo_cust_${(rIdx + workerSeed) % 100 + 1}`,
          customerName: client,
          bookingId: `demo_bk_${(w.workerId || w.id).toLowerCase()}_${rIdx + 1}`,
          rating: revTpl.rating,
          comment: revTpl.text,
          createdAt: revDate,
          isDemo: true
        };

        batch.set(revDocRef, newRev);
        opCount++;
        workerRatingSum += revTpl.rating;
        totalReviewsForWorker++;
      }
    }

    workerReviews.forEach(r => {
      workerRatingSum += Number(r.rating || 5);
      totalReviewsForWorker++;
    });

    const calculatedRating = totalReviewsForWorker > 0
      ? Number((workerRatingSum / totalReviewsForWorker).toFixed(1))
      : 4.8;

    const workerDocRef = doc(db, 'workerProfiles', w.id);
    const workerUpdate = {
      portfolio,
      rating: calculatedRating,
      reviewCount: totalReviewsForWorker
    };
    batch.update(workerDocRef, workerUpdate);
    opCount++;

    updatedWorkersList.push({
      ...w,
      ...workerUpdate
    });

    await commitBatchIfNeeded();
  }

  // 3. Seed Bulk Hiring Requests
  const bulkRequestsData = [
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
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      requestId: 'BULK_REQ_002',
      organizationName: 'Ganga Hospital Healthcare Campus',
      contactPerson: 'Dr. Radhakrishnan',
      contactPhone: '9443217890',
      contactEmail: 'admin@gangahospital.demo',
      category: 'Cleaning',
      requiredSkills: ['Home Deep Cleaning', 'Bathroom Cleaning', 'Post-Construction Cleaning'],
      workersRequired: 15,
      jobLocation: 'Ram Nagar, Coimbatore',
      startDate: '2026-11-01',
      endDate: '2026-11-10',
      additionalRequirements: 'Hospital block sanitization and deep floor scrub.',
      status: 'In Progress',
      assignedWorkerIds: ['W005', 'W010', 'W015', 'W017', 'W018'],
      groupLeadId: 'W018',
      isDemo: true,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      requestId: 'BULK_REQ_003',
      organizationName: 'Sobha Developers Luxury Enclave',
      contactPerson: 'Karthik Varma',
      contactPhone: '9789012345',
      contactEmail: 'procurement@sobhagroup.demo',
      category: 'Mason / Construction',
      requiredSkills: ['Brick Wall Construction', 'Cement Work', 'Tile Installation', 'Plastering'],
      workersRequired: 25,
      jobLocation: 'Ukkadam, Coimbatore',
      startDate: '2026-11-15',
      endDate: '2026-12-15',
      additionalRequirements: 'Large residential staffing group with designated master mason group lead for 25 crew members.',
      status: 'Workers Assigned',
      assignedWorkerIds: ['W008', 'W014'],
      groupLeadId: 'W008',
      groupDetails: {
        leadWorkerId: 'W008',
        leadWorkerName: 'Dinesh V',
        managedCrewSize: 25,
        tradeTitle: 'Master Mason Crew'
      },
      isDemo: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      requestId: 'BULK_REQ_004',
      organizationName: 'Brookefields Retail Mall',
      contactPerson: 'Meera Nambiar',
      contactPhone: '9840551122',
      contactEmail: 'facilities@brookefieldsmall.demo',
      category: 'Plumbing',
      requiredSkills: ['Pipe Installation', 'Water Tank Installation', 'Drain Blockage'],
      workersRequired: 6,
      jobLocation: 'RS Puram, Coimbatore',
      startDate: '2026-11-10',
      endDate: '2026-11-25',
      additionalRequirements: 'Plumbing riser replacement for food court outlets.',
      status: 'Pending Review',
      assignedWorkerIds: [],
      isDemo: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      requestId: 'BULK_REQ_005',
      organizationName: 'Kovai Medical Center & Hospital',
      contactPerson: 'Bala Chandran',
      contactPhone: '9884012399',
      contactEmail: 'operations@kmch.demo',
      category: 'Painting',
      requiredSkills: ['Interior Wall Painting', 'Exterior Painting', 'Waterproof Coating'],
      workersRequired: 12,
      jobLocation: 'Avinashi Road, Coimbatore',
      startDate: '2026-10-10',
      endDate: '2026-10-25',
      additionalRequirements: 'Anti-bacterial paint coating for nursing wards.',
      status: 'Completed',
      assignedWorkerIds: ['W004', 'W009'],
      groupLeadId: 'W004',
      isDemo: true,
      createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      requestId: 'BULK_REQ_006',
      organizationName: 'Titan Corporate Design Studio',
      contactPerson: 'Priyanka Menon',
      contactPhone: '9962001144',
      contactEmail: 'p.menon@titancorp.demo',
      category: 'Carpentry',
      requiredSkills: ['Cabinet Installation', 'Custom Furniture', 'Door Installation'],
      workersRequired: 5,
      jobLocation: 'Saibaba Colony, Coimbatore',
      startDate: '2026-11-12',
      endDate: '2026-11-22',
      additionalRequirements: 'Custom oak display cabinetry and sliding doors.',
      status: 'Approved',
      assignedWorkerIds: ['W003', 'W013'],
      groupLeadId: 'W003',
      isDemo: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      requestId: 'BULK_REQ_007',
      organizationName: 'Prestige Gateway Logistics Park',
      contactPerson: 'Anand Swaminathan',
      contactPhone: '9841098765',
      contactEmail: 'admin@prestigelogistics.demo',
      category: 'Electrical',
      requiredSkills: ['Wiring Installation', 'Short-Circuit Troubleshooting'],
      workersRequired: 20,
      jobLocation: 'Tambaram, Chennai',
      startDate: '2026-11-20',
      endDate: '2026-12-05',
      additionalRequirements: 'Warehouse high-bay cabling.',
      status: 'Rejected',
      rejectionReason: 'Worker capacity in requested timeframe exceeds regional electrical availability.',
      assignedWorkerIds: [],
      isDemo: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const req of bulkRequestsData) {
    const docRef = doc(db, 'bulkHiringRequests', req.requestId);
    batch.set(docRef, req);
    opCount++;
  }

  await commitBatchIfNeeded(true);
  console.log('Committed all batch updates to Firestore!');

  // Sync to local json files
  console.log('Writing updated dataset to local json files...');
  const dataPath = path.join(__dirname, '..', 'data', 'workers.json');
  const srcDataPath = path.join(__dirname, '..', 'src', 'data', 'workers.json');

  // Load existing or base workers
  let currentJson = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const updateMap = new Map(updatedWorkersList.map(w => [w.workerId || w.id, w]));
  currentJson = currentJson.map(w => updateMap.get(w.workerId || w.id) || w);

  fs.writeFileSync(dataPath, JSON.stringify(currentJson, null, 2), 'utf8');
  fs.writeFileSync(srcDataPath, JSON.stringify(currentJson, null, 2), 'utf8');

  console.log('=== Batch Seeding Completed Successfully! ===');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
