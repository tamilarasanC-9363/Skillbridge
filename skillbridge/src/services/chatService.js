import { db, isSimulationMode } from '../firebase/firebaseConfig';
import { 
  doc, 
  getDoc, 
  setDoc,
  updateDoc, 
  collection, 
  getDocs, 
  addDoc,
  query, 
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

// Initial pre-seeded chat messages
const MOCK_CHAT_MESSAGES = [
  {
    chatId: 'chat_booking_completed_1',
    bookingId: 'booking_completed_1',
    senderId: 'customer_uid',
    receiverId: 'worker1',
    message: 'Hello Ramesh, are you available for the plumbing leak job?',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    chatId: 'chat_booking_completed_1',
    bookingId: 'booking_completed_1',
    senderId: 'worker1',
    receiverId: 'customer_uid',
    message: 'Yes, I can come over tomorrow morning around 10:00 AM.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60000).toISOString()
  },
  {
    chatId: 'chat_booking_completed_1',
    bookingId: 'booking_completed_1',
    senderId: 'customer_uid',
    receiverId: 'worker1',
    message: 'That sounds perfect. See you then!',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60000).toISOString()
  }
];

if (typeof window !== 'undefined' && !localStorage.getItem('sb_mock_chat_messages')) {
  localStorage.setItem('sb_mock_chat_messages', JSON.stringify(MOCK_CHAT_MESSAGES));
}

/**
 * Get or create a chat document for a booking
 */
export async function getOrCreateChat(bookingId, customerId, workerId) {
  const chatId = `chat_${bookingId}`;
  
  if (isSimulationMode) {
    const chats = JSON.parse(localStorage.getItem('sb_mock_chats') || '{}');
    if (!chats[chatId]) {
      chats[chatId] = {
        chatId,
        bookingId,
        customerId,
        workerId,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('sb_mock_chats', JSON.stringify(chats));
    }
    return chats[chatId];
  } else {
    try {
      const docRef = doc(db, 'chats', chatId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const chatData = {
          chatId,
          bookingId,
          customerId,
          workerId,
          createdAt: new Date()
        };
        await setDoc(docRef, chatData);
        return chatData;
      }
      return docSnap.data();
    } catch (error) {
      console.error('Error getting or creating chat:', error);
      throw error;
    }
  }
}

/**
 * Send a message
 */
export async function sendMessage(chatId, senderId, receiverId, bookingId, messageText) {
  const messageData = {
    chatId,
    senderId,
    receiverId,
    bookingId,
    message: messageText,
    timestamp: isSimulationMode ? new Date().toISOString() : new Date()
  };

  if (isSimulationMode) {
    const messages = JSON.parse(localStorage.getItem('sb_mock_chat_messages') || '[]');
    messages.push(messageData);
    localStorage.setItem('sb_mock_chat_messages', JSON.stringify(messages));
    
    // Trigger custom storage event for live reloading across active tabs
    window.dispatchEvent(new Event('sb_message_sent'));

    // Trigger mock worker/customer automatic reply
    triggerSimulatedReply(chatId, senderId, receiverId, bookingId, messageText);
    
    return messageData;
  } else {
    try {
      const colRef = collection(db, 'messages');
      await addDoc(colRef, messageData);
      return messageData;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

/**
 * Subscribe to messages in real-time
 */
export function subscribeToMessages(chatId, callback) {
  if (isSimulationMode) {
    const fetchAndCallback = () => {
      const messages = JSON.parse(localStorage.getItem('sb_mock_chat_messages') || '[]');
      const filtered = messages
        .filter(m => m.chatId === chatId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      callback(filtered);
    };

    fetchAndCallback();

    // Listen to local messages updates
    window.addEventListener('sb_message_sent', fetchAndCallback);
    window.addEventListener('storage', fetchAndCallback);

    return () => {
      window.removeEventListener('sb_message_sent', fetchAndCallback);
      window.removeEventListener('storage', fetchAndCallback);
    };
  } else {
    // Live Firestore listener
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Timestamp to ISO string if exists
        const timestamp = data.timestamp?.seconds 
          ? new Date(data.timestamp.seconds * 1000).toISOString() 
          : data.timestamp;
        return { id: doc.id, ...data, timestamp };
      });
      callback(msgs);
    });
  }
}

/**
 * Trigger context-aware automated reply from the mock worker
 */
function triggerSimulatedReply(chatId, senderId, receiverId, bookingId, userMessageText) {
  // If the sender is the customer, let the worker auto-reply
  if (senderId === 'customer_uid') {
    setTimeout(() => {
      const replies = [
        "Sure, I am on it right now. I will be there shortly!",
        "Thanks for the details! I will arrive at the scheduled time.",
        "Got it. Please let me know if there are any specific instructions before I start.",
        "I have reached your area and will locate your door soon.",
        "Could you please confirm the gate number or landmarks near your location?"
      ];
      
      let selectedReply = replies[Math.floor(Math.random() * replies.length)];
      
      // Customize reply slightly based on keywords
      const text = userMessageText.toLowerCase();
      if (text.includes('time') || text.includes('when') || text.includes('arrive')) {
        selectedReply = "I am packing my tools and will start now. It should take me around 20-30 minutes.";
      } else if (text.includes('price') || text.includes('cost') || text.includes('charge')) {
        selectedReply = "The price depends on the exact scope of work. Let me inspect first and we can agree on the final amount.";
      }

      const replyMessage = {
        chatId,
        senderId: receiverId, // Worker is the sender of the reply
        receiverId: senderId, // Customer is the receiver
        bookingId,
        message: selectedReply,
        timestamp: new Date().toISOString()
      };

      const messages = JSON.parse(localStorage.getItem('sb_mock_chat_messages') || '[]');
      messages.push(replyMessage);
      localStorage.setItem('sb_mock_chat_messages', JSON.stringify(messages));
      
      // Notify page of update
      window.dispatchEvent(new Event('sb_message_sent'));
    }, 2500);
  }
}
