import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getWorkerProfile, toggleAvailability, getWorkerEarningsData } from '../../services/workerService';
import { getBookingsForUser, updateBookingStatus } from '../../services/bookingService';
import { subscribeToReviewsForWorker } from '../../services/reviewService';
import BookingCard from '../../components/BookingCard';
import JobCompletionModal from '../../components/JobCompletionModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import RatingStars from '../../components/RatingStars';
import { 
  Users, Briefcase, CheckCircle, Clock, Star, 
  IndianRupee, ToggleLeft, ToggleRight, ClipboardList, Info, ShieldAlert,
  MapPin, Calendar, Image as ImageIcon
} from 'lucide-react';

export default function WorkerDashboard() {
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('incoming'); // incoming | active | history
  const [completionModalBooking, setCompletionModalBooking] = useState(null);
  const reviewsUnsubscribeRef = useRef(() => {});

  const loadDashboardData = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const prof = await getWorkerProfile(currentUser.uid);
      setProfile(prof);

      const list = await getBookingsForUser(currentUser.uid, 'worker');
      setBookings(list);

      const bookingMap = new Map((list || []).map(booking => [booking.bookingId, booking]));
      reviewsUnsubscribeRef.current();
      reviewsUnsubscribeRef.current = subscribeToReviewsForWorker(currentUser.uid, (reviews) => {
        const enrichedReviews = (reviews || [])
          .map(review => ({
            ...review,
            customerName: bookingMap.get(review.bookingId)?.customerName || JSON.parse(localStorage.getItem('sb_mock_users') || '{}')[review.customerId]?.name || 'Customer',
            jobName: bookingMap.get(review.bookingId)?.jobType || bookingMap.get(review.bookingId)?.category || 'Service',
            createdAtDate: review.createdAt?.seconds
              ? new Date(review.createdAt.seconds * 1000)
              : new Date(review.createdAt || Date.now())
          }))
          .sort((a, b) => b.createdAtDate - a.createdAtDate);

        setFeedbacks(enrichedReviews);
      });
    } catch (err) {
      console.error('Error loading worker dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    loadDashboardData();

    const onMessageSent = () => loadDashboardData();
    window.addEventListener('sb_message_sent', onMessageSent);

    return () => {
      reviewsUnsubscribeRef.current();
      window.removeEventListener('sb_message_sent', onMessageSent);
    };
  }, [currentUser?.uid, loadDashboardData]);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setAvailabilityLoading(true);
    try {
      const nextVal = !profile.availability;
      await toggleAvailability(currentUser.uid, nextVal);
      setProfile(prev => ({ ...prev, availability: nextVal }));
    } catch (err) {
      console.error(err);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, newStatus) => {
    if (newStatus === 'Completed') {
      const target = bookings.find(b => b.bookingId === bookingId);
      if (target) {
        setCompletionModalBooking(target);
        return;
      }
    }

    try {
      await updateBookingStatus(bookingId, newStatus);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isSetupIncomplete = !profile || !profile.categories || profile.categories.length === 0;
  if (isSetupIncomplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in text-center">
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
          <ShieldAlert className="w-16 h-16 text-[#FFA649] mx-auto animate-bounce" />
          <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white font-heading">Onboarding Incomplete</h1>
          <p className="text-xs sm:text-sm text-[#4A5B69] dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            Welcome to SkillBridge! Before you can match with clients and accept incoming jobs, please complete your trade profile and identity details.
          </p>
          <Link
            to="/worker/profile/setup"
            className="inline-block px-8 py-3.5 text-xs font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-md"
          >
            Complete Onboarding Now
          </Link>
        </div>
      </div>
    );
  }

  const pendingRequests = bookings.filter(b => b.status === 'Pending');
  const activeJobs = bookings.filter(b => ['Accepted', 'In Progress'].includes(b.status));
  // completed count derived from earningsData

  const earningsData = getWorkerEarningsData(profile, bookings);

  const liveAverageRating = feedbacks.length > 0
    ? feedbacks.reduce((sum, review) => sum + Number(review.rating || 0), 0) / feedbacks.length
    : Number(profile?.rating || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#283845] dark:text-white font-heading leading-tight">
              Worker Command Hub
            </h1>
            {profile.verified ? (
              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-800/60 text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ✓ Verified
              </span>
            ) : (
              <span className="bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] font-extrabold border border-[#FFA649]/30 text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Audit Pending
              </span>
            )}
          </div>
          <p className="text-xs text-[#4A5B69] dark:text-stone-400 mt-1">
            Toggle your work availability, manage job requests, and track cumulative earnings.
          </p>
        </div>

        {/* Availability Toggle */}
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="text-left">
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Availability</span>
            <span className={`text-xs font-bold ${profile.availability ? 'text-[#FFA649]' : 'text-stone-400'}`}>
              {profile.availability ? 'Available for Jobs' : 'Offline'}
            </span>
          </div>
          <button 
            onClick={handleToggleAvailability}
            disabled={availabilityLoading}
            className="text-[#FFA649] hover:opacity-90 transition-opacity cursor-pointer"
            title="Toggle Status"
          >
            {profile.availability ? (
              <ToggleRight className="w-9 h-9 text-[#FFA649] fill-current" />
            ) : (
              <ToggleLeft className="w-9 h-9 text-stone-300 dark:text-stone-600" />
            )}
          </button>
        </div>
      </div>

      {/* Verification Notice */}
      {!profile.verified && (
        <div className="bg-[#FFA649]/15 border border-[#FFA649]/30 rounded-2xl p-4 mb-8 flex gap-3 text-xs text-[#283845] dark:text-[#FFA649] leading-relaxed">
          <Info className="w-4.5 h-4.5 text-[#FFA649] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Awaiting Admin Verification:</span> Your uploaded certification documents are in review. You can still accept direct booking requests.
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-4 rounded-2xl text-center shadow-xs flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-[#FFA649]/15 border border-[#FFA649]/30 flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-[#FFA649] stroke-[2.2px]" />
          </div>
          <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">New Requests</span>
          <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">{pendingRequests.length}</span>
        </div>

        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-4 rounded-2xl text-center shadow-xs flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-[#283845]/10 dark:bg-[#283845]/40 border border-[#283845]/20 dark:border-[#FFA649]/30 flex items-center justify-center mb-2">
            <Briefcase className="w-5 h-5 text-[#283845] dark:text-[#FFA649] stroke-[2.2px]" />
          </div>
          <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Active Jobs</span>
          <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">{activeJobs.length}</span>
        </div>

        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-4 rounded-2xl text-center shadow-xs flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[2.2px]" />
          </div>
          <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Completed</span>
          <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">{earningsData.totalCompletedJobs}</span>
        </div>

        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-4 rounded-2xl text-center shadow-xs flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-[#FFA649]/15 border border-[#FFA649]/30 flex items-center justify-center mb-2">
            <Star className="w-5 h-5 text-[#FFA649] fill-current" />
          </div>
          <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Rating</span>
          <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">
            {liveAverageRating > 0 ? liveAverageRating.toFixed(1) : '5.0'}
          </span>
        </div>

        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-4 rounded-2xl col-span-2 md:col-span-1 text-center shadow-xs flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-[#283845]/10 dark:bg-[#283845]/40 border border-[#283845]/20 dark:border-[#FFA649]/30 flex items-center justify-center mb-2">
            <IndianRupee className="w-5 h-5 text-[#FFA649] stroke-[2.2px]" />
          </div>
          <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Est. Earnings</span>
          <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">₹{earningsData.totalIncome.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Customer Feedback Snippet */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-extrabold text-[#283845] dark:text-white font-heading">Customer Feedbacks</h2>
          <Link to="/worker/feedbacks" className="text-xs font-bold text-[#283845] dark:text-[#FFA649] hover:text-[#FFA649] transition-colors">
            View all
          </Link>
        </div>

        {feedbacks.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 text-center text-stone-500 shadow-xs">
            <Star className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#283845] dark:text-white">No reviews yet</h3>
            <p className="text-xs text-stone-400 mt-1">Customer ratings will appear here after completed bookings are reviewed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.slice(0, 3).map(feedback => (
              <div key={feedback.reviewId || `${feedback.bookingId}-${feedback.customerId}`} className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-2xl p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#283845] dark:text-white">
                    <Users className="w-4 h-4 text-[#FFA649]" />
                    {feedback.customerName}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    {feedback.createdAtDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                  <RatingStars rating={Number(feedback.rating || 0)} showNumber={true} />
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">{feedback.jobName}</span>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 italic leading-relaxed">“{feedback.comment || 'No additional comment provided.'}”</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Tabs */}
      <div className="flex border-b border-[#EBE5DE] dark:border-white/10 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'incoming' 
              ? 'border-[#FFA649] text-[#283845] dark:text-[#FFA649]' 
              : 'border-transparent text-stone-500 hover:text-[#283845] dark:hover:text-white'
          }`}
        >
          Incoming Requests ({pendingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'active' 
              ? 'border-[#FFA649] text-[#283845] dark:text-[#FFA649]' 
              : 'border-transparent text-stone-500 hover:text-[#283845] dark:hover:text-white'
          }`}
        >
          Active Tasks ({activeJobs.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'history' 
              ? 'border-[#FFA649] text-[#283845] dark:text-[#FFA649]' 
              : 'border-transparent text-stone-500 hover:text-[#283845] dark:hover:text-white'
          }`}
        >
          Completed History ({earningsData.totalCompletedJobs})
        </button>
      </div>

      {/* Render selected tabs */}
      {activeTab === 'incoming' ? (
        pendingRequests.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-12 text-center text-stone-500 shadow-xs">
            <ClipboardList className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#283845] dark:text-white">No New Requests</h3>
            <p className="text-xs text-stone-400 mt-1">Pending client requests will appear here in real time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(b => (
              <BookingCard 
                key={b.bookingId}
                booking={b}
                role="worker"
                onAction={handleBookingAction}
              />
            ))}
          </div>
        )
      ) : activeTab === 'active' ? (
        activeJobs.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-12 text-center text-stone-500 shadow-xs">
            <ClipboardList className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#283845] dark:text-white">No Active Jobs</h3>
            <p className="text-xs text-stone-400 mt-1">Accept incoming requests to start work and open chat.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeJobs.map(b => (
              <BookingCard 
                key={b.bookingId}
                booking={b}
                role="worker"
                onAction={handleBookingAction}
              />
            ))}
          </div>
        )
      ) : (
        earningsData.allCompletedJobs.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-12 text-center text-stone-500 shadow-xs">
            <ClipboardList className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#283845] dark:text-white">No Completed History</h3>
            <p className="text-xs text-stone-400 mt-1">Finished tasks and payment payouts will be logged here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 text-xs text-stone-500 dark:text-stone-400">
              <span>Showing all {earningsData.allCompletedJobs.length} completed contracts</span>
              <span className="text-[11px] font-semibold">Net Earnings: <strong className="text-[#283845] dark:text-[#FFA649]">₹{earningsData.totalIncome.toLocaleString('en-IN')}</strong></span>
            </div>

            {earningsData.allCompletedJobs.map(job => {
              const formattedDate = job.scheduledDate 
                ? new Date(job.scheduledDate).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) 
                : 'Completed';

              return (
                <div 
                  key={job.bookingId}
                  className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-2xl p-5 shadow-xs hover:border-[#FFA649]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-stone-400">
                        #{job.bookingId?.slice(-8).toUpperCase()}
                      </span>
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80">
                        Completed
                      </span>
                      {job.isLive ? (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Live Contract
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-[#EBE5DE] dark:border-white/10">
                          Historical Portfolio Job
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-[#283845] dark:text-white font-heading">
                      {job.jobType}
                    </h4>

                    <div className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                      Client: <span className="font-bold text-[#283845] dark:text-white">{job.customerName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {job.location}
                      </span>
                      {job.completionEvidence?.photoUrl && (
                        <a 
                          href={job.completionEvidence.photoUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[#FFA649] hover:underline font-semibold"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          Photo Evidence
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EBE5DE] dark:border-white/10">
                    <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider sm:block hidden">Payout</span>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-[#283845] dark:text-[#FFA649] font-mono">
                        ₹{job.netEarnings?.toLocaleString('en-IN') || 0}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Gross: ₹{job.grossAmount?.toLocaleString('en-IN') || 0}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Geotagged Completion Modal */}
      {completionModalBooking && (
        <JobCompletionModal
          booking={completionModalBooking}
          workerId={currentUser.uid}
          onClose={() => setCompletionModalBooking(null)}
          onSuccess={async () => {
            setCompletionModalBooking(null);
            await loadDashboardData();
          }}
        />
      )}
    </div>
  );
}
