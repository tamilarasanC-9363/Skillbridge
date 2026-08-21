import { db, isSimulationMode } from '../firebase/firebaseConfig';
import { 
  doc, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc,
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { syncWorkerVerificationEligibility } from './verificationEligibilityService';

// Initial pre-seeded reviews
const MOCK_REVIEWS = [
  {
    reviewId: 'review_completed_1',
    bookingId: 'booking_completed_1',
    customerId: 'customer_uid',
    workerId: 'worker1',
    rating: 5,
    comment: 'Excellent plumbing work! Ramesh was punctual, polite, and resolved the leakage under 30 minutes. Highly recommended!',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

if (typeof window !== 'undefined' && !localStorage.getItem('sb_mock_reviews')) {
  localStorage.setItem('sb_mock_reviews', JSON.stringify(MOCK_REVIEWS));
}

/**
 * Fetch reviews for a specific worker
 */
export async function getReviewsForWorker(workerId) {
  if (isSimulationMode) {
    const reviews = JSON.parse(localStorage.getItem('sb_mock_reviews') || '[]');
    return reviews.filter(r => r.workerId === workerId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    try {
      const q = query(collection(db, 'reviews'), where('workerId', '==', workerId));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ reviewId: doc.id, ...doc.data() }));
      return results.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    } catch (error) {
      console.error('Error fetching worker reviews:', error);
      throw error;
    }
  }
}

export function subscribeToReviewsForWorker(workerId, callback) {
  if (isSimulationMode) {
    const emit = () => {
      const reviews = JSON.parse(localStorage.getItem('sb_mock_reviews') || '[]');
      const filtered = reviews.filter(r => r.workerId === workerId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(filtered);
    };

    emit();
    const handler = () => emit();
    window.addEventListener('storage', handler);
    window.addEventListener('sb_reviews_updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('sb_reviews_updated', handler);
    };
  }

  const q = query(collection(db, 'reviews'), where('workerId', '==', workerId));
  return onSnapshot(q, (snapshot) => {
    const results = snapshot.docs.map(doc => ({ reviewId: doc.id, ...doc.data() }));
    results.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
    callback(results);
  }, (error) => {
    console.error('Error listening to worker reviews:', error);
    callback([]);
  });
}

/**
 * Check if a review already exists for a booking
 */
export async function checkReviewExists(bookingId) {
  if (isSimulationMode) {
    const reviews = JSON.parse(localStorage.getItem('sb_mock_reviews') || '[]');
    return reviews.some(r => r.bookingId === bookingId);
  } else {
    try {
      const q = query(collection(db, 'reviews'), where('bookingId', '==', bookingId));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking review existence:', error);
      return false;
    }
  }
}

/**
 * Submit a rating and review for a booking
 */
export async function submitReview(bookingId, customerId, workerId, rating, comment) {
  const reviewData = {
    bookingId,
    customerId,
    workerId,
    rating: Number(rating),
    comment,
    createdAt: isSimulationMode ? new Date().toISOString() : new Date()
  };

  const exists = await checkReviewExists(bookingId);
  if (exists) {
    throw new Error('You have already submitted a review for this booking.');
  }

  if (isSimulationMode) {
    const reviews = JSON.parse(localStorage.getItem('sb_mock_reviews') || '[]');
    reviews.push({ reviewId: 'rev_' + Math.random().toString(36).substr(2, 9), ...reviewData });
    localStorage.setItem('sb_mock_reviews', JSON.stringify(reviews));
    window.dispatchEvent(new Event('sb_reviews_updated'));

    const workerReviews = reviews.filter(r => r.workerId === workerId);
    const sum = workerReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    const avg = workerReviews.length > 0 ? Number((sum / workerReviews.length).toFixed(1)) : 0;

    const workers = JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
    const workerIndex = workers.findIndex(w => w.userId === workerId);

    if (workerIndex !== -1) {
      const worker = workers[workerIndex];
      workers[workerIndex] = {
        ...worker,
        rating: avg,
        reviewCount: workerReviews.length
      };
      localStorage.setItem('sb_mock_workers', JSON.stringify(workers));
      await syncWorkerVerificationEligibility(workerId, { rating: avg, reviewCount: workerReviews.length });
    }

    return reviewData;
  } else {
    try {
      await addDoc(collection(db, 'reviews'), reviewData);

      const q = query(collection(db, 'reviews'), where('workerId', '==', workerId));
      const snapshot = await getDocs(q);
      const allReviews = snapshot.docs.map(doc => ({ reviewId: doc.id, ...doc.data() }));

      const sum = allReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
      const avg = allReviews.length > 0 ? Number((sum / allReviews.length).toFixed(1)) : 0;

      const workerRef = doc(db, 'workerProfiles', workerId);
      await updateDoc(workerRef, {
        rating: avg,
        reviewCount: allReviews.length
      });

      await syncWorkerVerificationEligibility(workerId, {
        rating: avg,
        reviewCount: allReviews.length
      });

      return reviewData;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }
}
