import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForUser, updateBookingStatus } from '../../services/bookingService';
import ServiceCard from '../../components/ServiceCard';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Briefcase, ArrowRight, ClipboardList, PlusCircle } from 'lucide-react';

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

  const fetchBookings = async () => {
    try {
      const list = await getBookingsForUser(currentUser.uid, 'customer');
      setBookings(list);
    } catch (err) {
      console.error('Error fetching dashboard bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    
    // Refresh listener for mock mode updates
    window.addEventListener('sb_message_sent', fetchBookings);
    return () => window.removeEventListener('sb_message_sent', fetchBookings);
  }, [currentUser]);

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">Welcome, {currentUser.name}!</h1>
          <p className="text-xs text-gray-500 mt-1">Hire background-verified home maintenance specialists in your locality.</p>
        </div>
        <Link 
          to="/customer/search"
          className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-white btn-gradient rounded-xl shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Book New Service
        </Link>
      </div>

      {/* Main Call to Action: What service do you need? */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4">What service do you need?</h2>
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
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Ongoing Bookings
          </h2>
          {activeBookings.length > 0 && (
            <Link to="/customer/bookings" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingSpinner size="md" />
        ) : activeBookings.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-500 shadow-3xs">
            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium">You have no active ongoing bookings.</p>
            <p className="text-xs text-gray-400 mt-1">Select a category above to find and request worker assistance.</p>
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
            <h2 className="text-lg font-bold text-gray-900">Recent Service History</h2>
            <Link to="/customer/bookings" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              All History <ArrowRight className="w-3 h-3" />
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
