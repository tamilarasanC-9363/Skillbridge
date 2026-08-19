import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForUser, updateBookingStatus } from '../../services/bookingService';
import { getReviewsForWorker } from '../../services/reviewService';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import BackButton from '../../components/BackButton';
import RatingStars from '../../components/RatingStars';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  Star, 
  MessageSquare, 
  Filter,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const CATEGORY_IMAGES = {
  'Plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
  'Electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'Painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  'Carpentry': 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
  'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  'Appliance Repair': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
};

const DEFAULT_JOB_IMAGE = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80';

export default function WorkerJobs() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'in_progress', 'completed'
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const fetchJobsAndReviews = async () => {
      try {
        if (!currentUser?.uid) return;
        const [userBookings, workerReviews] = await Promise.all([
          getBookingsForUser(currentUser.uid, 'worker'),
          getReviewsForWorker(currentUser.uid)
        ]);
        setBookings(userBookings || []);
        setReviews(workerReviews || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsAndReviews();
  }, [currentUser]);

  const handleBookingAction = async (bookingId, newStatus) => {
    try {
      setActionError('');
      const updated = await updateBookingStatus(bookingId, newStatus);
      setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error(err);
      setActionError('Could not update job status. Please try again.');
    }
  };

  const upcomingJobs = bookings.filter(b => b.status === 'Pending' || b.status === 'Accepted');
  const inProgressJobs = bookings.filter(b => b.status === 'In Progress');
  const completedJobs = bookings.filter(b => b.status === 'Completed');

  const displayedJobs = activeTab === 'upcoming'
    ? upcomingJobs
    : activeTab === 'in_progress'
    ? inProgressJobs
    : activeTab === 'completed'
    ? completedJobs
    : bookings;

  // Map review ratings to completed bookings
  const getReviewForBooking = (bookingId) => {
    return reviews.find(r => r.bookingId === bookingId);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to="/worker" label="Back to Dashboard" className="mb-6" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-primary" />
            My Work / Job History
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Track upcoming assignments, active work in progress, and review completed service history.
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {upcomingJobs.length + inProgressJobs.length} Active
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedJobs.length} Completed
          </span>
        </div>
      </div>

      {actionError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3.5 text-xs font-semibold mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex border-b border-white/10 mb-8 gap-2 sm:gap-6 overflow-x-auto pb-1 select-none">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-text-muted hover:text-white'
          }`}
        >
          All Jobs ({bookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'upcoming'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-text-muted hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          Upcoming ({upcomingJobs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('in_progress')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'in_progress'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-text-muted hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          In Progress ({inProgressJobs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'completed'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-text-muted hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Completed ({completedJobs.length})
        </button>
      </div>

      {/* Main Jobs Display List */}
      {displayedJobs.length === 0 ? (
        <div className="bg-card-bg border border-border-custom rounded-3xl p-12 text-center text-text-muted space-y-3">
          <Briefcase className="w-12 h-12 text-text-muted mx-auto opacity-40" />
          <h3 className="text-base font-bold text-white">No jobs found in this section</h3>
          <p className="text-xs max-w-sm mx-auto">
            {activeTab === 'completed'
              ? 'Completed service works with ratings, earnings, and realistic project photos will appear here.'
              : 'New customer bookings and assignments will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedJobs.map(job => {
            const isCompleted = job.status === 'Completed';
            const review = getReviewForBooking(job.bookingId);
            const jobImage = CATEGORY_IMAGES[job.category] || DEFAULT_JOB_IMAGE;

            if (isCompleted) {
              // Rich Completed Job History Card with realistic photo, earnings, rating, and location
              return (
                <div 
                  key={job.bookingId} 
                  className="bg-card-bg border border-border-custom rounded-3xl overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-md group flex flex-col md:flex-row"
                >
                  {/* Left: Realistic Project Photo */}
                  <div className="md:w-72 h-48 md:h-auto relative overflow-hidden bg-slate-900 flex-shrink-0">
                    <img 
                      src={jobImage} 
                      alt={job.jobType}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_JOB_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-slate-950/40" />
                    <span className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-white/10 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {job.category}
                    </span>
                  </div>

                  {/* Right: Job Details, Earnings, Location, Rating */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-text-muted">
                          ID: #{job.bookingId.substr(-6).toUpperCase()}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Completed Job
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-white group-hover:text-primary transition-colors">
                        {job.jobType}
                      </h3>

                      <p className="text-xs text-text-sub font-medium">
                        Client: <span className="text-white font-semibold">{job.customerName || 'Local Resident'}</span>
                      </p>

                      {job.description && (
                        <p className="text-xs text-text-muted italic bg-slate-900/60 p-2.5 rounded-xl border border-white/5 line-clamp-2">
                          "{job.description}"
                        </p>
                      )}
                    </div>

                    {/* Meta information: Date, Location, Earnings, Rating */}
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Completed'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-text-muted" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-extrabold text-xs">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {job.estimatedPrice || '₹500'} Payout
                        </span>
                      </div>

                      {/* Client Rating */}
                      <div className="flex items-center gap-2">
                        {review ? (
                          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-extrabold text-amber-400">{review.rating}.0</span>
                            <span className="text-[10px] text-amber-300 font-medium">Reviewed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>5.0 Satisfied</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const chatId = `chat_${job.bookingId}`;
                            navigate(`/worker/chat/${chatId}`, { state: { booking: job } });
                          }}
                          className="p-2 text-text-muted hover:text-primary hover:bg-white/5 rounded-xl border border-white/10 transition-colors cursor-pointer"
                          title="View Conversation"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Upcoming / In Progress standard card
            return (
              <BookingCard
                key={job.bookingId}
                booking={job}
                role="worker"
                onAction={handleBookingAction}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
