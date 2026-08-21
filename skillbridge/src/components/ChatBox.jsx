import { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { subscribeToMessages, sendMessage } from '../services/chatService';
import LoadingSpinner from './LoadingSpinner';

export default function ChatBox({ chatId, currentUser, receiverId, bookingId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Subscribe to real time updates
    const unsubscribe = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [chatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const text = inputValue;
    setInputValue(''); // Clear input instantly for responsiveness
    
    try {
      await sendMessage(chatId, currentUser.uid, receiverId, bookingId, text);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-2xl shadow-xs overflow-hidden animate-fade-in text-left">
      {/* Header Info */}
      <div className="bg-stone-50 dark:bg-[#11171E] border-b border-[#EBE5DE] dark:border-white/10 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FFA649]/15 text-[#FFA649] border border-[#FFA649]/30 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold text-[#283845] dark:text-white font-heading">Direct Chat</span>
            <span className="block text-[10px] text-emerald-500 font-bold">Active Booking Connection</span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-grow overflow-y-auto p-5 space-y-4 bg-stone-50/40 dark:bg-[#141C24]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <p className="text-sm text-stone-400 font-medium">No messages yet.</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-[200px]">Send a message below to coordinate details with your service partner.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUser.uid;
            return (
              <div 
                key={index} 
                className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div 
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe 
                      ? 'btn-gradient text-[#11171E] font-bold rounded-br-none shadow-xs' 
                      : 'bg-white dark:bg-[#1B2731] text-[#283845] dark:text-white rounded-bl-none border border-[#EBE5DE] dark:border-white/10 shadow-xs'
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-[9px] text-stone-400 mt-1 px-1">
                  {formatMessageTime(msg.timestamp)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Entry Input */}
      <form onSubmit={handleSend} className="bg-white dark:bg-[#1B2731] border-t border-[#EBE5DE] dark:border-white/10 p-3.5 flex gap-2">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message here..."
          className="flex-grow border border-[#EBE5DE] dark:border-white/10 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#FFA649] focus:ring-2 focus:ring-[#FFA649]/25 transition-colors bg-stone-50/80 dark:bg-[#18222B] text-[#283845] dark:text-white placeholder-stone-400 dark:placeholder-stone-500"
        />
        <button 
          type="submit"
          className="btn-gradient text-[#11171E] p-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer"
          title="Send"
        >
          <Send className="w-4 h-4 stroke-[2.5px]" />
        </button>
      </form>
    </div>
  );
}
