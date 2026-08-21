import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForUser, updateBookingStatus } from '../../services/bookingService';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import BackButton from '../../components/BackButton';
import { ClipboardList, Briefcase, History } from 'lucide-react';

export default function MyBookings() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  const fetchBookings = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const list = await getBookingsForUser(currentUser.uid, 'customer');
      setBookings(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    fetchBookings();
    
    // Refresh listener for mock responses
    window.addEventListener('sb_message_sent', fetchBookings);
    return () => window.removeEventListener('sb_message_sent', fetchBookings);
  }, [fetchBookings]);

  const handleBookingAction = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const activeBookings = bookings.filter(b => ['Pending', 'Accepted', 'In Progress'].includes(b.status));
  const pastBookings = bookings.filter(b => ['Completed', 'Rejected', 'Cancelled'].includes(b.status));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to="/customer" label="Back to Dashboard" className="mb-6" />

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white font-heading">My Bookings</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Track status, chat with specialists, and review completed service works.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EBE5DE] dark:border-white/10 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'active' 
              ? 'border-[#FFA649] text-[#283845] dark:text-[#FFA649]' 
              : 'border-transparent text-stone-500 hover:text-[#283845] dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4 text-[#FFA649]" />
          Active Bookings ({activeBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'past' 
              ? 'border-[#FFA649] text-[#283845] dark:text-[#FFA649]' 
              : 'border-transparent text-stone-500 hover:text-[#283845] dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4 text-[#FFA649]" />
          Completed & History ({pastBookings.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : activeTab === 'active' ? (
        activeBookings.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-12 text-center text-stone-500 shadow-xs">
            <ClipboardList className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#283845] dark:text-white">No Active Bookings</h3>
            <p className="text-xs text-stone-400 mt-1">You have no pending requests or active jobs at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBookings.map(b => (
              <BookingCard 
                key={b.bookingId}
                booking={b}
                role="customer"
                onAction={handleBookingAction}
              />
            ))}
          </div>
        )
      ) : (
        pastBookings.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-12 text-center text-stone-500 shadow-xs">
            <ClipboardList className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#283845] dark:text-white">No Service History</h3>
            <p className="text-xs text-stone-400 mt-1">You haven't completed any booking transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastBookings.map(b => (
              <BookingCard 
                key={b.bookingId}
                booking={b}
                role="customer"
                onAction={handleBookingAction}
                reviewed={b.status === 'Completed' ? bookings.some(x => x.bookingId === b.bookingId && x.reviewed) : false}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
