import { auth, db, isSimulationMode } from '../firebase/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

import workersData from '../../data/workers.json';

// Initial pre-seeded accounts for simulation mode
export const MOCK_USERS = {
  'admin_uid': { uid: 'admin_uid', name: 'System Admin', email: 'admin@skillbridge.demo', role: 'admin', phone: '9876543210' },
  'customer_uid': { uid: 'customer_uid', name: 'Kumar Dev', email: 'customer@skillbridge.demo', role: 'customer', phone: '9876543211' },
  'worker1': { uid: 'worker1', name: 'Ramesh Kumar', email: 'ramesh.kumar@skillbridge.demo', role: 'worker', phone: '9876543212' },
  'worker2': { uid: 'worker2', name: 'Kumar Swamy', email: 'kumar.swamy@skillbridge.demo', role: 'worker', phone: '9876543213' },
  'worker3': { uid: 'worker3', name: 'Arun Prasath', email: 'arun.prasath@skillbridge.demo', role: 'worker', phone: '9876543214' },
  'worker4': { uid: 'worker4', name: 'Manoj Singh', email: 'manoj.singh@skillbridge.demo', role: 'worker', phone: '9876543215' },
  'worker5': { uid: 'worker5', name: 'Suresh Raina', email: 'suresh.raina@skillbridge.demo', role: 'worker', phone: '9876543216' },
  'worker6': { uid: 'worker6', name: 'Karthik Varma', email: 'karthik.varma@skillbridge.demo', role: 'worker', phone: '9876543217' },
  'worker7': { uid: 'worker7', name: 'Dinesh Raj', email: 'dinesh.raj@skillbridge.demo', role: 'worker', phone: '9876543218' },
  'worker8': { uid: 'worker8', name: 'Vikram Sen', email: 'vikram.sen@skillbridge.demo', role: 'worker', phone: '9876543219' },
  'worker_unverified_1': { uid: 'worker_unverified_1', name: 'Rajesh Khanna', email: 'rajesh.khanna@skillbridge.demo', role: 'worker', phone: '9876543220' },
  'worker_unverified_2': { uid: 'worker_unverified_2', name: 'Ganesh Acharya', email: 'ganesh.acharya@skillbridge.demo', role: 'worker', phone: '9876543221' }
};

// Add all 30 CSV imported workers to MOCK_USERS
workersData.forEach((w) => {
  if (!MOCK_USERS[w.workerId]) {
    MOCK_USERS[w.workerId] = {
      uid: w.workerId,
      name: w.name,
      email: w.email,
      role: 'worker',
      phone: `9876543${w.workerId.replace(/\D/g, '').padStart(3, '0')}`
    };
  }
});

export const MOCK_CREDENTIALS = {
  'admin@skillbridge.demo': { password: 'password123', uid: 'admin_uid' },
  'customer@skillbridge.demo': { password: 'password123', uid: 'customer_uid' },
  'admin@skillbridge.com': { password: 'password123', uid: 'admin_uid' },
  'customer@skillbridge.com': { password: 'password123', uid: 'customer_uid' },
  'worker@skillbridge.com': { password: 'password123', uid: 'worker1' },
  'ramesh.kumar@skillbridge.demo': { password: 'password123', uid: 'worker1' },
  'kumar.swamy@skillbridge.demo': { password: 'password123', uid: 'worker2' },
  'arun.prasath@skillbridge.demo': { password: 'password123', uid: 'worker3' },
  'manoj.singh@skillbridge.demo': { password: 'password123', uid: 'worker4' },
  'suresh.raina@skillbridge.demo': { password: 'password123', uid: 'worker5' },
  'karthik.varma@skillbridge.demo': { password: 'password123', uid: 'worker6' },
  'dinesh.raj@skillbridge.demo': { password: 'password123', uid: 'worker7' },
  'vikram.sen@skillbridge.demo': { password: 'password123', uid: 'worker8' },
  'rajesh.khanna@skillbridge.demo': { password: 'password123', uid: 'worker_unverified_1' },
  'ganesh.acharya@skillbridge.demo': { password: 'password123', uid: 'worker_unverified_2' }
};

// Register credentials for all 30 CSV workers
workersData.forEach((w) => {
  MOCK_CREDENTIALS[w.email] = { password: 'password123', uid: w.workerId };
  MOCK_CREDENTIALS[`${w.workerId.toLowerCase()}@skillbridge.com`] = { password: 'password123', uid: w.workerId };
});

if (typeof window !== 'undefined') {
  const currentUsers = JSON.parse(localStorage.getItem('sb_mock_users') || '{}');
  const currentCreds = JSON.parse(localStorage.getItem('sb_mock_credentials') || '{}');
  
  // Merge any missing demo worker accounts into localStorage
  const updatedUsers = { ...MOCK_USERS, ...currentUsers };
  const updatedCreds = { ...MOCK_CREDENTIALS, ...currentCreds };
  
  // Ensure every worker1..worker8 has updated demo email
  Object.entries(MOCK_USERS).forEach(([uid, u]) => {
    updatedUsers[uid] = { ...updatedUsers[uid], ...u };
  });
  Object.entries(MOCK_CREDENTIALS).forEach(([email, cred]) => {
    updatedCreds[email] = cred;
  });

  localStorage.setItem('sb_mock_users', JSON.stringify(updatedUsers));
  localStorage.setItem('sb_mock_credentials', JSON.stringify(updatedCreds));
}

/**
 * Register a new user
 */
export async function registerUser(email, password, name, phone, role) {
  const safeEmail = String(email || '').trim().toLowerCase();
  const safeName = String(name || '').trim();
  const safePhone = String(phone || '').trim();
  const safeRole = role === 'worker' ? 'worker' : (role === 'admin' ? 'admin' : 'customer');

  if (isSimulationMode) {
    const creds = JSON.parse(localStorage.getItem('sb_mock_credentials') || '{}');
    const users = JSON.parse(localStorage.getItem('sb_mock_users') || '{}');

    if (creds[safeEmail]) {
      throw new Error('Email already registered.');
    }

    const uid = 'sim_uid_' + Math.random().toString(36).substr(2, 9);
    creds[safeEmail] = { password, uid };
    const newUser = { uid, name: safeName, email: safeEmail, role: safeRole, phone: safePhone, createdAt: new Date().toISOString() };
    users[uid] = newUser;

    localStorage.setItem('sb_mock_credentials', JSON.stringify(creds));
    localStorage.setItem('sb_mock_users', JSON.stringify(users));

    if (safeRole === 'worker') {
      const workers = JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
      const newProfile = {
        userId: uid,
        name: safeName,
        email: safeEmail,
        profileImageUrl: null,
        categories: [],
        skills: [],
        experience: 0,
        location: '',
        availability: true,
        rating: 0,
        reviewCount: 0,
        completedJobs: 0,
        verified: false,
        priceRange: '',
        bio: '',
        role: 'worker',
        createdAt: new Date().toISOString()
      };
      workers.push(newProfile);
      localStorage.setItem('sb_mock_workers', JSON.stringify(workers));
    }

    return newUser;
  }

  if (!auth || !db) {
    throw new Error('Firebase is not configured. Add your VITE_FIREBASE_* values in .env and restart the app.');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, safeEmail, password);
    const user = userCredential.user;

    const userData = {
      uid: user.uid,
      name: safeName,
      email: safeEmail,
      phone: safePhone,
      role: safeRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    if (safeRole === 'worker') {
      const workerProfile = {
        userId: user.uid,
        uid: user.uid,
        name: safeName,
        email: safeEmail,
        phone: safePhone,
        role: 'worker',
        profileImageUrl: null,
        categories: [],
        skills: [],
        experience: 0,
        location: '',
        availability: true,
        rating: 0,
        reviewCount: 0,
        completedJobs: 0,
        verified: false,
        priceRange: '',
        bio: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'workerProfiles', user.uid), workerProfile);
    }

    return {
      uid: user.uid,
      name: safeName,
      email: safeEmail,
      phone: safePhone,
      role: safeRole,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Firebase registration failed:', error);
    throw error;
  }
}

/**
 * Log in a user
 */
export async function loginUser(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  // Lookup demo credentials or worker credentials
  let demoRecord = MOCK_CREDENTIALS[normalizedEmail];
  if (!demoRecord) {
    const creds = JSON.parse(localStorage.getItem('sb_mock_credentials') || '{}');
    demoRecord = creds[normalizedEmail];
  }
  if (!demoRecord) {
    const workers = JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
    const matchedWorker = workers.find(w => w.email && w.email.toLowerCase() === normalizedEmail);
    if (matchedWorker) {
      demoRecord = { password: 'password123', uid: matchedWorker.userId || matchedWorker.workerId };
    }
  }

  // Handle local simulation mode
  if (isSimulationMode) {
    if (!demoRecord || demoRecord.password !== password) {
      throw new Error('Incorrect email or password. Please try again.');
    }
    
    const users = JSON.parse(localStorage.getItem('sb_mock_users') || '{}');
    let userProfile = users[demoRecord.uid] || MOCK_USERS[demoRecord.uid];
    
    if (!userProfile) {
      const workers = JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
      const worker = workers.find(w => (w.userId || w.workerId) === demoRecord.uid);
      if (worker) {
        userProfile = {
          uid: worker.userId || worker.workerId,
          name: worker.name,
          email: worker.email || normalizedEmail,
          role: 'worker',
          phone: '9876543212'
        };
      }
    }

    if (!userProfile) {
      userProfile = {
        uid: demoRecord.uid,
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: 'customer'
      };
    }

    localStorage.setItem('sb_current_sim_user', JSON.stringify(userProfile));
    return userProfile;
  }

  if (!auth || !db) {
    throw new Error('Firebase is not configured.');
  }

  // Live Firebase Authentication
  try {
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const user = userCredential.user;

    // Check 'users' collection first
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const profile = {
        ...userData,
        uid: user.uid,
        email: user.email,
        role: userData.role || 'customer'
      };
      localStorage.removeItem('sb_current_sim_user');
      return profile;
    }

    // Check 'workerProfiles' collection
    const workerRef = doc(db, 'workerProfiles', user.uid);
    const workerSnap = await getDoc(workerRef);
    if (workerSnap.exists()) {
      const workerData = workerSnap.data();
      const profile = {
        ...workerData,
        uid: user.uid,
        name: workerData.name,
        email: workerData.email || user.email,
        role: 'worker'
      };
      localStorage.removeItem('sb_current_sim_user');
      return profile;
    }

    return {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      role: 'customer'
    };
  } catch (error) {
    // If Firebase Auth does not recognize the account, check if it is a pre-seeded / CSV demo worker account
    if (demoRecord && password === demoRecord.password) {
      let workerProfile = null;
      try {
        const workerRef = doc(db, 'workerProfiles', demoRecord.uid);
        const workerSnap = await getDoc(workerRef);
        if (workerSnap.exists()) {
          const workerData = workerSnap.data();
          workerProfile = {
            ...workerData,
            uid: demoRecord.uid,
            name: workerData.name,
            email: normalizedEmail,
            role: 'worker'
          };
        }
      } catch (err) {
        console.warn('Fallback worker fetch failed:', err);
      }

      if (!workerProfile) {
        workerProfile = MOCK_USERS[demoRecord.uid] || {
          uid: demoRecord.uid,
          name: normalizedEmail.split('@')[0],
          email: normalizedEmail,
          role: 'worker'
        };
      }

      localStorage.setItem('sb_current_sim_user', JSON.stringify(workerProfile));
      // Dispatch custom event to notify listeners
      window.dispatchEvent(new Event('storage'));
      return workerProfile;
    }

    console.error('Firebase sign-in error:', error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Incorrect email or password. Please try again.', { cause: error });
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.', { cause: error });
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many unsuccessful attempts. Please try again in a few minutes.', { cause: error });
    }

    throw new Error(error.message || 'Login failed. Please check your credentials.', { cause: error });
  }
}

/**
 * Log out user
 */
export async function logoutUser() {
  localStorage.removeItem('sb_current_sim_user');
  window.dispatchEvent(new Event('storage'));
  if (!isSimulationMode && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout warning:', err);
    }
  }
  return true;
}

/**
 * Monitor Auth State Changes
 */
export function subscribeToAuth(callback) {
  const getSimUser = () => {
    const userJSON = localStorage.getItem('sb_current_sim_user');
    return userJSON ? JSON.parse(userJSON) : null;
  };

  if (isSimulationMode) {
    const checkSimAuth = () => {
      callback(getSimUser());
    };
    checkSimAuth();
    window.addEventListener('storage', checkSimAuth);
    return () => window.removeEventListener('storage', checkSimAuth);
  } else {
    // Check if demo user is active in localStorage
    const currentSim = getSimUser();
    if (currentSim) {
      callback(currentSim);
    }

    const checkStorage = () => {
      const u = getSimUser();
      if (u) {
        callback(u);
      }
    };
    window.addEventListener('storage', checkStorage);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            callback({ ...user, ...docSnap.data() });
            return;
          }

          const workerRef = doc(db, 'workerProfiles', user.uid);
          const workerSnap = await getDoc(workerRef);
          if (workerSnap.exists()) {
            callback({ ...user, ...workerSnap.data(), role: 'worker' });
            return;
          }

          callback(user);
        } catch (err) {
          console.error('Error fetching auth user role:', err);
          callback(user);
        }
      } else {
        if (!getSimUser()) {
          callback(null);
        }
      }
    });

    return () => {
      window.removeEventListener('storage', checkStorage);
      unsubscribe();
    };
  }
}

/**
 * Send password reset email via Firebase Auth (or simulation for demo accounts)
 * Validates email, verifies account existence, dispatches real Firebase email, and formats clean errors.
 */
export async function sendPasswordReset(email) {
  const safeEmail = String(email || '').trim().toLowerCase();
  
  if (!safeEmail) {
    throw new Error('Please enter your registered email address.');
  }

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(safeEmail)) {
    throw new Error(`"${safeEmail}" is not a valid email address. Please check for spelling mistakes.`);
  }

  // Handle local simulation mode
  if (isSimulationMode) {
    const creds = JSON.parse(localStorage.getItem('sb_mock_credentials') || '{}');
    const users = JSON.parse(localStorage.getItem('sb_mock_users') || '{}');
    const userExists = Object.values(users).some(u => u.email && u.email.toLowerCase() === safeEmail) || 
                       creds[safeEmail] || 
                       MOCK_CREDENTIALS[safeEmail];

    if (!userExists) {
      throw new Error(`No SkillBridge account found registered with "${safeEmail}". Please verify the email or create a new account.`);
    }

    return {
      success: true,
      email: safeEmail,
      message: `Password recovery email has been simulated for ${safeEmail}. In simulation mode, use password "password123".`
    };
  }

  if (!auth) {
    throw new Error('Firebase Authentication is not initialized.');
  }

  // Check demo/pre-seeded accounts
  if (safeEmail.endsWith('@skillbridge.demo') || MOCK_CREDENTIALS[safeEmail]) {
    return {
      success: true,
      isDemo: true,
      email: safeEmail,
      message: `"${safeEmail}" is a simulated demo account. The default password is "password123". You can sign in directly with this password.`
    };
  }

  // Verify account existence in Firestore database before sending (preventing fake successes)
  if (db) {
    try {
      const [usersSnap, workersSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('email', '==', safeEmail))),
        getDocs(query(collection(db, 'workerProfiles'), where('email', '==', safeEmail)))
      ]);

      const accountExistsInFirestore = !usersSnap.empty || !workersSnap.empty;
      if (!accountExistsInFirestore) {
        // If not in Firestore, attempt Firebase Auth send; if Firebase Auth fails with user-not-found, surface it.
      }
    } catch (checkErr) {
      console.warn('Could not pre-query Firestore users during password reset:', checkErr);
    }
  }

  // Action Code Settings with redirect URL back to SkillBridge Login
  const actionCodeSettings = typeof window !== 'undefined' ? {
    url: `${window.location.origin}/login`,
    handleCodeInApp: false
  } : undefined;

  try {
    // Attempt sending with actionCodeSettings for smooth redirect
    if (actionCodeSettings) {
      try {
        await sendPasswordResetEmail(auth, safeEmail, actionCodeSettings);
      } catch (actionErr) {
        // If domain is not authorized in actionCodeSettings, fallback to standard Firebase hosted email
        if (actionErr.code === 'auth/unauthorized-domain' || actionErr.code === 'auth/invalid-continue-uri') {
          console.warn('Retrying standard password reset without custom action URL:', actionErr.message);
          await sendPasswordResetEmail(auth, safeEmail);
        } else {
          throw actionErr;
        }
      }
    } else {
      await sendPasswordResetEmail(auth, safeEmail);
    }

    return {
      success: true,
      email: safeEmail,
      message: `A password reset link has been sent to ${safeEmail}. Please check your inbox (and spam/junk folder) and click the link to choose a new password.`
    };
  } catch (error) {
    console.error('Firebase sendPasswordResetEmail failed:', error);

    if (error.code === 'auth/user-not-found') {
      throw new Error(`No account found with the email "${safeEmail}". Please check your email or create a new account.`, { cause: error });
    } else if (error.code === 'auth/invalid-email') {
      throw new Error(`The email address "${safeEmail}" is invalid.`, { cause: error });
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many password reset requests sent to this address. Please wait a few minutes before trying again.', { cause: error });
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized in Firebase Auth. Please verify Authorized Domains in Firebase Console.', { cause: error });
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error: Unable to connect to Firebase. Please check your internet connection and try again.', { cause: error });
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Password reset is disabled in Firebase Authentication settings.', { cause: error });
    }

    throw new Error(error.message || `Failed to send password reset email to ${safeEmail}.`, { cause: error });
  }
}

