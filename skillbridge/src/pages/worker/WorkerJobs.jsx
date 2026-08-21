import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForUser, updateBookingStatus } from '../../services/bookingService';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Briefcase, Calendar, Clock, MapPin, CheckCircle, 
  XCircle, Play, CheckSquare, MessageSquare, AlertCircle, 
  IndianRupee, User, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_PILL_STYLES = {
  'Pending': 'bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] border-[#FFA649]/30',
  'Accepted': 'bg-[#283845]/10 dark:bg-[#283845]/40 text-[#283845] dark:text-[#FFA649] border-[#283845]/30',
  'In Progress': 'bg-[#FFA649]/25 text-[#1B2731] dark:text-[#FFA649] border-[#FFA649]/40',
  'Completed': 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
  'Rejected': 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
  'Cancelled': 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-700'
};

export default function WorkerJobs() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'incoming', 'ongoing', 'completed'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchJobs = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const list = await getBookingsForUser(currentUser.uid, 'worker');
      setJobs(list || []);
    } catch (err) {
      console.error('Error loading worker jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    fetchJobs();

    window.addEventListener('sb_message_sent', fetchJobs);
    return () => window.removeEventListener('sb_message_sent', fetchJobs);
  }, [fetchJobs]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setActionLoadingId(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus);
      await fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const incomingJobs = jobs.filter(j => j.status === 'Pending');
  const ongoingJobs = jobs.filter(j => ['Accepted', 'In Progress'].includes(j.status));
  const completedJobs = jobs.filter(j => ['Completed', 'Rejected', 'Cancelled'].includes(j.status));

  const displayedJobs = activeTab === 'incoming' 
    ? incomingJobs 
    : activeTab === 'ongoing' 
    ? ongoingJobs 
    : activeTab === 'completed' 
    ? completedJobs 
    : jobs;

  const sidebarLinks = [
    { label: 'Overview Dashboard', path: '/worker', icon: Briefcase, end: true },
    { label: 'Incoming Job Requests', path: '/worker/requests', icon: Clock, badge: incomingJobs.length },
    { label: 'Active Service Tasks', path: '/worker/jobs', icon: Play, badge: ongoingJobs.length },
    { label: 'My Bookings History', path: '/worker/bookings', icon: CheckSquare },
    { label: 'Customer Feedbacks', path: '/worker/feedbacks', icon: Star }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-4 animate-fade-in text-left">
      <Sidebar links={sidebarLinks} title="Worker Portal" />

      <div className="flex-grow space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white font-heading flex items-center gap-2.5">
              <Briefcase className="w-6 h-6 text-[#FFA649]" />
              Manage Job Assignments
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Review direct customer hire requests, track in-progress projects, and update completed statuses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-[#FFA649]/15 border border-[#FFA649]/30 text-[#283845] dark:text-[#FFA649] text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FFA649]" />
              {incomingJobs.length} New Requests
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              {ongoingJobs.length} Active
            </span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex border-b border-[#EBE5DE] dark:border-white/10 gap-3 sm:gap-6 overflow-x-auto pb-1 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-[#FFA649] text-[#283845] dark:text-[#FFA649]'
                : 'border-transparent text-stone-500 hover:text-[#283845] dark:hover:text-white'
            }`}
          >
            All Assigned Jobs ({jobs.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('incoming')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'incoming'
                ? 'border-[#FFA649] text-[#283845] dark:text-[#FFA649]'
                : 'border-transparent text-stone-500 hover:text-[#283845] dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FFA649] animate-pulse" />
            Incoming Requests ({incomingJobs.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ongoing')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ongoing'
                ? 'border-[#FFA649] text-[#283845] dark:text-[#FFA649]'
                : 'border-transparent text-stone-500 hover:text-[#283845] dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Active Tasks ({ongoingJobs.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'completed'
                ? 'border-[#FFA649] text-[#283845] dark:text-[#FFA649]'
                : 'border-transparent text-stone-500 hover:text-[#283845] dark:hover:text-white'
            }`}
          >
            Completed History ({completedJobs.length})
          </button>
        </div>

        {/* Loading / Content List */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-12 text-center text-stone-500 shadow-xs space-y-3">
            <AlertCircle className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
            <h3 className="text-base font-bold text-[#283845] dark:text-white font-heading">No jobs found in this section</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              New client bookings matching your trade skills and active location will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedJobs.map(job => {
              const formattedDate = job.scheduledDate
                ? new Date(job.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                : 'Immediate';

              return (
                <div 
                  key={job.bookingId}
                  className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-xs hover:border-[#FFA649]/60 transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Top Row: Tag, Booking ID, Price */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBE5DE] dark:border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${STATUS_PILL_STYLES[job.status] || STATUS_PILL_STYLES.Pending}`}>
                        {job.status}
                      </span>
                      <span className="text-[11px] font-mono text-stone-400 font-bold">
                        #{job.bookingId?.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#11171E] text-[#283845] dark:text-[#FFA649] border border-[#EBE5DE] dark:border-white/10">
                        {job.bookingType || 'Instant'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-base font-extrabold text-[#283845] dark:text-white">
                      <IndianRupee className="w-4 h-4 text-[#FFA649]" />
                      <span>{job.estimatedPrice || '₹300 – ₹1,000'}</span>
                    </div>
                  </div>

                  {/* Main Job Information */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#283845] dark:text-white font-heading group-hover:text-[#FFA649] transition-colors">
                        {job.jobType} <span className="text-xs text-stone-500 font-normal">({job.category})</span>
                      </h3>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-stone-600 dark:text-stone-300">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>Client: <span className="font-bold text-[#283845] dark:text-white">{job.customerName || 'Local Resident'}</span></span>
                        {job.customerPhone && (
                          <>
                            <span>•</span>
                            <span className="text-stone-500 font-mono">{job.customerPhone}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Logistics Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 text-xs">
                      <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                        <Calendar className="w-4 h-4 text-[#FFA649] flex-shrink-0" />
                        <div>
                          <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Scheduled Date</span>
                          <span className="font-bold text-[#283845] dark:text-white">{formattedDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                        <Clock className="w-4 h-4 text-[#FFA649] flex-shrink-0" />
                        <div>
                          <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Time Window</span>
                          <span className="font-bold text-[#283845] dark:text-white">{job.scheduledTime || 'Immediate'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                        <MapPin className="w-4 h-4 text-[#FFA649] flex-shrink-0" />
                        <div>
                          <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Location</span>
                          <span className="font-bold text-[#283845] dark:text-white">{job.location || 'Local Area'}</span>
                        </div>
                      </div>
                    </div>

                    {job.description && (
                      <p className="text-xs text-stone-600 dark:text-stone-300 italic bg-stone-50 dark:bg-[#11171E] p-3 rounded-xl border border-[#EBE5DE] dark:border-white/10">
                        "{job.description}"
                      </p>
                    )}
                  </div>

                  {/* Actions & Next Steps */}
                  <div className="mt-5 pt-4 border-t border-[#EBE5DE] dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {['Accepted', 'In Progress', 'Completed'].includes(job.status) && (
                        <button
                          type="button"
                          onClick={() => navigate(`/worker/chat/chat_${job.bookingId}`, { state: { booking: job } })}
                          className="px-4 py-2 bg-[#FFA649]/15 hover:bg-[#FFA649]/25 text-[#283845] dark:text-[#FFA649] font-bold text-xs rounded-xl border border-[#FFA649]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#FFA649]" />
                          Open Direct Chat
                        </button>
                      )}
                    </div>

                    {/* Status Triggers */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {job.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoadingId === job.bookingId}
                            onClick={() => handleStatusChange(job.bookingId, 'Accepted')}
                            className="flex-1 sm:flex-initial px-5 py-2 btn-gradient text-[#11171E] font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept Job Request
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === job.bookingId}
                            onClick={() => handleStatusChange(job.bookingId, 'Rejected')}
                            className="flex-1 sm:flex-initial px-4 py-2 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            Decline
                          </button>
                        </>
                      )}

                      {job.status === 'Accepted' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === job.bookingId}
                          onClick={() => handleStatusChange(job.bookingId, 'In Progress')}
                          className="flex-1 sm:flex-initial px-5 py-2 btn-gradient text-[#11171E] font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-4 h-4" />
                          Start Job (Begin Service)
                        </button>
                      )}

                      {job.status === 'In Progress' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === job.bookingId}
                          onClick={() => handleStatusChange(job.bookingId, 'Completed')}
                          className="flex-1 sm:flex-initial px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Job Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
