import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForUser, updateBookingStatus } from '../../services/bookingService';
import ServiceCard from '../../components/ServiceCard';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Briefcase, ArrowRight, ClipboardList, PlusCircle, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { name: 'Plumbing', desc: 'Pipe leakages, tap repairs, water tank installation' },
  { name: 'Electrical', desc: 'Wiring installation, light fitting, fault repairs' },
  { name: 'Carpentry', desc: 'Door repair, furniture fixes, cupboard fitting' },
  { name: 'Mason / Construction', desc: 'Brick construction, plastering, tile laying' },
  { name: 'Painting', desc: 'Interior, exterior, ceiling painting, coatings' },
  { name: 'Cleaning', desc: 'Full home deep cleaning, bathrooms, kitchen cleaning' }
];

export default function CustomerDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const list = await getBookingsForUser(currentUser.uid, 'customer');
      setBookings(list);
    } catch (err) {
      console.error('Error fetching dashboard bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    fetchBookings();
    
    window.addEventListener('sb_message_sent', fetchBookings);
    return () => window.removeEventListener('sb_message_sent', fetchBookings);
  }, [fetchBookings]);

  const handleBookingAction = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const handleCategorySelect = (catName) => {
    navigate(`/customer/search?category=${encodeURIComponent(catName)}`);
  };

  const activeBookings = bookings.filter(b => ['Pending', 'Accepted', 'In Progress'].includes(b.status));
  const pastBookings = bookings.filter(b => ['Completed', 'Rejected', 'Cancelled'].includes(b.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#283845] dark:text-white font-heading leading-tight">
              Welcome, {currentUser?.name?.split(' ')[0]}!
            </h1>
            <span className="p-1 rounded-full bg-[#FFA649]/15 text-[#FFA649]">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-[#4A5B69] dark:text-stone-400 mt-1">
            Hire background-verified trade specialists and master craftsmen in your locality.
          </p>
        </div>
        <Link 
          to="/customer/search"
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Service</span>
        </Link>
      </div>

      {/* Main Call to Action: What service do you need? */}
      <div className="mb-10">
        <h2 className="text-base sm:text-lg font-bold text-[#283845] dark:text-white font-heading mb-4">
          What service do you need today?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map(cat => (
            <ServiceCard 
              key={cat.name}
              name={cat.name}
              description={cat.desc}
              onClick={() => handleCategorySelect(cat.name)}
            />
          ))}
        </div>
      </div>

      {/* Ongoing / Active Bookings */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-bold text-[#283845] dark:text-white font-heading flex items-center gap-2">
            <Briefcase className="w-4.5 h-4.5 text-[#FFA649]" />
            Active Bookings
          </h2>
          {activeBookings.length > 0 && (
            <Link to="/customer/bookings" className="text-xs font-bold text-[#FFA649] hover:underline flex items-center gap-1">
              <span>View All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingSpinner size="md" />
        ) : activeBookings.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-8 text-center text-stone-500 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 mx-auto flex items-center justify-center mb-3">
              <ClipboardList className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#283845] dark:text-stone-200">No active ongoing bookings</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Select a category above to request worker assistance.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBookings.slice(0, 3).map(b => (
              <BookingCard 
                key={b.bookingId}
                booking={b}
                role="customer"
                onAction={handleBookingAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings Summary */}
      {pastBookings.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-bold text-[#283845] dark:text-white font-heading">
              Recent Service History
            </h2>
            <Link to="/customer/bookings" className="text-xs font-bold text-[#FFA649] hover:underline flex items-center gap-1">
              <span>Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {pastBookings.slice(0, 2).map(b => (
              <BookingCard 
                key={b.bookingId}
                booking={b}
                role="customer"
                onAction={handleBookingAction}
                reviewed={b.status === 'Completed' ? bookings.some(x => x.bookingId === b.bookingId && x.reviewed) : false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
