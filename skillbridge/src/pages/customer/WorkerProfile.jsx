import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getWorkerProfile } from '../../services/workerService';
import { getReviewsForWorker } from '../../services/reviewService';
import { createBooking, getBookingsForUser } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import RatingStars from '../../components/RatingStars';
import VerifiedBadge from '../../components/VerifiedBadge';
import PriceEstimate from '../../components/PriceEstimate';
import LoadingSpinner from '../../components/LoadingSpinner';
import BackButton from '../../components/BackButton';
import { 
  Award, MapPin, CheckCircle, Calendar, Clock, 
  Briefcase, Sparkles, Mail, ClipboardList, User 
} from 'lucide-react';

export default function WorkerProfile() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { withLoading } = useLoading();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract initial search context passed from search flow
  const bookingCriteria = location.state?.bookingCriteria || null;

  useEffect(() => {
    const fetchWorkerData = async () => {
      setLoading(true);
      try {
        const prof = await getWorkerProfile(workerId);
        if (!prof) {
          setError('Worker profile not found.');
          return;
        }
        setWorker(prof);

        const revs = await getReviewsForWorker(workerId);
        setReviews(revs || []);

        const allBookings = await getBookingsForUser(workerId, 'worker');
        const completed = (allBookings || []).filter(b => b.status === 'Completed');
        setCompletedProjects(completed);
      } catch (err) {
        console.error(err);
        setError('Error fetching profile information.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerData();
  }, [workerId]);

  const handleConfirmBooking = async () => {
    if (!currentUser) {
      navigate('/login', { state: { message: 'Please log in to hire this worker.' } });
      return;
    }

    if (!bookingCriteria) {
      navigate('/customer/search');
      return;
    }

    setBookingLoading(true);
    try {
      await withLoading(async () => {
        const newBooking = await createBooking({
          customerId: currentUser.uid,
          customerName: currentUser.name,
          customerPhone: currentUser.phone,
          workerId: worker.userId,
          workerName: worker.name,
          category: bookingCriteria.category,
          jobType: bookingCriteria.jobType,
          location: bookingCriteria.location,
          scheduledDate: bookingCriteria.scheduledDate,
          scheduledTime: bookingCriteria.scheduledTime,
          description: bookingCriteria.description,
          estimatedPrice: worker.priceRange || '₹300 – ₹1,000'
        });

        navigate(`/customer/booking/${newBooking.bookingId}`);
      }, {
        title: 'Almost there!',
        subtitle: 'Setting everything up for you…'
      });
    } catch (err) {
      console.error(err);
      alert('Booking creation failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="max-w-md mx-auto py-12 text-center animate-fade-in">
        <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-4 text-xs font-semibold">
          {error || 'Worker profile not found.'}
        </div>
        <div className="mt-4">
          <BackButton to="/customer/search" label="Back to Search" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to="/customer/search" label="Back to Search Results" className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Worker Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 flex justify-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#283845] to-[#1B2731] border-2 border-[#FFA649]/30 shadow-md flex flex-col items-center justify-center text-[#FFA649]">
                <User className="w-10 h-10 mb-1" />
                <span className="text-xs font-extrabold tracking-wider uppercase font-mono">
                  {worker.name?.slice(0, 2) || 'SP'}
                </span>
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-[#283845] dark:text-white font-heading">{worker.name}</h1>
                <VerifiedBadge verified={worker.verified} worker={worker} />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <RatingStars rating={worker.rating} count={worker.reviewCount} />
              </div>

              <div className="flex flex-wrap gap-2 mt-3.5">
                <span className="flex items-center gap-1 text-xs text-[#283845] dark:text-[#FFA649] font-bold bg-[#FFA649]/15 px-2.5 py-0.5 rounded-lg border border-[#FFA649]/30">
                  <Award className="w-3.5 h-3.5 text-[#FFA649]" />
                  {worker.experience} Years Experience
                </span>
                <span className="text-xs bg-[#283845]/10 dark:bg-[#283845]/40 text-[#283845] dark:text-[#FFA649] font-bold px-2.5 py-0.5 rounded-lg border border-[#283845]/20 dark:border-[#FFA649]/30">
                  {completedProjects.length > 0 ? completedProjects.length : (worker.completedJobs || 0)} Jobs Completed
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-3 text-xs text-stone-600 dark:text-stone-300">
                <MapPin className="w-4 h-4 text-stone-400 dark:text-stone-400" />
                <span>Service Location: <span className="font-bold text-[#283845] dark:text-white">{worker.location}</span></span>
              </div>

              {worker.email && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-stone-600 dark:text-stone-300">
                  <Mail className="w-4 h-4 text-[#FFA649]" />
                  <span>Demo ID: <span className="font-mono font-semibold text-[#283845] dark:text-[#FFA649]">{worker.email}</span></span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-4 leading-relaxed italic">
                "{worker.bio || 'Experienced background-verified skilled worker committed to delivering top quality service.'}"
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-bold text-[#283845] dark:text-white mb-3 font-heading">Skills & Capabilities</h2>
            <div className="flex flex-wrap gap-2">
              {worker.skills?.map(skill => (
                <span key={skill} className="bg-stone-100 dark:bg-[#11171E] text-[#283845] dark:text-stone-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#EBE5DE] dark:border-white/10">
                  {skill}
                </span>
              )) || <span className="text-xs text-stone-400">No specific skills listed.</span>}
            </div>
          </div>

          {/* Completed Work Showcase Section */}
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-[#283845] dark:text-white flex items-center gap-2 font-heading">
                  <Sparkles className="w-4.5 h-4.5 text-[#FFA649]" />
                  Completed Work Portfolio ({completedProjects.length})
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Verified project pictures and real completed job records on SkillBridge.
                </p>
              </div>
            </div>

            {completedProjects.length === 0 ? (
              <div className="text-center py-8 px-4 bg-stone-50/70 dark:bg-[#11171E] rounded-2xl border border-dashed border-[#EBE5DE] dark:border-white/10 space-y-2">
                <Briefcase className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
                <h4 className="text-xs font-bold text-[#283845] dark:text-white">No Completed Projects Yet</h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Completed work images and project details will appear here automatically once this specialist completes a booking.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {completedProjects.map((item) => {
                  const dateStr = item.completedAt || item.scheduledDate || item.createdAt;
                  const formattedDate = dateStr 
                    ? new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recently Completed';

                  return (
                    <div 
                      key={item.bookingId} 
                      className="group bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 hover:border-[#FFA649]/60 dark:hover:border-[#FFA649]/60 rounded-2xl overflow-hidden shadow-3xs hover:shadow-md transition-all duration-300 flex flex-col"
                    >
                      {item.workImageUrl || item.imageUrl ? (
                        <div className="relative w-full h-36 overflow-hidden bg-slate-900">
                          <img 
                            src={item.workImageUrl || item.imageUrl} 
                            alt={item.jobType || 'Completed Job'} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                          {item.category && (
                            <span className="absolute top-2.5 left-2.5 bg-[#283845]/90 text-[#FFA649] border border-[#FFA649]/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {item.category}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-stone-100 dark:bg-[#18222B] border-b border-[#EBE5DE] dark:border-white/10 flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-[#FFA649] uppercase tracking-wider bg-[#FFA649]/10 px-2 py-0.5 rounded-md border border-[#FFA649]/20">
                            {item.category || 'Trade Service'}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Verified Completed Job
                          </span>
                        </div>
                      )}

                      <div className="p-3.5 space-y-1.5 flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#283845] dark:text-white leading-snug group-hover:text-[#FFA649] transition-colors">
                            {item.jobType || 'Service Completion'}
                          </h4>
                          <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2 mt-1">
                            {item.description || 'Successfully completed on-site service delivery meeting customer specifications.'}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-[#EBE5DE] dark:border-white/10 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 font-semibold">
                          <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                            <Calendar className="w-3 h-3 text-[#FFA649]" />
                            {formattedDate}
                          </span>
                          {item.location && (
                            <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                              <MapPin className="w-3 h-3 text-[#FFA649]" />
                              {item.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-bold text-[#283845] dark:text-white mb-5 font-heading">Customer Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-400 font-medium">
                No reviews yet. Completed jobs will show user reviews here.
              </div>
            ) : (
              <div className="divide-y divide-[#EBE5DE] dark:divide-white/10 space-y-4">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="pt-4 first:pt-0 text-xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-[#283845] dark:text-white">Verified Client</span>
                      <RatingStars rating={rev.rating} showNumber={false} />
                    </div>
                    <p className="text-stone-600 dark:text-stone-300 leading-relaxed italic">"{rev.comment}"</p>
                    <span className="text-[10px] text-stone-400 block mt-2">
                      Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Booking Panel Sidebar */}
        <div className="lg:col-span-1">
          {bookingCriteria ? (
            <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 shadow-xs sticky top-24 space-y-5">
              <h3 className="text-base font-bold text-[#283845] dark:text-white font-heading">Your Booking Details</h3>
              
              <div className="space-y-3.5 text-xs bg-stone-50 dark:bg-[#11171E] p-4 rounded-2xl border border-[#EBE5DE] dark:border-white/10">
                <div>
                  <span className="block text-[10px] text-[#283845]/70 dark:text-[#FFA649] font-extrabold uppercase tracking-wider">Service Job</span>
                  <span className="font-bold text-[#283845] dark:text-white text-sm">{bookingCriteria.jobType}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#283845]/70 dark:text-[#FFA649] font-extrabold uppercase tracking-wider">Location</span>
                  <span className="font-bold text-[#283845] dark:text-white flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FFA649]" />
                    {bookingCriteria.location}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] text-[#283845]/70 dark:text-[#FFA649] font-extrabold uppercase tracking-wider">Date</span>
                    <span className="font-bold text-[#283845] dark:text-white flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FFA649]" />
                      {bookingCriteria.scheduledDate}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#283845]/70 dark:text-[#FFA649] font-extrabold uppercase tracking-wider">Time</span>
                    <span className="font-bold text-[#283845] dark:text-white flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#FFA649]" />
                      {bookingCriteria.scheduledTime}
                    </span>
                  </div>
                </div>
                {bookingCriteria.description && (
                  <div>
                    <span className="block text-[10px] text-[#283845]/70 dark:text-[#FFA649] font-extrabold uppercase tracking-wider">Description</span>
                    <span className="font-medium text-[#283845] dark:text-white italic">"{bookingCriteria.description}"</span>
                  </div>
                )}
              </div>

              {/* Price Estimate Widget */}
              <PriceEstimate category={bookingCriteria.category} jobType={bookingCriteria.jobType} customRange={worker.priceRange} showDisclaimer={true} />

              <button
                onClick={handleConfirmBooking}
                disabled={bookingLoading || !worker.availability}
                className="w-full py-3 text-sm font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {bookingLoading ? <LoadingSpinner size="sm" color="white" /> : 'Confirm & Request Booking'}
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 shadow-xs text-center sticky top-24">
              <ClipboardList className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#283845] dark:text-white">Booking Requirements Not Found</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                You arrived at this profile without inputting your job specifications. Go back to search to select dates and locations.
              </p>
              <Link 
                to="/customer/search"
                className="w-full mt-5 inline-block py-2.5 text-xs font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-xs"
              >
                Start Service Search
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
