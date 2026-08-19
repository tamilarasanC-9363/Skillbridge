import { db, isSimulationMode } from '../firebase/firebaseConfig';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where,
  addDoc
} from 'firebase/firestore';

// Initialize mock notifications storage
if (typeof window !== 'undefined' && !localStorage.getItem('sb_mock_notifications')) {
  localStorage.setItem('sb_mock_notifications', JSON.stringify([]));
}

/**
 * Fetch notifications for a user
 */
export async function getNotificationsForUser(userId) {
  if (isSimulationMode) {
    const notifs = JSON.parse(localStorage.getItem('sb_mock_notifications') || '[]');
    return notifs
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(d => ({ notificationId: d.id, ...d.data() }));
      return results.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId) {
  if (isSimulationMode) {
    const notifs = JSON.parse(localStorage.getItem('sb_mock_notifications') || '[]');
    const index = notifs.findIndex(n => n.notificationId === notificationId);
    if (index !== -1) {
      notifs[index].read = true;
      localStorage.setItem('sb_mock_notifications', JSON.stringify(notifs));
    }
    return true;
  } else {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, { read: true });
      return true;
    } catch (error) {
      console.error('Error updating notification read status:', error);
      return false;
    }
  }
}

/**
 * Add a new notification
 */
export async function addNotification(userId, type, message, bookingId = '') {
  const notif = {
    userId,
    type,
    message,
    bookingId,
    read: false,
    createdAt: isSimulationMode ? new Date().toISOString() : new Date()
  };

  if (isSimulationMode) {
    const notifs = JSON.parse(localStorage.getItem('sb_mock_notifications') || '[]');
    notifs.push({
      notificationId: 'notif_' + Math.random().toString(36).substr(2, 9),
      ...notif
    });
    localStorage.setItem('sb_mock_notifications', JSON.stringify(notifs));
    return true;
  } else {
    try {
      await addDoc(collection(db, 'notifications'), notif);
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }
}
