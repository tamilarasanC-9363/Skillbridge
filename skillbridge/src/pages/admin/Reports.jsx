import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAllReports, updateReportStatus } from '../../services/reportService';
import { 
  Users as UsersIcon, FileBarChart2, Clock, 
  Calendar, ShieldAlert, CheckCircle, 
  CheckCircle2, X
} from 'lucide-react';

const STATUS_BADGES = {
  'Pending': 'bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] border-[#FFA649]/30',
  'Under Review': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'Resolved': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'Dismissed': 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700',
  'open': 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  'resolved': 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'resolved'
  const [resolvingReport, setResolvingReport] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const list = await getAllReports();
      setReports(list || []);
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleOpenResolveModal = (report) => {
    setResolvingReport(report);
    setResolutionNote(report.adminNotes || 'Dispute reviewed and resolved according to SkillBridge policies.');
  };

  const handleConfirmResolve = async () => {
    if (!resolvingReport) return;
    setActionLoading(true);
    try {
      await updateReportStatus(
        resolvingReport.reportId || resolvingReport.id, 
        'Resolved', 
        resolutionNote
      );
      setResolvingReport(null);
      await fetchReports();
    } catch (err) {
      console.error('Failed to resolve report:', err);
      alert('Failed to resolve report.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUnderReview = async (reportId) => {
    try {
      await updateReportStatus(reportId, 'Under Review', 'Support audit investigation currently in progress.');
      await fetchReports();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const pendingCount = reports.filter(r => ['Pending', 'open', 'Under Review'].includes(r.status)).length;

  const filteredReports = reports.filter(r => {
    if (activeFilter === 'pending') return ['Pending', 'open', 'Under Review'].includes(r.status);
    if (activeFilter === 'resolved') return ['Resolved', 'resolved'].includes(r.status);
    return true;
  });

  const sidebarLinks = [
    { label: 'Overview', path: '/admin', icon: FileBarChart2, end: true },
    { label: 'Worker Queue', path: '/admin/verification', icon: Clock },
    { label: 'All Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'User Directory', path: '/admin/users', icon: UsersIcon },
    { label: 'Reports', path: '/admin/reports', icon: ShieldAlert, badge: pendingCount }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-4 animate-fade-in text-left">
      <Sidebar links={sidebarLinks} title="Admin Panel" />

      <div className="flex-grow space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white leading-tight font-heading flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#FFA649]" />
              Disputes & Reports Management
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Audit customer complaints, worker grievances, payment discrepancies, and coordinate resolutions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-[#11171E] p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'all' 
                  ? 'bg-white dark:bg-[#1B2731] text-[#283845] dark:text-white shadow-xs font-bold' 
                  : 'text-stone-500 hover:text-[#283845] dark:hover:text-white'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'pending' 
                  ? 'bg-white dark:bg-[#1B2731] text-[#283845] dark:text-white shadow-xs font-bold' 
                  : 'text-stone-500 hover:text-[#283845] dark:hover:text-white'
              }`}
            >
              Open / Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveFilter('resolved')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'resolved' 
                  ? 'bg-white dark:bg-[#1B2731] text-[#283845] dark:text-white shadow-xs font-bold' 
                  : 'text-stone-500 hover:text-[#283845] dark:hover:text-white'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-12 text-center text-stone-500 shadow-xs">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#283845] dark:text-white font-heading">No Reports Found</h3>
            <p className="text-xs text-stone-400 mt-1">There are no reports matching this filter category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map(rep => {
              const repId = rep.reportId || rep.id;
              const isResolved = ['Resolved', 'resolved'].includes(rep.status);
              const formattedDate = rep.createdAt 
                ? new Date(rep.createdAt).toLocaleDateString(undefined, { 
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                  }) 
                : 'Recent';

              return (
                <div 
                  key={repId}
                  className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 text-xs text-left hover:border-[#FFA649]/40 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-stone-400">#{repId}</span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                          STATUS_BADGES[rep.status] || STATUS_BADGES.Pending
                        }`}>
                          {rep.status}
                        </span>
                        <span className="text-[10px] bg-stone-100 dark:bg-[#11171E] text-stone-700 dark:text-stone-300 font-bold px-2 py-0.5 rounded-md border border-[#EBE5DE] dark:border-white/10 uppercase">
                          Role: {rep.userRole || 'User'}
                        </span>
                        {rep.urgency && (
                          <span className="text-[10px] text-[#FFA649] font-bold bg-[#FFA649]/10 px-2 py-0.5 rounded-md">
                            {rep.urgency} Urgency
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-stone-400">
                        Submitted: {formattedDate}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#283845] dark:text-white font-heading">
                        {rep.category || rep.reason}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Reported by: <strong className="text-[#283845] dark:text-white">{rep.userName || rep.reporterName || 'User'}</strong>
                        {rep.bookingId && (
                          <span> • Booking ID: <strong className="text-[#FFA649] font-mono">#{rep.bookingId.slice(-6).toUpperCase()}</strong></span>
                        )}
                        {rep.bookingSummary && <span> ({rep.bookingSummary})</span>}
                      </p>
                    </div>

                    <p className="text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 p-3.5 rounded-xl italic leading-relaxed">
                      "{rep.description}"
                    </p>

                    {rep.adminNotes && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300">
                        <strong className="block font-bold">Admin Resolution:</strong>
                        <span className="italic">{rep.adminNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-[#EBE5DE] dark:border-white/10 flex flex-wrap items-center justify-end gap-2">
                    {!isResolved && rep.status !== 'Under Review' && (
                      <button
                        onClick={() => handleMarkUnderReview(repId)}
                        className="px-3.5 py-1.5 border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Mark Under Review
                      </button>
                    )}

                    {!isResolved ? (
                      <button
                        onClick={() => handleOpenResolveModal(rep)}
                        className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolve Dispute
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolved & Closed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolution Notes Modal */}
      {resolvingReport && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setResolvingReport(null)}
        >
          <div 
            className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EBE5DE] dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-[#283845] dark:text-white font-heading flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Resolve Incident Report
              </h3>
              <button 
                onClick={() => setResolvingReport(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400">
              Provide resolution notes to explain the outcome to the reporting user (#{resolvingReport.reportId}).
            </p>

            <textarea
              rows="3"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Price dispute investigated with specialist. Refund of ₹200 processed or policy reminder issued..."
              className="w-full bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-xl p-3 text-xs text-[#283845] dark:text-white placeholder-stone-400 focus:outline-none focus:border-emerald-500 resize-none"
              required
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setResolvingReport(null)}
                className="px-4 py-2 border border-[#EBE5DE] dark:border-white/10 text-stone-600 dark:text-stone-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                disabled={actionLoading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all"
              >
                {actionLoading ? 'Saving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
