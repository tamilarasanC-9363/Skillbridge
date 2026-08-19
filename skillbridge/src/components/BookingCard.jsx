import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, IndianRupee, MessageSquare } from 'lucide-react';

const STATUS_THEMES = {
  'Pending': 'bg-amber-55/10 text-amber-600 border-amber-200/60 dark:text-amber-400 dark:border-amber-950/40 dark:bg-amber-950/20',
  'Accepted': 'bg-blue-55/10 text-blue-600 border-blue-200/60 dark:text-blue-450 dark:border-blue-950/40 dark:bg-blue-950/20',
  'In Progress': 'bg-purple-55/10 text-purple-600 border-purple-200/60 dark:text-purple-400 dark:border-purple-950/40 dark:bg-purple-950/20',
  'Completed': 'bg-emerald-55/10 text-emerald-600 border-emerald-200/60 dark:text-emerald-450 dark:border-emerald-950/40 dark:bg-emerald-950/20',
  'Rejected': 'bg-rose-55/10 text-rose-600 border-rose-200/60 dark:text-rose-450 dark:border-rose-950/40 dark:bg-rose-950/20',
  'Cancelled': 'bg-gray-100 text-gray-500 border-gray-200 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-900/60'
};

export default function BookingCard({ booking, role, onAction, reviewed = false }) {
  const navigate = useNavigate();
  if (!booking) return null;

  const showChatButton = ['Accepted', 'In Progress', 'Completed'].includes(booking.status);

  const formattedDate = booking.scheduledDate 
    ? new Date(booking.scheduledDate).toLocaleDateString(undefined, { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) 
    : 'Not Scheduled';

  const handleChatRedirect = () => {
    const chatId = `chat_${booking.bookingId}`;
    if (role === 'customer') {
      navigate(`/customer/chat/${chatId}`, { state: { booking } });
    } else {
      navigate(`/worker/chat/${chatId}`, { state: { booking } });
    }
  };

  return (
    <div className="bg-card-bg border border-border-custom rounded-2xl shadow-2xs p-5 hover:shadow-sm hover:border-primary/30 transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in text-left">
      {/* Primary Details */}
      <div className="flex-grow space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-text-muted">ID: #{booking.bookingId.substr(-6).toUpperCase()}</span>
          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${STATUS_THEMES[booking.status] || STATUS_THEMES.Pending}`}>
            {booking.status}
          </span>
          <span className="text-xs bg-gray-50 dark:bg-slate-805/40 text-text-muted border border-border-custom font-semibold px-2 py-0.5 rounded-md capitalize">
            {booking.bookingType}
          </span>
        </div>

        <h3 className="text-lg font-bold text-text-main leading-tight">
          {booking.jobType} <span className="text-xs text-text-muted font-normal">({booking.category})</span>
        </h3>

        {/* User context information */}
        <div className="text-sm font-semibold text-text-sub">
          {role === 'customer' 
            ? `Worker: ${booking.workerName || 'Assigned Worker'}` 
            : `Customer: ${booking.customerName || 'Local Client'}`}
        </div>

        {/* Logistics row */}
        <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {booking.scheduledTime}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {booking.location}
          </span>
          <span className="flex items-center gap-0.5 font-bold text-text-section">
            <IndianRupee className="w-3.5 h-3.5" />
            {booking.estimatedPrice}
          </span>
        </div>

        {booking.description && (
          <p className="text-xs text-text-sub bg-gray-50/50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-border-custom max-w-xl italic mt-2">
            " {booking.description} "
          </p>
        )}
      </div>

      {/* Booking Dashboard Action panel */}
      <div className="flex flex-wrap md:flex-col items-stretch md:items-end gap-2 w-full md:w-auto mt-2 md:mt-0">
        
        {/* Chat capability */}
        {showChatButton && (
          <button 
            onClick={handleChatRedirect}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-primary bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 rounded-xl transition-all w-full md:w-auto cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            Open Chat
          </button>
        )}

        {/* Customer Actions */}
        {role === 'customer' && (
          <>
            {booking.status === 'Pending' && (
              <button 
                onClick={() => onAction(booking.bookingId, 'Cancelled')}
                className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl transition-all cursor-pointer"
              >
                Cancel Booking
              </button>
            )}
            
            {booking.status === 'Accepted' && (
              <button 
                onClick={() => onAction(booking.bookingId, 'Cancelled')}
                className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl transition-all cursor-pointer"
              >
                Cancel Booking
              </button>
            )}

            {booking.status === 'Completed' && !reviewed && (
              <button 
                onClick={() => navigate(`/customer/booking/${booking.bookingId}`)}
                className="px-4 py-2 text-xs font-bold text-white btn-gradient rounded-xl shadow-2xs cursor-pointer"
              >
                Write Rating & Review
              </button>
            )}

            {booking.status === 'Completed' && reviewed && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-55/10 border border-emerald-200 dark:border-emerald-950/30 px-3 py-1 rounded-full text-center">
                ✓ Reviewed
              </span>
            )}
          </>
        )}

        {/* Worker Actions */}
        {role === 'worker' && (
          <>
            {booking.status === 'Pending' && (
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => onAction(booking.bookingId, 'Accepted')}
                  className="flex-grow md:flex-grow-0 px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all cursor-pointer"
                >
                  Accept
                </button>
                <button 
                  onClick={() => onAction(booking.bookingId, 'Rejected')}
                  className="flex-grow md:flex-grow-0 px-4 py-2 text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                >
                  Reject
                </button>
              </div>
            )}

            {booking.status === 'Accepted' && (
              <button 
                onClick={() => onAction(booking.bookingId, 'In Progress')}
                className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all cursor-pointer"
              >
                Start Job
              </button>
            )}

            {booking.status === 'In Progress' && (
              <button 
                onClick={() => onAction(booking.bookingId, 'Completed')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all cursor-pointer"
              >
                Mark Job Complete
              </button>
            )}
          </>
        )}

        {/* Admin Actions */}
        {role === 'admin' && (
          <button 
            onClick={() => navigate(`/customer/booking/${booking.bookingId}`)}
            className="px-4 py-2 text-xs font-bold text-text-sub bg-card-bg border border-border-custom rounded-xl hover:bg-gray-150 transition-all text-center cursor-pointer"
          >
            Manage Booking
          </button>
        )}
      </div>
    </div>
  );
}
