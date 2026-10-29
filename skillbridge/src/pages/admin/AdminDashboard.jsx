import { useEffect, useState, useCallback } from 'react';
import { getAllWorkerProfiles } from '../../services/workerService';
import { getBookingsForUser } from '../../services/bookingService';
import { getAllBulkRequests, updateBulkRequestStatus, assignWorkersToBulkRequest } from '../../services/bulkService';
import { getAllReports } from '../../services/reportService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Users as UsersIcon, Briefcase, ShieldCheck, 
  Clock, Calendar, ArrowRight,
  CheckCircle, XCircle, UserPlus, MapPin, Phone, Building, X,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_BADGES = {
  'Pending Review': 'bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] border-[#FFA649]/30',
  'Approved': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'Workers Assigned': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  'In Progress': 'bg-[#FFA649]/25 text-[#1B2731] dark:text-[#FFA649] border-[#FFA649]/40',
  'Completed': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'Rejected': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
};

export default function AdminDashboard() {
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bulkRequests, setBulkRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Bulk Request Management State
  const [selectedBulkReq, setSelectedBulkReq] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [bulkTab, setBulkTab] = useState('all'); // all, pending, active, completed

  const fetchAdminData = useCallback(async () => {
    try {
      const [workerList, bookingList, bulkList, reportList] = await Promise.all([
        getAllWorkerProfiles(),
        getBookingsForUser(null, 'admin'),
        getAllBulkRequests(),
        getAllReports()
      ]);
      setWorkers(workerList || []);
      setBookings(bookingList || []);
      setBulkRequests(bulkList || []);
      setReports(reportList || []);

      const mockUsers = JSON.parse(localStorage.getItem('sb_mock_users') || '{}');
      setUsersCount(Object.keys(mockUsers).length);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleUpdateBulkStatus = async (requestId, newStatus) => {
    setActionLoadingId(requestId);
    try {
      await updateBulkRequestStatus(requestId, newStatus);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenAssignModal = (req) => {
    setSelectedBulkReq(req);
    setSelectedWorkerIds(req.assignedWorkerIds || []);
    setAssignModalOpen(true);
  };

  const handleToggleWorker = (workerId) => {
    setSelectedWorkerIds(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!selectedBulkReq) return;
    setActionLoadingId(selectedBulkReq.requestId || selectedBulkReq.id);
    try {
      await assignWorkersToBulkRequest(
        selectedBulkReq.id || selectedBulkReq.requestId,
        selectedWorkerIds,
        selectedBulkReq.groupLeadId || selectedWorkerIds[0] || null
      );
      setAssignModalOpen(false);
      setSelectedBulkReq(null);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to assign workers.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalWorkers = workers.length;
  const verifiedWorkers = workers.filter(w => w.verified).length;
  const pendingVerifications = workers.filter(w => !w.verified).length;
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => ['Pending', 'Accepted', 'In Progress'].includes(b.status)).length;
  const pendingBulkCount = bulkRequests.filter(r => r.status === 'Pending Review').length;
  const pendingReportsCount = reports.filter(r => ['Pending', 'open', 'Under Review'].includes(r.status)).length;

  const filteredBulkRequests = bulkRequests.filter(r => {
    if (bulkTab === 'pending') return r.status === 'Pending Review';
    if (bulkTab === 'active') return ['Approved', 'Workers Assigned', 'In Progress'].includes(r.status);
    if (bulkTab === 'completed') return ['Completed', 'Rejected'].includes(r.status);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EBE5DE] dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#283845] dark:text-white font-heading leading-tight">
            System Command Center
          </h1>
          <p className="text-xs text-[#4A5B69] dark:text-stone-400 mt-1">
            Real-time platform metrics, tradesmen verification queue, active bookings, corporate bulk requests, and dispute reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/verification"
            className="px-3.5 py-2 rounded-xl bg-[#FFA649]/15 border border-[#FFA649]/30 text-[#283845] dark:text-[#FFA649] text-xs font-bold flex items-center gap-1.5 hover:bg-[#FFA649]/25 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-[#FFA649]" />
            <span>{pendingVerifications} Pending Audits</span>
          </Link>
          <Link
            to="/admin/reports"
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-500/20 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{pendingReportsCount} Disputes</span>
          </Link>
        </div>
      </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-4 rounded-2xl shadow-xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-[#283845]/10 dark:bg-[#283845]/40 border border-[#283845]/20 dark:border-[#FFA649]/30 flex items-center justify-center mb-2">
              <UsersIcon className="w-5 h-5 text-[#283845] dark:text-[#FFA649] stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Total Accounts</span>
            <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">{usersCount}</span>
          </div>

          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-4 rounded-2xl shadow-xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-[#FFA649]/15 border border-[#FFA649]/30 flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5 text-[#FFA649] stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Verified Pros</span>
            <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">
              {verifiedWorkers} <span className="text-xs text-stone-400 font-normal">/ {totalWorkers}</span>
            </span>
          </div>

          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-4 rounded-2xl shadow-xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-[#FFA649]/15 border border-[#FFA649]/30 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-[#FFA649] stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Pending Audits</span>
            <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">{pendingVerifications}</span>
          </div>

          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-4 rounded-2xl shadow-xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-[#283845]/10 dark:bg-[#283845]/40 border border-[#283845]/20 dark:border-[#FFA649]/30 flex items-center justify-center mb-2">
              <Briefcase className="w-5 h-5 text-[#283845] dark:text-[#FFA649] stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Active Bookings</span>
            <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">
              {activeBookings} <span className="text-xs text-stone-400 font-normal">/ {totalBookings}</span>
            </span>
          </div>

          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-4 rounded-2xl col-span-2 lg:col-span-1 shadow-xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-2">
              <Building className="w-5 h-5 text-purple-600 dark:text-purple-400 stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Bulk Requests</span>
            <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">
              {bulkRequests.length} <span className="text-xs text-[#FFA649]">({pendingBulkCount} new)</span>
            </span>
          </div>
        </div>

        {/* Corporate & Bulk Hiring Management Section (Requirement 3 & 9) */}
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE5DE] dark:border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#283845] dark:text-white flex items-center gap-2 font-heading">
                <Building className="w-5 h-5 text-[#FFA649]" />
                Corporate & Bulk Hiring Requests ({bulkRequests.length})
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Review organizational staffing applications, assign multiple workers, and track crew statuses.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-[#11171E] p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setBulkTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  bulkTab === 'all' 
                    ? 'bg-white dark:bg-[#1B2731] text-[#283845] dark:text-white shadow-xs font-bold' 
                    : 'text-stone-500 hover:text-[#283845] dark:hover:text-white'
                }`}
              >
                All ({bulkRequests.length})
              </button>
              <button
                onClick={() => setBulkTab('pending')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  bulkTab === 'pending' 
                    ? 'bg-white dark:bg-[#1B2731] text-[#283845] dark:text-white shadow-xs font-bold' 
                    : 'text-stone-500 hover:text-[#283845] dark:hover:text-white'
                }`}
              >
                Pending ({pendingBulkCount})
              </button>
              <button
                onClick={() => setBulkTab('active')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  bulkTab === 'active' 
                    ? 'bg-white dark:bg-[#1B2731] text-[#283845] dark:text-white shadow-xs font-bold' 
                    : 'text-stone-500 hover:text-[#283845] dark:hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setBulkTab('completed')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  bulkTab === 'completed' 
                    ? 'bg-white dark:bg-[#1B2731] text-[#283845] dark:text-white shadow-xs font-bold' 
                    : 'text-stone-500 hover:text-[#283845] dark:hover:text-white'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {filteredBulkRequests.length === 0 ? (
            <div className="text-center py-8 text-xs text-stone-400 font-medium">
              No bulk hiring requests matching filter.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBulkRequests.map(req => {
                const reqId = req.requestId || req.id;
                const assignedWorkers = workers.filter(w => (req.assignedWorkerIds || []).includes(w.workerId || w.userId));

                return (
                  <div 
                    key={reqId}
                    className="p-4 sm:p-5 bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-2xl hover:border-[#FFA649]/40 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#FFA649]">#{reqId}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          STATUS_BADGES[req.status] || STATUS_BADGES['Pending Review']
                        }`}>
                          {req.status}
                        </span>
                        {req.isDemo && (
                          <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[9px] font-bold">
                            Demo Request
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-stone-500">
                        Requested: <strong className="text-[#283845] dark:text-white">{req.workersRequired || req.numberOfWorkers} workers</strong> for {req.category}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="font-bold text-sm text-[#283845] dark:text-white flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-stone-400" />
                          {req.organizationName || req.businessName}
                        </div>
                        <div className="text-stone-500 dark:text-stone-400 text-[11px] mt-1 flex items-center gap-2 flex-wrap">
                          <span>{req.contactPerson}</span>
                          {req.contactPhone && (
                            <span className="flex items-center gap-1 text-[#FFA649]">
                              <Phone className="w-3 h-3" /> {req.contactPhone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                          <MapPin className="w-3.5 h-3.5 text-[#FFA649] flex-shrink-0" />
                          <span>{req.jobLocation || req.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-stone-500 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span>{req.startDate} to {req.endDate}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[11px] text-stone-500">
                          Assigned Workers: <strong className="text-[#283845] dark:text-white">{(req.assignedWorkerIds || []).length} / {req.workersRequired}</strong>
                        </div>
                        {req.groupDetails && (
                          <div className="p-1.5 rounded-lg bg-[#FFA649]/10 text-[10px] text-[#283845] dark:text-[#FFA649] font-medium">
                            Staffing Lead: <strong>{req.groupDetails.leadWorkerName} ({req.groupDetails.leadWorkerId})</strong> with {req.groupDetails.managedCrewSize} crew members
                          </div>
                        )}
                      </div>
                    </div>

                    {req.additionalRequirements && (
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 italic bg-white dark:bg-[#18222B] p-2 rounded-xl border border-[#EBE5DE] dark:border-white/10">
                        "{req.additionalRequirements}"
                      </p>
                    )}

                    {/* Assigned Workers List */}
                    {assignedWorkers.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Crew:</span>
                        {assignedWorkers.map(w => (
                          <span key={w.workerId || w.userId} className="px-2 py-0.5 rounded-md bg-white dark:bg-[#18222B] border border-[#EBE5DE] dark:border-white/10 text-[11px] font-semibold text-[#283845] dark:text-stone-200">
                            {w.name} ({w.workerId || w.userId})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-[#EBE5DE] dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {req.status === 'Pending Review' && (
                          <>
                            <button
                              onClick={() => handleUpdateBulkStatus(req.id || req.requestId, 'Approved')}
                              disabled={actionLoadingId === reqId}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve Request
                            </button>
                            <button
                              onClick={() => handleUpdateBulkStatus(req.id || req.requestId, 'Rejected')}
                              disabled={actionLoadingId === reqId}
                              className="px-3 py-1.5 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}

                        {['Approved', 'Workers Assigned'].includes(req.status) && (
                          <button
                            onClick={() => handleUpdateBulkStatus(req.id || req.requestId, 'In Progress')}
                            disabled={actionLoadingId === reqId}
                            className="px-3.5 py-1.5 bg-[#FFA649] hover:bg-[#ff952b] text-[#11171E] text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Mark In Progress
                          </button>
                        )}

                        {req.status === 'In Progress' && (
                          <button
                            onClick={() => handleUpdateBulkStatus(req.id || req.requestId, 'Completed')}
                            disabled={actionLoadingId === reqId}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                          </button>
                        )}
                      </div>

                      {/* Assign Workers Button */}
                      {req.status !== 'Rejected' && (
                        <button
                          onClick={() => handleOpenAssignModal(req)}
                          className="px-3 py-1.5 border border-[#FFA649]/40 hover:border-[#FFA649] bg-[#FFA649]/10 text-[#283845] dark:text-[#FFA649] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-[#FFA649]" />
                          {(req.assignedWorkerIds || []).length > 0 ? 'Modify Assigned Workers' : 'Assign Workers'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Audit, Reports & Bookings Previews Grid (3-column full-width responsive layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Audit Queue Summary */}
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[#283845] dark:text-white font-heading">Pending Audits Queue</h3>
                <Link to="/admin/verification" className="text-xs text-[#FFA649] font-bold hover:underline flex items-center gap-1">
                  <span>View All ({pendingVerifications})</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {workers.filter(w => !w.verified).length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 font-medium">
                  No profiles awaiting review.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {workers.filter(w => !w.verified).slice(0, 3).map(worker => (
                    <div key={worker.userId} className="flex justify-between items-center p-3 bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-2xl text-xs">
                      <div>
                        <span className="font-bold text-[#283845] dark:text-white block">{worker.name}</span>
                        <span className="text-[11px] text-stone-500">Exp: {worker.experience} yrs • {worker.categories?.join(', ')}</span>
                      </div>
                      <Link to="/admin/verification" className="px-3 py-1.5 bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] hover:bg-[#FFA649]/25 font-bold text-[11px] rounded-xl">
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Disputes & Reports Summary */}
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[#283845] dark:text-white font-heading">Recent Disputes & Reports</h3>
                <Link to="/admin/reports" className="text-xs text-[#FFA649] font-bold hover:underline flex items-center gap-1">
                  <span>All Reports ({reports.length})</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 font-medium">
                  No dispute reports logged.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {reports.slice(0, 3).map(rep => (
                    <div key={rep.reportId || rep.id} className="flex justify-between items-center p-3 bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-2xl text-xs">
                      <div>
                        <span className="font-bold text-[#283845] dark:text-white block truncate max-w-[170px]">{rep.category}</span>
                        <span className="text-[11px] text-stone-500">From {rep.userName} ({rep.userRole})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                        STATUS_BADGES[rep.status] || STATUS_BADGES.Pending
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bookings Queue Summary */}
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[#283845] dark:text-white font-heading">Recent Platform Transactions</h3>
                <Link to="/admin/bookings" className="text-xs text-[#FFA649] font-bold hover:underline flex items-center gap-1">
                  <span>All Bookings ({bookings.length})</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 font-medium">
                  No transaction records found.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {bookings.slice(0, 3).map(booking => (
                    <div key={booking.bookingId} className="flex justify-between items-center p-3 bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-2xl text-xs">
                      <div>
                        <span className="font-bold text-[#283845] dark:text-white block">{booking.jobType}</span>
                        <span className="text-[11px] text-stone-500">Client: {booking.customerName} • Status: {booking.status}</span>
                      </div>
                      <span className="font-bold text-[#283845] dark:text-white">{booking.estimatedPrice?.split('–')[0]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Multi-Worker Assignment Modal */}
      {assignModalOpen && selectedBulkReq && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
          <div 
            className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EBE5DE] dark:border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#283845] dark:text-white font-heading flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#FFA649]" />
                  Assign Personnel to Request #{selectedBulkReq.requestId || selectedBulkReq.id}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Category: <strong>{selectedBulkReq.category}</strong> • Required: <strong>{selectedBulkReq.workersRequired}</strong> workers • Selected: <strong>{selectedWorkerIds.length}</strong>
                </p>
              </div>
              <button 
                onClick={() => setAssignModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-grow space-y-2 pr-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Select from Verified Database Specialists:
              </span>
              {workers.map(w => {
                const isSelected = selectedWorkerIds.includes(w.workerId || w.userId);
                const isCategoryMatch = (w.category || '').toLowerCase().includes((selectedBulkReq.category || '').toLowerCase()) ||
                  (w.categories || []).some(c => c.toLowerCase().includes((selectedBulkReq.category || '').toLowerCase()));

                return (
                  <div 
                    key={w.workerId || w.userId}
                    onClick={() => handleToggleWorker(w.workerId || w.userId)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'border-[#FFA649] bg-[#FFA649]/10' 
                        : 'border-[#EBE5DE] dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#283845] dark:text-white">{w.name}</span>
                        <span className="font-mono text-[10px] text-stone-400">({w.workerId || w.userId})</span>
                        {isCategoryMatch && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                            Category Match
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {w.category} • {w.location} • Rating: {w.rating} ({w.reviewCount} reviews)
                      </div>
                    </div>

                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#FFA649] rounded border-stone-300 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#EBE5DE] dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500">
                {selectedWorkerIds.length} worker(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EBE5DE] dark:border-white/10 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignments}
                  disabled={actionLoadingId !== null}
                  className="px-5 py-2 btn-gradient text-[#11171E] font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {actionLoadingId ? 'Saving...' : 'Confirm Worker Assignments'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
