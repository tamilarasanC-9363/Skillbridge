import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { getWorkerProfile } from '../../services/workerService';
import { getReviewsForWorker } from '../../services/reviewService';
import { createBooking } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import RatingStars from '../../components/RatingStars';
import VerifiedBadge from '../../components/VerifiedBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import PriceEstimate from '../../components/PriceEstimate';
import BackButton from '../../components/BackButton';
import { WORKER_ACHIEVEMENTS } from '../worker/WorkerProfileEdit';
import { MapPin, Award, Calendar, Clock, MessageSquare, ClipboardList, Sparkles, CheckCircle } from 'lucide-react';

export default function WorkerProfile() {
  const { workerId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [worker, setWorker] = useState(state?.worker || null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract ongoing booking requirements from route state if present
  const bookingCriteria = state?.bookingRequest || null;

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      setError('');
      try {
        if (!worker) {
          const profile = await getWorkerProfile(workerId);
          if (!profile) {
            setError('Worker profile not found.');
            return;
          }
          setWorker(profile);
        }

        const workerReviews = await getReviewsForWorker(workerId);
        setReviews(workerReviews);
      } catch (err) {
        console.error(err);
        setError('Error loading worker details.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [workerId]);

  const handleConfirmBooking = async () => {
    if (!bookingCriteria || !worker) return;
    setBookingLoading(true);
    setError('');

    try {
      const payload = {
        customerId: currentUser.uid,
        customerName: currentUser.name,
        workerId: worker.userId,
        workerName: worker.name,
        category: bookingCriteria.category,
        jobType: bookingCriteria.jobType,
        bookingType: bookingCriteria.bookingType,
        location: bookingCriteria.location,
        scheduledDate: bookingCriteria.scheduledDate,
        scheduledTime: bookingCriteria.scheduledTime,
        estimatedPrice: getEstimatedPrice(bookingCriteria.category, bookingCriteria.jobType) || worker.priceRange || '₹300 – ₹800',
        description: bookingCriteria.description,
        urgency: bookingCriteria.urgency
      };

      const result = await createBooking(payload);
      
      // Redirect directly to the detail page of the created booking
      navigate(`/customer/booking/${result.bookingId}`, { 
        state: { successMsg: 'Booking request sent successfully!' } 
      });
    } catch (err) {
      console.error(err);
      setError('Failed to submit booking request. Please try again.');
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
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-4 text-xs font-semibold">
          {error || 'Worker details are unavailable.'}
        </div>
        <div className="mt-4">
          <BackButton to="/customer" label="Back to Dashboard" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton 
        to={bookingCriteria ? "/customer/workers" : "/customer"} 
        state={state?.bookingRequest ? state.bookingRequest : null}
        label={bookingCriteria ? "Back to Listings" : "Back to Dashboard"}
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Profile Summary Card & Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Box */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 flex justify-center">
              <img 
                src={worker.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=2563EB&color=fff`} 
                alt={worker.name} 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border border-gray-50 shadow-inner"
              />
            </div>
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{worker.name}</h1>
                <VerifiedBadge verified={worker.verified} size="md" />
              </div>

              <div className="text-xs text-gray-400 font-semibold mt-1">
                Category: {worker.categories?.join(', ') || 'General Repair'}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                <RatingStars rating={worker.rating} count={worker.reviewCount} />
                <span className="flex items-center gap-1 text-xs text-gray-500 font-semibold bg-gray-50 px-2 py-0.5 rounded-md">
                  <Award className="w-4 h-4 text-primary" />
                  {worker.experience} Years Experience
                </span>
                <span className="text-xs bg-blue-50 text-primary font-bold px-2 py-0.5 rounded-md">
                  {worker.completedJobs} Jobs Completed
                </span>
              </div>

              <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                <MapPin className="w-4 h-4 text-gray-400" />
                Service Location: {worker.location}
              </div>

              <p className="text-sm text-gray-600 mt-4 leading-relaxed italic">
                "{worker.bio || 'Experienced background-verified skilled worker committed to delivering top quality service.'}"
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-3">Skills & Capabilities</h2>
            <div className="flex flex-wrap gap-2">
              {worker.skills?.map(skill => (
                <span key={skill} className="bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-100 shadow-3xs">
                  {skill}
                </span>
              )) || <span className="text-xs text-gray-400">No specific skills listed.</span>}
            </div>
          </div>

          {/* Achievements Showcase Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-primary" />
                  Completed Work Portfolio & Achievements
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Real verified project pictures and past work completed by this specialist.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {WORKER_ACHIEVEMENTS.slice(0, 4).map(item => (
                <div 
                  key={item.id} 
                  className="group bg-gray-50 border border-gray-100 hover:border-primary/40 rounded-2xl overflow-hidden shadow-3xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative w-full h-36 overflow-hidden bg-slate-900">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                    {item.category && (
                      <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-primary border border-primary/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="p-3.5 space-y-1.5 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary" />
                        {item.completedDate}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-5">Customer Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 font-medium">
                No reviews yet. Completed jobs will show user reviews here.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 space-y-4">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="pt-4 first:pt-0 text-xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-gray-800">Verified Client</span>
                      <RatingStars rating={rev.rating} showNumber={false} />
                    </div>
                    <p className="text-gray-600 leading-relaxed italic">"{rev.comment}"</p>
                    <span className="text-[10px] text-gray-400 block mt-2">
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
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs sticky top-24 space-y-5">
              <h3 className="text-base font-bold text-gray-900">Your Booking Details</h3>
              
              <div className="space-y-3.5 text-xs text-gray-600 bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Service Job</span>
                  <span className="font-semibold text-gray-800">{bookingCriteria.jobType}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-0.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {bookingCriteria.location}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {bookingCriteria.scheduledDate}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Time</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {bookingCriteria.scheduledTime}
                    </span>
                  </div>
                </div>
                {bookingCriteria.description && (
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Description</span>
                    <span className="font-medium italic">"{bookingCriteria.description}"</span>
                  </div>
                )}
              </div>

              {/* Price Estimate Widget */}
              <PriceEstimate category={bookingCriteria.category} jobType={bookingCriteria.jobType} customRange={worker.priceRange} showDisclaimer={true} />

              <button
                onClick={handleConfirmBooking}
                disabled={bookingLoading || !worker.availability}
                className="w-full py-3 text-sm font-bold text-white btn-gradient rounded-xl shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {bookingLoading ? <LoadingSpinner size="sm" color="white" /> : 'Confirm & Request Booking'}
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs text-center sticky top-24">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-800">Booking Requirements Not Found</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                You arrived at this profile without inputting your job specifications. Go back to search to select dates and locations.
              </p>
              <Link 
                to="/customer/search"
                className="w-full mt-5 inline-block py-2.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-xs"
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
