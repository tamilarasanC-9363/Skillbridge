import { db, storage, isSimulationMode } from '../firebase/firebaseConfig';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc,
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export function parseNumericPrice(val) {
  if (typeof val === 'number' && !isNaN(val) && val > 0) return val;
  if (!val) return 450;
  const match = String(val).replace(/[^0-9]/g, ' ').trim().split(/\s+/);
  if (match && match[0] && !isNaN(Number(match[0]))) {
    return Number(match[0]);
  }
  return 450;
}

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
    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledTime: '10:00 AM',
    estimatedPrice: '₹450 – ₹650',
    agreedPrice: 450,
    price: 450,
    payoutAmount: 450,
    platformFee: 45,
    netEarnings: 405,
    description: 'Minor leakage in kitchen sink pipe.',
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
    estimatedPrice: '₹400 – ₹600',
    agreedPrice: 400,
    price: 400,
    payoutAmount: 400,
    platformFee: 40,
    netEarnings: 360,
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
    const b = bookings.find(x => x.bookingId === bookingId || x.id === bookingId);
    return b || null;
  } else {
    try {
      const docRef = doc(db, 'bookings', bookingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { bookingId: docSnap.id, id: docSnap.id, ...docSnap.data() };
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
      const results = snapshot.docs.map(d => ({ bookingId: d.id, id: d.id, ...d.data() }));
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
 * Create a new booking with agreed price locking
 */
export async function createBooking(bookingData) {
  const agreedPrice = parseNumericPrice(bookingData.agreedPrice || bookingData.price || bookingData.estimatedPrice || 450);
  const platformFee = Math.round(agreedPrice * 0.10);
  const netEarnings = agreedPrice - platformFee;

  const payload = {
    ...bookingData,
    agreedPrice,
    price: agreedPrice,
    payoutAmount: agreedPrice,
    platformFee,
    netEarnings,
    status: 'Pending',
    createdAt: isSimulationMode ? new Date().toISOString() : new Date()
  };

  if (isSimulationMode) {
    const bookings = JSON.parse(localStorage.getItem('sb_mock_bookings') || '[]');
    const bookingId = 'booking_' + Math.random().toString(36).substr(2, 9);
    
    const newBooking = {
      bookingId,
      id: bookingId,
      ...payload
    };
    
    bookings.push(newBooking);
    localStorage.setItem('sb_mock_bookings', JSON.stringify(bookings));

    triggerMockNotification(
      bookingData.workerId,
      'new_request',
      `New request for ${bookingData.jobType} from ${bookingData.customerName || 'Customer'}.`,
      bookingId
    );

    return newBooking;
  } else {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), payload);
      await updateDoc(docRef, { bookingId: docRef.id, id: docRef.id });

      await addDoc(collection(db, 'notifications'), {
        userId: bookingData.workerId,
        type: 'new_request',
        message: `New request for ${bookingData.jobType} from ${bookingData.customerName || 'Customer'}.`,
        bookingId: docRef.id,
        read: false,
        createdAt: new Date()
      });

      return { bookingId: docRef.id, id: docRef.id, ...payload };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Booking could not be created. Please try again.', { cause: error });
    }
  }
}

/**
 * Transition booking status
 */
export async function updateBookingStatus(bookingId, status) {
  if (isSimulationMode) {
    const bookings = JSON.parse(localStorage.getItem('sb_mock_bookings') || '[]');
    const index = bookings.findIndex(b => b.bookingId === bookingId || b.id === bookingId);
    
    if (index === -1) throw new Error('Booking not found.');
    
    const oldBooking = bookings[index];
    bookings[index] = { ...oldBooking, status };
    localStorage.setItem('sb_mock_bookings', JSON.stringify(bookings));

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

      return { bookingId, ...booking, status };
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }
}

/**
 * Job Completion with Geotagged Photo Evidence (Requirement 6)
 */
export async function completeJobWithEvidence({
  bookingId,
  workerId,
  photoFile,
  notes,
  latitude = null,
  longitude = null,
  locationAccuracy = null,
  locationStatus = 'captured'
}) {
  if (!bookingId) throw new Error('Booking reference ID is required.');
  if (!workerId) throw new Error('Worker ID is required.');
  if (!photoFile) throw new Error('Photo evidence is required to mark this job as completed.');

  const booking = await getBookingById(bookingId);
  if (!booking) throw new Error('Booking not found in database.');

  // Prevent unauthorized workers from completing another worker's booking
  if (booking.workerId !== workerId) {
    throw new Error('Unauthorized: You can only complete bookings assigned directly to you.');
  }

  // Prevent duplicate completion submissions
  if (booking.status === 'Completed') {
    throw new Error('This booking is already marked as completed.');
  }

  let photoUrl;
  if (isSimulationMode || !storage) {
    photoUrl = URL.createObjectURL ? URL.createObjectURL(photoFile) : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758';
  } else {
    try {
      const ext = photoFile.name ? photoFile.name.split('.').pop() : 'jpg';
      const storagePath = `completionEvidence/${bookingId}/${Date.now()}_completion.${ext}`;
      const fileRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(fileRef, photoFile);
      photoUrl = await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.warn('Firebase Storage upload failed, using fallback object URL:', err);
      photoUrl = URL.createObjectURL ? URL.createObjectURL(photoFile) : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758';
    }
  }

  const completionEvidence = {
    photoUrl,
    notes: notes || '',
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    locationAccuracy: locationAccuracy ?? null,
    locationStatus: locationStatus || 'captured',
    timestamp: new Date().toISOString(),
    workerId,
    bookingId
  };

  if (isSimulationMode) {
    const bookings = JSON.parse(localStorage.getItem('sb_mock_bookings') || '[]');
    const idx = bookings.findIndex(b => b.bookingId === bookingId || b.id === bookingId);
    if (idx !== -1) {
      bookings[idx] = {
        ...bookings[idx],
        status: 'Completed',
        completedAt: new Date().toISOString(),
        completionEvidence
      };
      localStorage.setItem('sb_mock_bookings', JSON.stringify(bookings));
    }

    const completions = JSON.parse(localStorage.getItem('sb_mock_completions') || '[]');
    completions.push({
      completionId: 'comp_' + Math.random().toString(36).substr(2, 9),
      ...completionEvidence,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('sb_mock_completions', JSON.stringify(completions));

    const workers = JSON.parse(localStorage.getItem('sb_mock_workers') || '[]');
    const wIdx = workers.findIndex(w => w.userId === workerId || w.workerId === workerId);
    if (wIdx !== -1) {
      workers[wIdx].completedJobs = (workers[wIdx].completedJobs || 0) + 1;
      localStorage.setItem('sb_mock_workers', JSON.stringify(workers));
    }

    triggerMockNotification(booking.customerId, 'job_completed', `Job ${booking.jobType} completed with photo evidence!`, bookingId);
    return { success: true, bookingId, completionEvidence };
  } else {
    try {
      // 1. Save record in jobCompletions collection
      await addDoc(collection(db, 'jobCompletions'), {
        ...completionEvidence,
        customerId: booking.customerId,
        jobType: booking.jobType,
        createdAt: serverTimestamp()
      });

      // 2. Update booking status only after evidence has been uploaded
      const docRef = doc(db, 'bookings', bookingId);
      await updateDoc(docRef, {
        status: 'Completed',
        completedAt: serverTimestamp(),
        completionEvidence
      });

      // 3. Increment worker completed count
      const workerRef = doc(db, 'workerProfiles', workerId);
      const wSnap = await getDoc(workerRef);
      if (wSnap.exists()) {
        const count = (wSnap.data().completedJobs || 0) + 1;
        await updateDoc(workerRef, { completedJobs: count });
      }

      // 4. Send notification
      await addDoc(collection(db, 'notifications'), {
        userId: booking.customerId,
        type: 'job_completed',
        message: `Job ${booking.jobType} completed! Photo evidence and completion notes submitted.`,
        bookingId,
        read: false,
        createdAt: serverTimestamp()
      });

      return { success: true, bookingId, completionEvidence };
    } catch (error) {
      console.error('Error submitting job completion evidence:', error);
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
