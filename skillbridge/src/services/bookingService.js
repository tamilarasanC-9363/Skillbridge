import { db, isSimulationMode } from '../firebase/firebaseConfig';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc,
  query, 
  where,
  orderBy
} from 'firebase/firestore';

// Fallback seed bookings for Local Simulation Mode
const MOCK_BOOKINGS = [
  {
    bookingId: 'booking_completed_1',
    customerId: 'customer_uid',
    workerId: 'worker1',
    category: 'Plumbing',
    jobType: 'Pipe Leakage Repair',
    bookingType: 'pre-booking',
    location: 'Chennai Central, Area A',
    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    scheduledTime: '10:00 AM',
    estimatedPrice: '₹300 – ₹700',
    description: 'There is a minor leakage in the kitchen sink pipe.',
    urgency: 'normal',
    status: 'Completed',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    bookingId: 'booking_pending_1',
    customerId: 'customer_uid',
    workerId: 'worker1',
    category: 'Plumbing',
    jobType: 'Tap / Faucet Repair',
    bookingType: 'instant',
    location: 'Chennai Central, Street B',
    scheduledDate: new Date().toISOString(),
    scheduledTime: 'Immediate',
    estimatedPrice: '₹300 – ₹700',
    description: 'Bathroom tap is dripping continuously.',
    urgency: 'urgent',
    status: 'Pending',
    createdAt: new Date().toISOString()
  }
];

if (typeof window !== 'undefined' && !localStorage.getItem('sb_mock_bookings')) {
  localStorage.setItem('sb_mock_bookings', JSON.stringify(MOCK_BOOKINGS));
}

/**
 * Fetch a single booking by ID
 */
export async function getBookingById(bookingId) {
  if (isSimulationMode) {
    const bookings = JSON.parse(localStorage.getItem('sb_mock_bookings') || '[]');
    const b = bookings.find(x => x.bookingId === bookingId);
    return b || null;
  } else {
    try {
      const docRef = doc(db, 'bookings', bookingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { bookingId: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }
}

/**
 * Fetch bookings filtered by role and user ID
 */
export async function getBookingsForUser(userId, role) {
  if (isSimulationMode) {
    const bookings = JSON.parse(localStorage.getItem('sb_mock_bookings') || '[]');
    if (role === 'customer') {
      return bookings.filter(b => b.customerId === userId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (role === 'worker') {
      return bookings.filter(b => b.workerId === userId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Admin gets all
      return bookings.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  } else {
    try {
      let q;
      if (role === 'customer') {
        q = query(collection(db, 'bookings'), where('customerId', '==', userId));
      } else if (role === 'worker') {
        q = query(collection(db, 'bookings'), where('workerId', '==', userId));
      } else {
        q = query(collection(db, 'bookings'));
      }
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ bookingId: doc.id, ...doc.data() }));
      // Sort in memory by createdAt descending
      return results.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }
}

/**
 * Create a new booking
 */
export async function createBooking(bookingData) {
  if (isSimulationMode) {
    const bookings = JSON.parse(localStorage.getItem('sb_mock_bookings') || '[]');
    const bookingId = 'booking_' + Math.random().toString(36).substr(2, 9);
    
    const newBooking = {
      bookingId,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      ...bookingData
    };
    
    bookings.push(newBooking);
    localStorage.setItem('sb_mock_bookings', JSON.stringify(bookings));

    // Also trigger mock notification
    triggerMockNotification(
      bookingData.workerId,
      'new_request',
      `New request for ${bookingData.jobType} from ${bookingData.customerName || 'Customer'}.`,
      bookingId
    );

    return newBooking;
  } else {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        status: 'Pending',
        createdAt: new Date(),
        ...bookingData
      });
      
      // We will update the document to store the generated ID inside
      await updateDoc(docRef, { bookingId: docRef.id });

      // Add default notification
      await addDoc(collection(db, 'notifications'), {
        userId: bookingData.workerId,
        type: 'new_request',
        message: `New request for ${bookingData.jobType} from ${bookingData.customerName || 'Customer'}.`,
        bookingId: docRef.id,
        read: false,
        createdAt: new Date()
      });

      return { bookingId: docRef.id, ...bookingData, status: 'Pending' };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Booking could not be created. Please try again.');
    }
  }
}

/**
 * Transition booking status
 */
export async function updateBookingStatus(bookingId, status) {
  if (isSimulationMode) {
    const bookings = JSON.parse(localStorage.getItem('sb_mock_bookings') || '[]');
    const index = bookings.findIndex(b => b.bookingId === bookingId);
    
    if (index === -1) throw new Error('Booking not found.');
    
    const oldBooking = bookings[index];
    bookings[index] = { ...oldBooking, status };
    localStorage.setItem('sb_mock_bookings', JSON.stringify(bookings));

    // Send mock notification
    let notifyUser = oldBooking.customerId;
    let type = 'booking_updated';
    let msg = `Your booking status for ${oldBooking.jobType} has been updated to ${status}.`;

    if (status === 'Accepted') {
      type = 'booking_accepted';
      msg = `Worker accepted your request for ${oldBooking.jobType}! Chat is now unlocked.`;
    } else if (status === 'Rejected') {
      type = 'booking_rejected';
      msg = `Worker was unavailable and declined your request for ${oldBooking.jobType}.`;
    } else if (status === 'Completed') {
      type = 'job_completed';
      msg = `Job completed! Please submit a review for your service.`;
      
      // Increment worker's completedJobs counter
      const workers = JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
      const wIdx = workers.findIndex(w => w.userId === oldBooking.workerId);
      if (wIdx !== -1) {
        workers[wIdx].completedJobs = (workers[wIdx].completedJobs || 0) + 1;
        localStorage.setItem('sb_mock_workers', JSON.stringify(workers));
      }
    }

    triggerMockNotification(notifyUser, type, msg, bookingId);

    return bookings[index];
  } else {
    try {
      const docRef = doc(db, 'bookings', bookingId);
      await updateDoc(docRef, { status });

      const snap = await getDoc(docRef);
      const booking = snap.data();

      // Trigger notification
      let notifyUser = booking.customerId;
      let type = 'booking_updated';
      let msg = `Your booking status for ${booking.jobType} has been updated to ${status}.`;

      if (status === 'Accepted') {
        type = 'booking_accepted';
        msg = `Worker accepted your request for ${booking.jobType}! Chat is now unlocked.`;
      } else if (status === 'Rejected') {
        type = 'booking_rejected';
        msg = `Worker declined your request for ${booking.jobType}.`;
      } else if (status === 'Completed') {
        type = 'job_completed';
        msg = `Job completed! Please submit a review for your service.`;

        // Increment worker completed count
        const workerRef = doc(db, 'workerProfiles', booking.workerId);
        const wSnap = await getDoc(workerRef);
        if (wSnap.exists()) {
          const count = (wSnap.data().completedJobs || 0) + 1;
          await updateDoc(workerRef, { completedJobs: count });
        }
      }

      await addDoc(collection(db, 'notifications'), {
        userId: notifyUser,
        type,
        message: msg,
        bookingId,
        read: false,
        createdAt: new Date()
      });

      return { bookingId, ...booking };
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }
}

// Internal helper for mock notifications
function triggerMockNotification(userId, type, message, bookingId) {
  if (typeof window !== 'undefined') {
    const notifs = JSON.parse(localStorage.getItem('sb_mock_notifications') || '[]');
    notifs.push({
      notificationId: 'notif_' + Math.random().toString(36).substr(2, 9),
      userId,
      type,
      message,
      bookingId,
      read: false,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('sb_mock_notifications', JSON.stringify(notifs));
  }
}
