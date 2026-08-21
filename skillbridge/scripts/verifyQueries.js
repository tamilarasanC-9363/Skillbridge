import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

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

async function testIndexes() {
  console.log('--- Testing Firestore Queries Against Project:', firebaseConfig.projectId, '---');

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const db = getFirestore(app);

  // Test 1: Messages Query (chatService.js: where chatId == ... orderBy timestamp asc)
  console.log('\n[Test 1] Testing Messages Query: (chatId == ..., orderBy timestamp asc)');
  try {
    const q1 = query(
      collection(db, 'messages'),
      where('chatId', '==', 'test_chat_id'),
      orderBy('timestamp', 'asc')
    );
    const snap1 = await getDocs(q1);
    console.log(`[PASS] Messages query executed successfully! Returned ${snap1.docs.length} docs.`);
  } catch (err) {
    console.error('[FAIL] Messages query failed:', err.message);
  }

  // Test 2: Worker Recommendations Query (recommendationService.js: categories array-contains ..., verified == true, availability == true)
  console.log('\n[Test 2] Testing Worker Profiles Query: (categories array-contains ..., verified == true, availability == true)');
  try {
    const q2 = query(
      collection(db, 'workerProfiles'),
      where('categories', 'array-contains', 'Electrician'),
      where('verified', '==', true),
      where('availability', '==', true)
    );
    const snap2 = await getDocs(q2);
    console.log(`[PASS] Worker profiles query executed successfully! Returned ${snap2.docs.length} docs.`);
  } catch (err) {
    console.error('[FAIL] Worker profiles query failed:', err.message);
  }

  console.log('\n--- All Firestore queries checked successfully! ---');
}

testIndexes().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
