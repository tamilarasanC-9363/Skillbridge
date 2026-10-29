import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submitReport, getReportsForUser } from '../../services/reportService';
import { getBookingsForUser } from '../../services/bookingService';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  ShieldAlert, PlusCircle, CheckCircle2, Clock, 
  AlertTriangle, FileText, Send, Calendar, CheckSquare, 
  Briefcase, Play, Star, HelpCircle
} from 'lucide-react';

const WORKER_CATEGORIES = [
  'Customer Issue (Unreachable, Abuse, Site Access Refusal)',
  'Booking Dispute (Scope Mismatch, Wrong Address, Additional Work)',
  'Payment Problem (Non-payment, Deductions, Refusal to Settle)',
  'Cancellation Dispute (Customer Late Cancellation)',
  'Safety & Site Hazard Concern',
  'Other Concern'
];

const STATUS_BADGES = {
  'Pending': 'bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] border-[#FFA649]/30',
  'Under Review': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'Resolved': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'Dismissed': 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
};

const URGENCY_BADGES = {
  'Low': 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  'Medium': 'bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649]',
  'High': 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold'
};

export default function WorkerReports() {
  const { currentUser } = useAuth();
  const location = useLocation();

  const [reports, setReports] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  
  // Form State
  const [category, setCategory] = useState(WORKER_CATEGORIES[0]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const [userReports, userJobs] = await Promise.all([
        getReportsForUser(currentUser.uid, 'worker'),
        getBookingsForUser(currentUser.uid, 'worker')
      ]);
      setReports(userReports || []);
      setJobs(userJobs || []);

      const params = new URLSearchParams(location.search);
      const preselectedId = params.get('bookingId') || location.state?.bookingId;
      if (preselectedId) {
        setSelectedBookingId(preselectedId);
        setActiveTab('create');
      }
    } catch (err) {
      console.error('Error loading worker reports data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, location.search, location.state]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!description.trim() || description.trim().length < 10) {
      setFormError('Please provide a detailed description with at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const chosenJob = jobs.find(b => b.bookingId === selectedBookingId);
      const bookingSummary = chosenJob 
        ? `${chosenJob.jobType} (${chosenJob.customerName || 'Client'})` 
        : null;

      const newReport = await submitReport({
        userId: currentUser.uid,
        userName: currentUser.name || 'Worker',
        userRole: 'worker',
        bookingId: selectedBookingId || null,
        bookingSummary,
        category,
        description,
        urgency
      });

      setReports(prev => [newReport, ...prev]);
      setSuccessMessage(`Report #${newReport.reportId} successfully lodged. Support will investigate.`);
      setDescription('');
      setSelectedBookingId('');
      setCategory(WORKER_CATEGORIES[0]);
      setActiveTab('list');

      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err) {
      console.error('Failed to submit report:', err);
      setFormError(err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const incomingJobsCount = jobs.filter(j => j.status === 'Pending').length;
  const ongoingJobsCount = jobs.filter(j => ['Accepted', 'In Progress'].includes(j.status)).length;

  const sidebarLinks = [
    { label: 'Overview Dashboard', path: '/worker', icon: Briefcase, end: true },
    { label: 'Incoming Job Requests', path: '/worker/requests', icon: Clock, badge: incomingJobsCount },
    { label: 'Active Service Tasks', path: '/worker/jobs', icon: Play, badge: ongoingJobsCount },
    { label: 'My Bookings History', path: '/worker/bookings', icon: CheckSquare },
    { label: 'Disputes & Reports', path: '/worker/reports', icon: ShieldAlert, badge: reports.filter(r => r.status === 'Pending').length },
    { label: 'Customer Feedbacks', path: '/worker/feedbacks', icon: Star }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-4 animate-fade-in text-left">
      <Sidebar links={sidebarLinks} title="Worker Portal" />

      <div className="flex-grow space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white font-heading flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-[#FFA649]" />
              Disputes & Incident Reports
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              File customer disputes, site safety issues, payment failures, or unwarranted cancellations.
            </p>
          </div>

          <button
            onClick={() => {
              setActiveTab(activeTab === 'create' ? 'list' : 'create');
              setFormError('');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                : 'text-[#11171E] btn-gradient'
            }`}
          >
            {activeTab === 'create' ? (
              <>
                <CheckSquare className="w-4 h-4" />
                <span>View My Reports ({reports.length})</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>File New Report</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#EBE5DE] dark:border-white/10 gap-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'border-[#FFA649] text-[#283845] dark:text-[#FFA649]'
                : 'border-transparent text-stone-500 hover:text-[#283845] dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            My Filed Reports ({reports.length})
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'border-[#FFA649] text-[#283845] dark:text-[#FFA649]'
                : 'border-transparent text-stone-500 hover:text-[#283845] dark:hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            File New Concern
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl p-4 text-xs font-bold animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : activeTab === 'create' ? (
          /* Create Report Form */
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs animate-fade-in">
            <div className="border-b border-[#EBE5DE] dark:border-white/10 pb-4 mb-6">
              <h2 className="text-lg font-bold text-[#283845] dark:text-white font-heading">
                File a Worker Dispute / Incident Report
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                SkillBridge takes worker protection, fair compensation, and site security seriously.
              </p>
            </div>

            {formError && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-3 text-xs font-semibold mb-5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-extrabold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-2">
                    Issue Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-xl p-3 text-xs text-[#283845] dark:text-white focus:outline-none focus:border-[#FFA649]"
                    required
                  >
                    {WORKER_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-xs font-extrabold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-2">
                    Urgency Level *
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-xl p-3 text-xs text-[#283845] dark:text-white focus:outline-none focus:border-[#FFA649]"
                  >
                    <option value="Low">Low – Non-urgent notification / feedback</option>
                    <option value="Medium">Medium – Standard payment / customer dispute</option>
                    <option value="High">High – Unpaid completed contract or severe hostility</option>
                  </select>
                </div>
              </div>

              {/* Related Job */}
              <div>
                <label className="block text-xs font-extrabold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-2">
                  Associated Job Booking (Optional)
                </label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-xl p-3 text-xs text-[#283845] dark:text-white focus:outline-none focus:border-[#FFA649]"
                >
                  <option value="">General platform / customer issue (Not tied to a booking)</option>
                  {jobs.map(b => (
                    <option key={b.bookingId} value={b.bookingId}>
                      #{b.bookingId?.slice(-6).toUpperCase()} – {b.jobType} for {b.customerName || 'Client'} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-extrabold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-2">
                  Detailed Incident Statement *
                </label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the dispute (e.g. customer refused payment, site had unmentioned safety hazards, customer was unreachable upon arrival)..."
                  className="w-full bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-xl p-3 text-xs text-[#283845] dark:text-white placeholder-stone-400 focus:outline-none focus:border-[#FFA649] resize-none"
                  required
                />
                <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1">
                  <span>Minimum 10 characters</span>
                  <span>{description.length} characters</span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 flex items-start gap-2.5 text-[11px] text-stone-500 dark:text-stone-400">
                <HelpCircle className="w-4 h-4 text-[#FFA649] flex-shrink-0 mt-0.5" />
                <span>
                  Admin auditors examine worker grievances. For payment discrepancies on completed bookings with uploaded evidence, SkillBridge payment protection covers validated contracts.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-5 py-2.5 border border-[#EBE5DE] dark:border-white/10 text-stone-600 dark:text-stone-300 hover:text-[#283845] dark:hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-2.5 btn-gradient text-[#11171E] font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Lodging Report...' : 'Lodge Incident Report'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Reports List */
          reports.length === 0 ? (
            <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-12 text-center text-stone-500 shadow-xs space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-[#283845] dark:text-white font-heading">
                No Disputes Filed
              </h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                You have not filed any incident reports. All completed contracts and client relationships are in good standing.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                File a Concern
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(rep => {
                const formattedDate = rep.createdAt 
                  ? new Date(rep.createdAt).toLocaleDateString(undefined, { 
                      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    }) 
                  : 'Recent';

                return (
                  <div
                    key={rep.reportId}
                    className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 shadow-xs hover:border-[#FFA649]/40 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBE5DE] dark:border-white/10 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-stone-400">
                          #{rep.reportId}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          STATUS_BADGES[rep.status] || STATUS_BADGES.Pending
                        }`}>
                          {rep.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          URGENCY_BADGES[rep.urgency] || URGENCY_BADGES.Medium
                        }`}>
                          {rep.urgency} Urgency
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-stone-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#283845] dark:text-white font-heading">
                        {rep.category}
                      </h3>

                      {rep.bookingId && (
                        <div className="text-xs text-[#FFA649] font-medium mt-0.5 flex items-center gap-1">
                          <span>Job Reference:</span>
                          <span className="font-mono font-bold">#{rep.bookingId.slice(-6).toUpperCase()}</span>
                          {rep.bookingSummary && <span>({rep.bookingSummary})</span>}
                        </div>
                      )}

                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed bg-stone-50 dark:bg-[#11171E] p-3.5 rounded-2xl border border-[#EBE5DE] dark:border-white/10 italic">
                        "{rep.description}"
                      </p>
                    </div>

                    {/* Resolution Notes from Admin */}
                    {rep.adminNotes ? (
                      <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Administrative Resolution & Action Taken</span>
                        </div>
                        <p className="italic text-[11px] leading-relaxed">
                          "{rep.adminNotes}"
                        </p>
                      </div>
                    ) : (
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Under administrative review. You will be notified when investigation concludes.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

