import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getBookingById, updateBookingStatus } from '../../services/bookingService';
import { checkReviewExists, submitReview } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import ChatBox from '../../components/ChatBox';
import LoadingSpinner from '../../components/LoadingSpinner';
import BackButton from '../../components/BackButton';
import { Calendar, Clock, MapPin, IndianRupee, MessageSquare } from 'lucide-react';

const STATUS_THEMES = {
  'Pending': 'bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] border-[#FFA649]/30 font-bold',
  'Accepted': 'bg-[#283845]/10 dark:bg-[#283845]/40 text-[#283845] dark:text-[#FFA649] border-[#283845]/30 font-bold',
  'In Progress': 'bg-[#FFA649]/25 text-[#1B2731] dark:text-[#FFA649] border-[#FFA649]/40 font-bold',
  'Completed': 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 font-bold',
  'Rejected': 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80 font-bold',
  'Cancelled': 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-700 font-bold'
};

export default function BookingDetail() {
  const { bookingId } = useParams();
  const { currentUser, userRole } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewExists, setReviewExists] = useState(false);
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [error, setError] = useState('');

  const loadBookingData = useCallback(async () => {
    try {
      const b = await getBookingById(bookingId);
      if (!b) {
        setError('Booking not found.');
        return;
      }
      setBooking(b);
      
      if (b.status === 'Completed') {
        const reviewed = await checkReviewExists(bookingId);
        setReviewExists(reviewed);
      }
    } catch (err) {
      console.error(err);
      setError('Error loading booking details.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBookingData();
    
    // Refresh listener for real-time mock responses
    window.addEventListener('sb_message_sent', loadBookingData);
    return () => window.removeEventListener('sb_message_sent', loadBookingData);
  }, [loadBookingData]);

  const handleCancelBooking = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      await updateBookingStatus(bookingId, 'Cancelled');
      await loadBookingData();
    } catch (err) {
      console.error(err);
      setError('Cancellation failed.');
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please add a comment for your review.');
      return;
    }
    setReviewLoading(true);
    setError('');

    try {
      await submitReview(bookingId, currentUser.uid, booking.workerId, rating, comment);
      setReviewSuccess(true);
      setReviewExists(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const formattedDate = booking?.scheduledDate 
    ? new Date(booking.scheduledDate).toLocaleDateString(undefined, { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
      }) 
    : 'Immediate';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto py-12 text-center animate-fade-in">
        <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-4 text-xs font-semibold">
          {error || 'Booking detail loading failed.'}
        </div>
        <div className="mt-4">
          <BackButton to="/customer" label="Back to Dashboard" />
        </div>
      </div>
    );
  }

  const isChatUnlocked = ['Accepted', 'In Progress', 'Completed'].includes(booking.status);
  const showReviewForm = booking.status === 'Completed' && !reviewExists;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton 
        to={userRole === 'customer' ? '/customer/bookings' : userRole === 'worker' ? '/worker/bookings' : '/admin/bookings'} 
        label="Back to Bookings"
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Booking Specifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBE5DE] dark:border-white/10 pb-5 mb-5">
              <div>
                <span className="text-xs text-[#283845]/70 dark:text-[#FFA649] font-extrabold uppercase tracking-wider">Booking Code</span>
                <h1 className="text-xl font-bold text-[#283845] dark:text-white leading-none mt-1 font-heading">#{booking.bookingId.toUpperCase()}</h1>
              </div>
              <span className={`px-4 py-1 text-sm font-bold rounded-full border ${STATUS_THEMES[booking.status]}`}>
                {booking.status}
              </span>
            </div>

            {/* Core Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#283845] dark:text-white font-heading">{booking.jobType}</h3>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Service Category: <span className="font-bold text-[#283845] dark:text-[#FFA649]">{booking.category}</span></span>
              </div>

              {/* High Contrast Logistics Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 dark:bg-[#11171E] p-5 rounded-2xl border border-[#EBE5DE] dark:border-white/10">
                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider">Service Date</span>
                    <span className="font-bold text-[#283845] dark:text-white flex items-center gap-1.5 mt-0.5 text-sm">
                      <Calendar className="w-4 h-4 text-[#FFA649]" />
                      {formattedDate}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider">Scheduled Slot</span>
                    <span className="font-bold text-[#283845] dark:text-white flex items-center gap-1.5 mt-0.5 text-sm">
                      <Clock className="w-4 h-4 text-[#FFA649]" />
                      {booking.scheduledTime}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider">Pricing Estimate</span>
                    <span className="font-extrabold text-[#283845] dark:text-white flex items-center gap-0.5 mt-0.5 text-sm">
                      <IndianRupee className="w-4 h-4 text-[#FFA649]" />
                      {booking.estimatedPrice}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider">Location</span>
                    <span className="font-bold text-[#283845] dark:text-white flex items-center gap-1.5 mt-0.5 text-sm">
                      <MapPin className="w-4 h-4 text-[#FFA649]" />
                      {booking.location}
                    </span>
                  </div>
                </div>
              </div>

              {booking.description && (
                <div>
                  <span className="block text-xs font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-1">Problem Description</span>
                  <p className="text-xs text-[#283845] dark:text-stone-300 bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 p-3 rounded-xl italic leading-relaxed">
                    "{booking.description}"
                  </p>
                </div>
              )}

              {/* Status transition details info */}
              <div className="pt-2 border-t border-[#EBE5DE] dark:border-white/10 flex gap-4">
                {userRole === 'customer' && ['Pending', 'Accepted'].includes(booking.status) && (
                  <button
                    onClick={handleCancelBooking}
                    className="px-4 py-2 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel Booking Request
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Customer Rating and Review Submission Box */}
          {userRole === 'customer' && showReviewForm && (
            <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-base font-bold text-[#283845] dark:text-white mb-2 font-heading">Write Service Review</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-5">Share your feedback to help other community members hire trusted help.</p>

              {reviewSuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-xs font-bold">
                  ✓ Review submitted successfully!
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Stars select */}
                  <div>
                    <label className="block text-xs font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-2">Select Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setRating(num)}
                          className={`p-2 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            rating >= num 
                              ? 'bg-[#FFA649]/20 border-[#FFA649] text-[#FFA649]' 
                              : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                          }`}
                        >
                          ★ {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-1.5 font-medium">Comments / Review Text *</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="3"
                      placeholder="Share your experience (punctuality, skill, behavior, final pricing...)"
                      className="w-full border border-[#EBE5DE] dark:border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#FFA649] focus:ring-2 focus:ring-[#FFA649]/25 bg-stone-50 dark:bg-[#11171E] focus:bg-white dark:focus:bg-[#18222B] text-[#283845] dark:text-white placeholder-stone-400 dark:placeholder-stone-500 transition-all duration-150"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="px-6 py-2.5 text-xs font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-xs cursor-pointer"
                  >
                    {reviewLoading ? <LoadingSpinner size="sm" color="white" /> : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Already reviewed status notification */}
          {userRole === 'customer' && booking.status === 'Completed' && reviewExists && !reviewSuccess && (
            <div className="bg-emerald-50/55 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-5 text-center text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center justify-center gap-1.5 select-none">
              ✓ Service feedback has already been submitted for this transaction.
            </div>
          )}
        </div>

        {/* Right Side: Chat Window Sidebar */}
        <div className="lg:col-span-1">
          {isChatUnlocked ? (
            <div className="sticky top-24 space-y-4">
              <h2 className="text-xs font-bold text-[#283845] dark:text-[#FFA649] uppercase tracking-widest px-1 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#FFA649]" />
                Live Service Chat
              </h2>
              <ChatBox 
                chatId={`chat_${booking.bookingId}`}
                currentUser={currentUser}
                receiverId={userRole === 'customer' ? booking.workerId : booking.customerId}
                bookingId={bookingId}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-8 text-center sticky top-24 shadow-3xs">
              <MessageSquare className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#283845] dark:text-white">In-App Chat Locked</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Communication is unlocked automatically once the worker accepts your booking request.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
