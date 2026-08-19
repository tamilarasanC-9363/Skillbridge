import React, { useEffect, useState } from 'react';
import { getAllWorkerProfiles, setWorkerVerificationStatus } from '../../services/workerService';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Clock, CheckCircle, FileBarChart2, Users as UsersIcon, 
  Calendar, ShieldAlert, Award, FileText, Check, X, Eye,
  Briefcase, MapPin, AlertCircle, ShieldCheck, ExternalLink,
  ChevronRight, Sparkles, Filter
} from 'lucide-react';

export default function VerificationQueue() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'all', 'verified'
  const [actioningUserId, setActioningUserId] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null); // For verification modal
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null); // { type: 'ID Proof' | 'Certificate', url: string }

  const loadWorkers = async () => {
    try {
      const list = await getAllWorkerProfiles();
      setWorkers(list || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const handleApprove = async (userId) => {
    setActioningUserId(userId);
    setSuccessMsg('');
    try {
      await setWorkerVerificationStatus(userId, true);
      setWorkers(prev => 
        prev.map(w => w.userId === userId ? { ...w, verified: true, rejectionReason: undefined } : w)
      );
      if (selectedWorker?.userId === userId) {
        setSelectedWorker(prev => ({ ...prev, verified: true, rejectionReason: undefined }));
      }
      setSuccessMsg('Worker approved & verified badge unlocked successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setActioningUserId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedWorker) return;
    const userId = selectedWorker.userId;
    setActioningUserId(userId);
    setSuccessMsg('');
    try {
      await setWorkerVerificationStatus(userId, false, rejectionReason || 'Documents did not meet compliance standards.');
      setWorkers(prev => 
        prev.map(w => w.userId === userId ? { ...w, verified: false, rejectionReason: rejectionReason || 'Documents did not meet compliance standards.' } : w)
      );
      if (selectedWorker?.userId === userId) {
        setSelectedWorker(prev => ({ ...prev, verified: false, rejectionReason: rejectionReason || 'Documents did not meet compliance standards.' }));
      }
      setShowRejectModal(false);
      setRejectionReason('');
      setSuccessMsg('Worker verification rejected with reason.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setActioningUserId(null);
    }
  };

  const pendingWorkers = workers.filter(w => !w.verified);
  const verifiedWorkers = workers.filter(w => w.verified);

  const displayedWorkers = activeTab === 'pending'
    ? pendingWorkers
    : activeTab === 'verified'
    ? verifiedWorkers
    : workers;

  const sidebarLinks = [
    { label: 'Overview', path: '/admin', icon: FileBarChart2, end: true },
    { label: 'Worker Queue', path: '/admin/verification', icon: Clock, badge: pendingWorkers.length },
    { label: 'All Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'User Directory', path: '/admin/users', icon: UsersIcon },
    { label: 'Bulk Hiring', path: '/customer/bulk-hire', icon: Briefcase },
    { label: 'Reports', path: '/admin/reports', icon: ShieldAlert }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-4 animate-fade-in text-left">
      <Sidebar links={sidebarLinks} title="Admin Panel" />

      <div className="flex-grow space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white leading-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Worker Auditing & Verification Queue
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Audit submitted Govt ID proofs, trade skill certificates, and verify skilled worker profiles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {pendingWorkers.length} Pending
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {verifiedWorkers.length} Verified
            </span>
          </div>
        </div>

        {/* Confirmation feedback alert */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl p-4 text-xs font-bold animate-fade-in flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button 
              onClick={() => setSuccessMsg('')} 
              className="text-emerald-400 hover:text-white text-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Navigation Tabs */}
        <div className="flex border-b border-white/10 gap-3 sm:gap-6 overflow-x-auto pb-1 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pending'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Pending Registrations ({pendingWorkers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verified')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'verified'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Verified Workers ({verifiedWorkers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            All Workers ({workers.length})
          </button>
        </div>

        {/* Loading / List Content */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : displayedWorkers.length === 0 ? (
          <div className="bg-card-bg border border-border-custom rounded-3xl p-12 text-center text-text-muted shadow-sm space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
            <h3 className="text-base font-bold text-white">No registrations in this view</h3>
            <p className="text-xs max-w-sm mx-auto">
              {activeTab === 'pending'
                ? 'All skilled worker registration applications have been audited and approved.'
                : 'Worker profiles will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedWorkers.map(worker => {
              const submittedDate = worker.createdAt 
                ? new Date(worker.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recently';

              return (
                <div 
                  key={worker.userId}
                  className="bg-card-bg border border-border-custom rounded-3xl p-6 shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Worker Details Column */}
                  <div className="flex items-start gap-4 flex-grow">
                    <img 
                      src={worker.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name || 'W')}&background=2563EB&color=fff`} 
                      alt={worker.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/10 flex-shrink-0"
                    />

                    <div className="space-y-2 flex-grow">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white">{worker.name}</h3>
                        <span className="text-[10px] text-text-muted font-bold">ID: #{worker.userId}</span>

                        {worker.verified ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending Audit
                          </span>
                        )}
                      </div>

                      {/* Categories, Skills, Experience, Location */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
                        <span className="inline-flex items-center gap-1 text-white font-semibold">
                          <Briefcase className="w-3.5 h-3.5 text-primary" />
                          {worker.categories?.join(', ') || 'General Services'}
                        </span>
                        <span>•</span>
                        <span className="text-text-sub font-medium">
                          {worker.experience || 0} Years Experience
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-text-sub">
                          <MapPin className="w-3.5 h-3.5" />
                          {worker.location || 'Chennai'}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-text-muted">
                          <Calendar className="w-3.5 h-3.5" />
                          Submitted {submittedDate}
                        </span>
                      </div>

                      {/* Skills badge list */}
                      {worker.skills && worker.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {worker.skills.map((skill, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-white/5 text-[10px] font-semibold text-text-sub">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column: View / Approve / Reject */}
                  <div className="flex-shrink-0 flex items-center sm:justify-end gap-2 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
                    <button
                      type="button"
                      onClick={() => setSelectedWorker(worker)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-text-sub hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-primary" />
                      View Proofs
                    </button>

                    {!worker.verified ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(worker.userId)}
                          disabled={actioningUserId === worker.userId}
                          className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWorker(worker);
                            setShowRejectModal(true);
                          }}
                          className="flex-1 sm:flex-initial px-4 py-2.5 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWorker(worker);
                          setShowRejectModal(true);
                        }}
                        className="px-3 py-2 text-text-muted hover:text-rose-400 text-xs font-medium cursor-pointer"
                        title="Revoke Verification"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Verification Details Modal */}
      {selectedWorker && !showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
          <div 
            className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedWorker(null)}
              className="absolute top-5 right-5 text-text-muted hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top header */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-5">
              <img 
                src={selectedWorker.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedWorker.name || 'W')}&background=2563EB&color=fff`} 
                alt={selectedWorker.name}
                className="w-16 h-16 rounded-2xl object-cover border border-white/10"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{selectedWorker.name}</h2>
                  {selectedWorker.verified ? (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      Pending Audit
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Worker ID: <span className="text-white font-mono">{selectedWorker.userId}</span> • {selectedWorker.categories?.join(', ')} • {selectedWorker.experience || 0} Yrs Experience
                </p>
              </div>
            </div>

            {/* Bio / Profile summary */}
            {selectedWorker.bio && (
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-xs text-text-sub leading-relaxed">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Professional Bio</span>
                "{selectedWorker.bio}"
              </div>
            )}

            {/* Uploaded Documents / Proofs Preview Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Submitted Compliance Documents
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Govt ID Proof Card */}
                <div className="bg-card-bg border border-border-custom rounded-2xl p-4 space-y-3 hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      Government ID Proof
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Uploaded
                    </span>
                  </div>

                  <div className="h-32 rounded-xl overflow-hidden bg-slate-900 border border-white/10 relative group">
                    <img 
                      src={selectedWorker.idProofUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'} 
                      alt="ID Proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a 
                        href={selectedWorker.idProofUrl || '#'} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-md"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Full Size
                      </a>
                    </div>
                  </div>
                </div>

                {/* Trade Certificate Card */}
                <div className="bg-card-bg border border-border-custom rounded-2xl p-4 space-y-3 hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-primary" />
                      Skill Trade Certificate
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Verified Trade
                    </span>
                  </div>

                  <div className="h-32 rounded-xl overflow-hidden bg-slate-900 border border-white/10 relative group">
                    <img 
                      src={selectedWorker.certificateUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'} 
                      alt="Certificate"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a 
                        href={selectedWorker.certificateUrl || '#'} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-md"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Full Size
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-text-sub hover:text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>

              {!selectedWorker.verified ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className="px-5 py-2.5 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Reject Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedWorker.userId)}
                    disabled={actioningUserId === selectedWorker.userId}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Approve & Verify Badge
                  </button>
                </>
              ) : (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                  ✓ Profile is Verified
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Confirmation Modal */}
      {showRejectModal && selectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
          <div 
            className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Reject Worker Verification?</h3>
              <p className="text-xs text-text-muted">
                Specify a reason to guide the worker on re-submitting valid identification.
              </p>
            </div>

            <textarea
              rows="3"
              placeholder="e.g. Govt ID image was blurry or unreadable. Please upload a clear photo."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 resize-none"
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="w-full py-2.5 rounded-xl border border-white/10 text-text-sub hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={actioningUserId === selectedWorker.userId}
                className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 cursor-pointer"
              >
                {actioningUserId === selectedWorker.userId ? 'Submitting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
