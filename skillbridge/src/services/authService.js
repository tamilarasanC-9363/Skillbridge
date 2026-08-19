import { auth, db, isSimulationMode } from '../firebase/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Initial pre-seeded accounts for simulation mode
const MOCK_USERS = {
  'admin_uid': { uid: 'admin_uid', name: 'System Admin', email: 'admin@skillbridge.com', role: 'admin', phone: '9876543210' },
  'customer_uid': { uid: 'customer_uid', name: 'Kumar Dev', email: 'customer@skillbridge.com', role: 'customer', phone: '9876543211' },
  'worker1': { uid: 'worker1', name: 'Ramesh Kumar', email: 'worker@skillbridge.com', role: 'worker', phone: '9876543212' }
};

const MOCK_CREDENTIALS = {
  'admin@skillbridge.com': { password: 'password123', uid: 'admin_uid' },
  'customer@skillbridge.com': { password: 'password123', uid: 'customer_uid' },
  'worker@skillbridge.com': { password: 'password123', uid: 'worker1' }
};

if (typeof window !== 'undefined') {
  if (!localStorage.getItem('sb_mock_users')) {
    localStorage.setItem('sb_mock_users', JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem('sb_mock_credentials')) {
    localStorage.setItem('sb_mock_credentials', JSON.stringify(MOCK_CREDENTIALS));
  }
}

/**
 * Register a new user
 */
export async function registerUser(email, password, name, phone, role) {
  if (isSimulationMode) {
    const creds = JSON.parse(localStorage.getItem('sb_mock_credentials') || '{}');
    const users = JSON.parse(localStorage.getItem('sb_mock_users') || '{}');
    
    if (creds[email]) {
      throw new Error('Email already registered.');
    }
    
    const uid = 'sim_uid_' + Math.random().toString(36).substr(2, 9);
    creds[email] = { password, uid };
    const newUser = { uid, name, email, role, phone, createdAt: new Date().toISOString() };
    users[uid] = newUser;
    
    localStorage.setItem('sb_mock_credentials', JSON.stringify(creds));
    localStorage.setItem('sb_mock_users', JSON.stringify(users));

    // If role is worker, also initialize their worker profile in local storage
    if (role === 'worker') {
      const workers = JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
      const newProfile = {
        userId: uid,
        name,
        profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', // Default generic image
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
        createdAt: new Date().toISOString()
      };
      workers.push(newProfile);
      localStorage.setItem('sb_mock_workers', JSON.stringify(workers));
    }
    
    return newUser;
  } else {
    // Live Firebase Auth and Firestore registration
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userData = {
      uid: user.uid,
      name,
      email,
      phone,
      role,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);

    if (role === 'worker') {
      // Create empty worker profile
      const workerProfile = {
        userId: user.uid,
        name,
        profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
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
        createdAt: new Date()
      };
      await setDoc(doc(db, 'workerProfiles', user.uid), workerProfile);
    }
    
    return userData;
  }
}

/**
 * Log in a user
 */
export async function loginUser(email, password) {
  if (isSimulationMode) {
    const creds = JSON.parse(localStorage.getItem('sb_mock_credentials') || '{}');
    const users = JSON.parse(localStorage.getItem('sb_mock_users') || '{}');
    
    const record = creds[email];
    if (!record || record.password !== password) {
      throw new Error('Incorrect email or password. Please try again.');
    }
    
    const userProfile = users[record.uid];
    localStorage.setItem('sb_current_sim_user', JSON.stringify(userProfile));
    return userProfile;
  } else {
    // Live Firebase login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Retrieve role and details from Firestore
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error('User profile record not found in Firestore.');
    }
  }
}

/**
 * Log out user
 */
export async function logoutUser() {
  if (isSimulationMode) {
    localStorage.removeItem('sb_current_sim_user');
    return true;
  } else {
    await signOut(auth);
  }
}

/**
 * Monitor Auth State Changes
 */
export function subscribeToAuth(callback) {
  if (isSimulationMode) {
    // Periodically checks local storage simulation auth
    const checkSimAuth = () => {
      const userJSON = localStorage.getItem('sb_current_sim_user');
      const user = userJSON ? JSON.parse(userJSON) : null;
      callback(user);
    };
    
    checkSimAuth();
    // Watch window storage updates
    window.addEventListener('storage', checkSimAuth);
    return () => window.removeEventListener('storage', checkSimAuth);
  } else {
    // Live Firebase Auth subscriber
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            callback({ ...user, ...docSnap.data() });
          } else {
            callback(user);
          }
        } catch (err) {
          console.error('Error fetching auth user role:', err);
          callback(user);
        }
      } else {
        callback(null);
      }
    });
  }
}
