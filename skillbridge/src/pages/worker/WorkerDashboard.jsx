import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getWorkerProfile, toggleAvailability } from '../../services/workerService';
import { getBookingsForUser, updateBookingStatus } from '../../services/bookingService';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import RatingStars from '../../components/RatingStars';
import { 
  Users, Briefcase, CheckCircle, Clock, Star, 
  IndianRupee, ToggleLeft, ToggleRight, ClipboardList, Info, ShieldAlert 
} from 'lucide-react';

export default function WorkerDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('incoming'); // incoming | active | history

  const loadDashboardData = async () => {
    try {
      // 1. Fetch worker profile
      const prof = await getWorkerProfile(currentUser.uid);
      setProfile(prof);

      // 2. Fetch worker bookings
      const list = await getBookingsForUser(currentUser.uid, 'worker');
      setBookings(list);
    } catch (err) {
      console.error('Error loading worker dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Listen to global changes
    window.addEventListener('sb_message_sent', loadDashboardData);
    return () => window.removeEventListener('sb_message_sent', loadDashboardData);
  }, [currentUser]);

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

  // Check if profile setup has been completed (i.e. has categories selected)
  const isSetupIncomplete = !profile || !profile.categories || profile.categories.length === 0;
  if (isSetupIncomplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in text-center">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-xs space-y-6">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
          <h1 className="text-2xl font-bold text-gray-900">Onboarding Incomplete</h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Welcome to SkillBridge! Before you can toggle availability, match with clients, or receive booking notifications, you must complete your worker profile and upload identification documents.
          </p>
          <Link
            to="/worker/profile/setup"
            className="inline-block px-8 py-3.5 text-sm font-bold text-white btn-gradient rounded-xl shadow-md"
          >
            Complete Onboarding Now
          </Link>
        </div>
      </div>
    );
  }

  // Filter Bookings
  const pendingRequests = bookings.filter(b => b.status === 'Pending');
  const activeJobs = bookings.filter(b => ['Accepted', 'In Progress'].includes(b.status));
  const completedJobs = bookings.filter(b => b.status === 'Completed');

  // Calculate earnings
  const mockEarnings = bookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => {
      // Extract first number in string, e.g. "₹300 – ₹800" -> 300
      const match = b.estimatedPrice?.replace(/[^0-9–]/g, '').split('–');
      const baseVal = match ? Number(match[0]) : 300;
      return sum + baseVal;
    }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">Worker Dashboard</h1>
            {profile.verified ? (
              <span className="bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Verified</span>
            ) : (
              <span className="bg-amber-50 text-amber-600 font-bold border border-amber-100 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Verification Pending</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Select availability, receive incoming client bookings, and track your total earnings.</p>
        </div>

        {/* Availability Toggle */}
        <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl flex items-center gap-4 shadow-3xs">
          <div className="text-left">
            <span className="block text-[10px] font-bold text-gray-400 uppercase">Availability Status</span>
            <span className={`text-xs font-bold ${profile.availability ? 'text-emerald-600' : 'text-gray-400'}`}>
              {profile.availability ? 'Available for Jobs' : 'Offline / Unavailable'}
            </span>
          </div>
          <button 
            onClick={handleToggleAvailability}
            disabled={availabilityLoading}
            className="text-primary hover:opacity-90 transition-opacity"
            title="Toggle Availability"
          >
            {profile.availability ? (
              <ToggleRight className="w-10 h-10 text-emerald-500 fill-current" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Verification Pending Info Callout */}
      {!profile.verified && (
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 mb-8 flex gap-3 text-xs text-amber-800 leading-relaxed">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Awaiting Document Approval:</span> Your uploaded Govt ID Proof and Skill Certificates are currently being verified by SkillBridge administration. You can accept jobs manually from the panel, but your profile will not appear in customer recommendation searches until verified.
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-gray-100 p-4 rounded-2xl text-center shadow-3xs flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-amber-100/90 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-[#78350F] dark:text-[#FCD34D] stroke-[2.2px]" />
          </div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase">Pending Requests</span>
          <span className="text-xl font-bold text-gray-900 mt-0.5 block">{pendingRequests.length}</span>
        </div>

        <div className="bg-white border border-gray-100 p-4 rounded-2xl text-center shadow-3xs flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-blue-100/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center mb-2">
            <Briefcase className="w-5 h-5 text-[#1E3A8A] dark:text-[#93C5FD] stroke-[2.2px]" />
          </div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase">Active Jobs</span>
          <span className="text-xl font-bold text-gray-900 mt-0.5 block">{activeJobs.length}</span>
        </div>

        <div className="bg-white border border-gray-100 p-4 rounded-2xl text-center shadow-3xs flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-[#064E3B] dark:text-[#6EE7B7] stroke-[2.2px]" />
          </div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase">Jobs Completed</span>
          <span className="text-xl font-bold text-gray-900 mt-0.5 block">{profile.completedJobs || completedJobs.length}</span>
        </div>

        <div className="bg-white border border-gray-100 p-4 rounded-2xl text-center shadow-3xs flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-amber-100/90 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center mb-2">
            <Star className="w-5 h-5 text-[#78350F] dark:text-[#FCD34D] fill-current" />
          </div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase">Rating average</span>
          <span className="text-xl font-bold text-gray-900 mt-0.5 block flex items-center justify-center gap-0.5">
            {profile.rating > 0 ? profile.rating.toFixed(1) : '—'} <span className="text-[10px] text-gray-400 font-semibold">({profile.reviewCount || 0})</span>
          </span>
        </div>

        <div className="bg-white border border-gray-100 p-4 rounded-2xl col-span-2 md:col-span-1 text-center shadow-3xs flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center mb-2">
            <IndianRupee className="w-5 h-5 text-[#064E3B] dark:text-[#6EE7B7] stroke-[2.2px]" />
          </div>
          <span className="block text-[10px] font-bold text-gray-600 uppercase">Est. Earnings</span>
          <span className="text-xl font-bold text-gray-900 mt-0.5 block">₹{mockEarnings}</span>
        </div>
      </div>

      {/* Booking Tabs Selector */}
      <div className="flex border-b border-gray-100 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'incoming' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-950'
          }`}
        >
          Incoming Requests ({pendingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'active' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-950'
          }`}
        >
          Active Assignments ({activeJobs.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'history' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-950'
          }`}
        >
          Completed History ({completedJobs.length})
        </button>
      </div>

      {/* Render selected tabs */}
      {activeTab === 'incoming' ? (
        pendingRequests.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 shadow-3xs">
            <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No New Requests</h3>
            <p className="text-xs text-gray-400 mt-1">You have no pending customer requests waiting for your acceptance.</p>
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
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 shadow-3xs">
            <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No Active Jobs</h3>
            <p className="text-xs text-gray-400 mt-1">Accept pending requests to begin working and unlock chats.</p>
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
        completedJobs.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 shadow-3xs">
            <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No Completed History</h3>
            <p className="text-xs text-gray-400 mt-1">Complete your active jobs to build your client rating and profile history.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedJobs.map(b => (
              <BookingCard 
                key={b.bookingId}
                booking={b}
                role="worker"
                onAction={handleBookingAction}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
