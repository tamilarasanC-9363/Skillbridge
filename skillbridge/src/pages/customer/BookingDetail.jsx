import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBookingById, updateBookingStatus } from '../../services/bookingService';
import { checkReviewExists, submitReview } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import ChatBox from '../../components/ChatBox';
import RatingStars from '../../components/RatingStars';
import LoadingSpinner from '../../components/LoadingSpinner';
import BackButton from '../../components/BackButton';
import { Calendar, Clock, MapPin, IndianRupee, MessageSquare, Send } from 'lucide-react';

const STATUS_THEMES = {
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200/60',
  'Accepted': 'bg-blue-50 text-blue-700 border-blue-200/60',
  'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  'Rejected': 'bg-rose-50 text-rose-700 border-rose-200/60',
  'Cancelled': 'bg-gray-100 text-gray-600 border-gray-200'
};

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
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

  const loadBookingData = async () => {
    setLoading(true);
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
  };

  useEffect(() => {
    loadBookingData();
    
    // Refresh listener for real-time mock responses
    window.addEventListener('sb_message_sent', loadBookingData);
    return () => window.removeEventListener('sb_message_sent', loadBookingData);
  }, [bookingId]);

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
      <div className="max-w-md mx-auto py-12 text-center">
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
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Booking Code</span>
                <h1 className="text-xl font-bold text-gray-900 leading-none mt-1">#{booking.bookingId.toUpperCase()}</h1>
              </div>
              <span className={`px-4 py-1 text-sm font-bold rounded-full border ${STATUS_THEMES[booking.status]}`}>
                {booking.status}
              </span>
            </div>

            {/* Core Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">{booking.jobType}</h3>
                <span className="text-xs text-gray-400 font-medium">Service Category: {booking.category}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/60">
                <div className="space-y-2">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service Date</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formattedDate}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scheduled Slot</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {booking.scheduledTime}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pricing Estimate</span>
                    <span className="font-bold text-gray-800 flex items-center mt-0.5">
                      <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                      {booking.estimatedPrice}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {booking.location}
                    </span>
                  </div>
                </div>
              </div>

              {booking.description && (
                <div>
                  <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Problem Description</span>
                  <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 p-3 rounded-xl italic">
                    "{booking.description}"
                  </p>
                </div>
              )}

              {/* Status transition details info */}
              <div className="pt-2 border-t border-gray-50 flex gap-4">
                {userRole === 'customer' && ['Pending', 'Accepted'].includes(booking.status) && (
                  <button
                    onClick={handleCancelBooking}
                    className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-500 font-bold text-xs rounded-xl transition-all"
                  >
                    Cancel Booking Request
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Customer Rating and Review Submission Box */}
          {userRole === 'customer' && showReviewForm && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-2">Write Service Review</h2>
              <p className="text-xs text-gray-500 mb-5">Share your feedback to help other community members hire trusted help.</p>

              {reviewSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl text-xs font-bold">
                  ✓ Review submitted successfully!
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Stars select */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setRating(num)}
                          className={`p-2 border rounded-lg text-xs font-bold ${
                            rating >= num 
                              ? 'bg-amber-50 border-amber-300 text-amber-500' 
                              : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          ★ {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 font-medium">Comments / Review Text *</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="3"
                      placeholder="Share your experience (punctuality, skill, behavior, final pricing...)"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary bg-gray-50/30 focus:bg-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="px-6 py-2.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-xs"
                  >
                    {reviewLoading ? <LoadingSpinner size="sm" color="white" /> : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Already reviewed status notification */}
          {userRole === 'customer' && booking.status === 'Completed' && reviewExists && !reviewSuccess && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 select-none">
              ✓ Service feedback has already been submitted for this transaction.
            </div>
          )}
        </div>

        {/* Right Side: Chat Window Sidebar */}
        <div className="lg:col-span-1">
          {isChatUnlocked ? (
            <div className="sticky top-24 space-y-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-primary" />
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
            <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center sticky top-24 shadow-3xs">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-800">In-App Chat Locked</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Communication is unlocked automatically once the worker accepts your booking request.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
