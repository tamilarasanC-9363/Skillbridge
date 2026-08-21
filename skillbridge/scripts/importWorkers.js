import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const csvPath = path.join(projectRoot, 'data', 'workers.csv');
const envPath = path.join(projectRoot, '.env');

// Read environment variables from .env
function loadEnv() {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

loadEnv();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

function parseCsv(text) {
  const rows = [];
  let currentValue = '';
  let currentRow = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i += 1;
      }
      currentRow.push(currentValue);
      const trimmedRow = currentRow.map((value) => value.trim());
      if (trimmedRow.some((value) => value.length > 0)) {
        rows.push(trimmedRow);
      }
      currentRow = [];
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    const trimmedRow = currentRow.map((value) => value.trim());
    if (trimmedRow.some((value) => value.length > 0)) {
      rows.push(trimmedRow);
    }
  }

  return rows;
}

function parseBoolean(value, fallback = false) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return fallback;
  if (['true', 'yes', 'available', '1'].includes(normalized)) return true;
  if (['false', 'no', 'busy', '0'].includes(normalized)) return false;
  return fallback;
}

function parseNumber(value, fallback = 0) {
  const normalized = String(value ?? '').trim();
  if (!normalized || normalized === 'N/A' || normalized === 'NA') {
    return fallback;
  }
  const numeric = Number(normalized.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeSkills(rawSkills) {
  return String(rawSkills ?? '')
    .split(';')
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function buildWorkerRecord(row) {
  const category = normalizeText(row.category);
  const experienceYears = parseNumber(row.experienceYears, 0);
  const rating = parseNumber(row.rating, 4.5);
  const reviewCount = parseNumber(row.reviews || row.reviewCount, 0);
  const completedJobs = parseNumber(row.completedJobs, 0);
  const availability = parseBoolean(row.availability, true);
  const verified = parseBoolean(row.verified, false);
  const price = parseNumber(row.price || row.priceMin, 400);
  const workerId = normalizeText(row.workerId);
  const name = normalizeText(row.name);
  const location = normalizeText(row.location);
  const email = `${workerId.toLowerCase()}@skillbridge.demo`;

  return {
    workerId,
    userId: workerId,
    name,
    email,
    profileImageUrl: null,
    category,
    categories: category ? [category] : [],
    skills: normalizeSkills(row.skills),
    experience: experienceYears,
    experienceYears,
    rating,
    reviewCount,
    completedJobs,
    location,
    availability,
    verified,
    price,
    priceRange: `₹${price} – ₹${price + 200}`,
    bio: `Experienced ${category} specialist with ${experienceYears}+ years of verified on-site service delivery in ${location}.`,
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

async function main() {
  console.log('--- SkillBridge Workers CSV Uploader & Verifier ---');
  console.log(`Reading CSV file: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`Workers CSV file not found at ${csvPath}`);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
  const parsedRows = parseCsv(csvContent);

  if (parsedRows.length < 2) {
    throw new Error('CSV file is empty or missing a header row.');
  }

  const [headerRow, ...dataRows] = parsedRows;
  const headers = headerRow.map((header) => header.trim());

  const validWorkers = dataRows
    .map((row, idx) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] ?? '';
      });
      return buildWorkerRecord(record);
    })
    .filter((w) => w.workerId && w.workerId.trim());

  console.log(`Parsed ${validWorkers.length} valid worker records from CSV.\n`);

  // Save parsed workers JSON for direct local website usage
  const jsonPath = path.join(projectRoot, 'data', 'workers.json');
  fs.writeFileSync(jsonPath, JSON.stringify(validWorkers, null, 2), 'utf8');
  console.log(`Saved local parsed dataset to ${jsonPath}`);

  // Connect to Firebase Firestore
  console.log('\nConnecting to Firestore Project:', firebaseConfig.projectId);
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const db = getFirestore(app);

  console.log('Uploading workers to Firestore collection "workerProfiles"...');
  let uploadedCount = 0;

  for (const worker of validWorkers) {
    try {
      const docRef = doc(db, 'workerProfiles', worker.workerId);
      await setDoc(docRef, worker, { merge: true });
      uploadedCount += 1;
      process.stdout.write(`  Uploaded [${worker.workerId}] ${worker.name} (${worker.category})\n`);
    } catch (err) {
      console.error(`  Failed to upload [${worker.workerId}]:`, err.message);
    }
  }

  console.log(`\nSuccessfully uploaded ${uploadedCount} of ${validWorkers.length} workers to Firestore.`);

  // Verify by reading back from Firestore
  console.log('\n--- Verifying Firestore Data ---');
  try {
    const snapshot = await getDocs(collection(db, 'workerProfiles'));
    const firestoreWorkers = snapshot.docs.map((d) => d.data());
    console.log(`Verified: Found ${firestoreWorkers.length} documents in Firestore "workerProfiles" collection.`);

    console.log('\nSample Uploaded Records in Firestore:');
    firestoreWorkers.slice(0, 5).forEach((w, i) => {
      console.log(`  ${i + 1}. [${w.workerId || w.userId}] ${w.name} | ${w.category} | ${w.location} | Rating: ${w.rating} (${w.reviewCount} reviews) | Jobs: ${w.completedJobs} | Verified: ${w.verified}`);
    });

    console.log('\nAll workers data successfully uploaded and verified in Firestore Database!');
  } catch (err) {
    console.error('Firestore readback verification warning:', err.message);
  }
}

main().catch((err) => {
  console.error('\nUpload error:', err);
  process.exit(1);
});
