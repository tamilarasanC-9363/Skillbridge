import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, IndianRupee, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

const STATUS_THEMES = {
  'Pending': 'bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] border-[#FFA649]/30',
  'Accepted': 'bg-[#283845]/10 dark:bg-[#283845]/40 text-[#283845] dark:text-[#FFA649] border-[#283845]/30',
  'In Progress': 'bg-[#FFA649]/25 text-[#1B2731] dark:text-[#FFA649] border-[#FFA649]/40',
  'Completed': 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
  'Rejected': 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
  'Cancelled': 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-700'
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
    <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-2xl p-5 hover:shadow-md hover:border-[#FFA649]/50 dark:hover:border-[#FFA649]/50 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in text-left">
      {/* Primary Details */}
      <div className="flex-grow space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-extrabold text-stone-400 dark:text-stone-500 tracking-wider">
            #{booking.bookingId?.substr(-6).toUpperCase()}
          </span>
          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${STATUS_THEMES[booking.status] || STATUS_THEMES.Pending}`}>
            {booking.status}
          </span>
          <span className="text-[11px] bg-stone-100 dark:bg-stone-800 text-[#283845] dark:text-stone-300 font-semibold px-2 py-0.5 rounded-md capitalize">
            {booking.bookingType}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[#283845] dark:text-white leading-tight font-heading">
          {booking.jobType} <span className="text-xs text-stone-500 font-normal">({booking.category})</span>
        </h3>

        {/* User context info */}
        <div className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
          {role === 'customer' 
            ? `Worker: ${booking.workerName || 'Assigned Worker'}` 
            : `Client: ${booking.customerName || 'Local Client'}`}
        </div>

        {/* Logistics row */}
        <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-stone-500 dark:text-stone-400 pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            {booking.scheduledTime}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            {booking.location}
          </span>
          <span className="flex items-center gap-0.5 font-bold text-[#283845] dark:text-white">
            <IndianRupee className="w-3.5 h-3.5 text-[#FFA649]" />
            {booking.estimatedPrice}
          </span>
        </div>

        {booking.description && (
          <p className="text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-[#11171E] p-2.5 rounded-xl border border-[#EBE5DE] dark:border-white/10 max-w-xl italic mt-2">
            "{booking.description}"
          </p>
        )}
      </div>

      {/* Booking Action Buttons */}
      <div className="flex flex-wrap md:flex-col items-stretch md:items-end gap-2 w-full md:w-auto mt-2 md:mt-0">
        
        {/* Chat capability */}
        {showChatButton && (
          <button 
            onClick={handleChatRedirect}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-[#283845] dark:text-[#FFA649] bg-[#FFA649]/15 hover:bg-[#FFA649]/25 rounded-xl border border-[#FFA649]/30 transition-all w-full md:w-auto cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#FFA649]" />
            Open Direct Chat
          </button>
        )}

        {/* Customer Actions */}
        {role === 'customer' && (
          <>
            {booking.status === 'Pending' && (
              <button 
                onClick={() => onAction(booking.bookingId, 'Cancelled')}
                className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl transition-all cursor-pointer"
              >
                Cancel Booking
              </button>
            )}
            
            {booking.status === 'Accepted' && (
              <button 
                onClick={() => onAction(booking.bookingId, 'Cancelled')}
                className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl transition-all cursor-pointer"
              >
                Cancel Booking
              </button>
            )}

            {booking.status === 'Completed' && !reviewed && (
              <button 
                onClick={() => navigate(`/customer/booking/${booking.bookingId}`)}
                className="px-4 py-2 text-xs font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Rate & Review Pro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {booking.status === 'Completed' && reviewed && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Reviewed
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
                  className="flex-grow md:flex-grow-0 px-4 py-2 text-xs font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Accept Job
                </button>
                <button 
                  onClick={() => onAction(booking.bookingId, 'Rejected')}
                  className="flex-grow md:flex-grow-0 px-4 py-2 text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                >
                  Decline
                </button>
              </div>
            )}

            {booking.status === 'Accepted' && (
              <button 
                onClick={() => onAction(booking.bookingId, 'In Progress')}
                className="px-4 py-2 text-xs font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Start Job
              </button>
            )}

            {booking.status === 'In Progress' && (
              <button 
                onClick={() => onAction(booking.bookingId, 'Completed')}
                className="px-4 py-2 text-xs font-extrabold text-white bg-[#283845] hover:bg-[#1E2B35] border border-[#FFA649]/30 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Mark Complete
              </button>
            )}
          </>
        )}

        {/* Admin Actions */}
        {role === 'admin' && (
          <button 
            onClick={() => navigate(`/customer/booking/${booking.bookingId}`)}
            className="px-4 py-2 text-xs font-bold text-[#283845] dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-all cursor-pointer"
          >
            Manage Details
          </button>
        )}
      </div>
    </div>
  );
}
