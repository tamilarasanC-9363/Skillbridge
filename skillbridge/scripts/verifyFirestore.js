import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, getDocs, collection } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

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

async function verify() {
  console.log('--- Checking Firestore "workerProfiles" Collection ---');
  console.log('Project ID:', firebaseConfig.projectId);

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const db = getFirestore(app);

  const snapshot = await getDocs(collection(db, 'workerProfiles'));
  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  console.log(`\nTotal Documents in "workerProfiles": ${docs.length}\n`);

  const csvWorkers = docs.filter((d) => /^W\d+$/i.test(d.id || d.workerId));
  console.log(`CSV Worker Documents (W001 - W030): ${csvWorkers.length} / 30 uploaded\n`);

  console.log('List of Uploaded Workers in Firestore:');
  console.log('-----------------------------------------------------------------------------------------');
  console.log('| ID   | Name               | Category             | Location              | Price | Rating | Jobs | Verified |');
  console.log('-----------------------------------------------------------------------------------------');
  
  csvWorkers.sort((a, b) => (a.workerId || a.id).localeCompare(b.workerId || b.id)).forEach((w) => {
    const id = (w.workerId || w.id || '').padEnd(4);
    const name = (w.name || '').padEnd(18);
    const cat = (w.category || '').padEnd(20);
    const loc = (w.location || '').padEnd(21);
    const pr = `₹${w.price || 0}`.padEnd(5);
    const rat = `${w.rating || 0} (${w.reviewCount || 0})`.padEnd(6);
    const jobs = String(w.completedJobs || 0).padEnd(4);
    const ver = w.verified ? 'Yes' : 'No';
    console.log(`| ${id} | ${name} | ${cat} | ${loc} | ${pr} | ${rat} | ${jobs} | ${ver}      |`);
  });
  console.log('-----------------------------------------------------------------------------------------');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
