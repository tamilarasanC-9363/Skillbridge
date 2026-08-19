import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotificationsForUser, markNotificationAsRead } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { currentUser, userRole } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchNotifications = async () => {
      try {
        const list = await getNotificationsForUser(currentUser.uid);
        setNotifications(list);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();

    // Check for notifications updates every 10 seconds in mock/simulation
    const interval = setInterval(fetchNotifications, 10000);
    
    // Also listen to global local storage sent message event
    window.addEventListener('sb_message_sent', fetchNotifications);
    window.addEventListener('storage', fetchNotifications);

    return () => {
      clearInterval(interval);
      window.removeEventListener('sb_message_sent', fetchNotifications);
      window.removeEventListener('storage', fetchNotifications);
    };
  }, [currentUser]);

  // Click outside to close notification panel
  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notif) => {
    try {
      await markNotificationAsRead(notif.notificationId);
      // Mark read locally
      setNotifications(prev => 
        prev.map(n => n.notificationId === notif.notificationId ? { ...n, read: true } : n)
      );
      setIsOpen(false);
      
      // Redirect based on role and notification reference
      if (notif.bookingId) {
        if (userRole === 'customer') {
          navigate(`/customer/booking/${notif.bookingId}`);
        } else if (userRole === 'worker') {
          navigate(`/worker/bookings`);
        } else if (userRole === 'admin') {
          navigate(`/admin/bookings`);
        }
      }
    } catch (err) {
      console.error('Failed to handle notification click:', err);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={bellRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-primary transition-colors duration-150 rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-100 font-semibold text-sm text-gray-800 flex justify-between items-center">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif) => (
                <button
                  key={notif.notificationId}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 flex flex-col items-start ${!notif.read ? 'bg-blue-50/30' : ''}`}
                >
                  <span className={`text-xs font-semibold text-gray-900 ${!notif.read ? 'text-primary' : ''}`}>
                    {notif.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{notif.message}</p>
                  <span className="text-[9px] text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
