import React, { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { subscribeToMessages, sendMessage } from '../services/chatService';
import LoadingSpinner from './LoadingSpinner';

export default function ChatBox({ chatId, currentUser, receiverId, bookingId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setLoading(true);
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
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden animate-fade-in">
      {/* Header Info */}
      <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold text-gray-800">Support Chat</span>
            <span className="block text-[10px] text-emerald-500 font-semibold">Active Booking Conversation</span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-grow overflow-y-auto p-5 space-y-4 bg-gray-50/50">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <p className="text-sm text-gray-400 font-medium">No messages yet.</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Send a message below to unlock contact with your service partner.</p>
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
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe 
                      ? 'bg-primary text-white rounded-br-none shadow-xs' 
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-100 shadow-2xs'
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1">
                  {formatMessageTime(msg.timestamp)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Entry Input */}
      <form onSubmit={handleSend} className="bg-white border-t border-gray-100 p-4 flex gap-2">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message here..."
          className="flex-grow border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors bg-gray-50/50 focus:bg-white"
        />
        <button 
          type="submit"
          className="bg-primary hover:bg-primary-hover text-white p-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
