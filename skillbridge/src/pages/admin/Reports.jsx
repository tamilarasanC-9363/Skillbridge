import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Users as UsersIcon, FileBarChart2, Clock, 
  Calendar, ShieldAlert, Briefcase, CheckCircle 
} from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated pre-seeded reports
    const loadReports = () => {
      const mockReports = [
        {
          reportId: 'rep_1',
          reportedBy: 'customer_uid',
          reporterName: 'Kumar Dev',
          reportedUser: 'worker1',
          reportedUserName: 'Ramesh Kumar',
          bookingId: 'booking_completed_1',
          reason: 'Price dispute',
          description: 'Worker requested ₹100 extra above the estimated maximum limit for additional plumbing washers.',
          status: 'resolved',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          reportId: 'rep_2',
          reportedBy: 'customer_uid',
          reporterName: 'Kumar Dev',
          reportedUser: 'worker3',
          reportedUserName: 'Arun Prasath',
          bookingId: 'booking_pending_1',
          reason: 'No response',
          description: 'Worker did not answer the phone when trying to coordinate the pipe leakage repair booking.',
          status: 'open',
          createdAt: new Date().toISOString()
        }
      ];
      setReports(mockReports);
      setLoading(false);
    };
    loadReports();
  }, []);

  const handleResolve = (id) => {
    setReports(prev => prev.map(r => r.reportId === id ? { ...r, status: 'resolved' } : r));
  };

  const pendingReports = reports.filter(r => r.status === 'open');

  const sidebarLinks = [
    { label: 'Overview', path: '/admin', icon: FileBarChart2, end: true },
    { label: 'Worker Queue', path: '/admin/verification', icon: Clock },
    { label: 'All Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'User Directory', path: '/admin/users', icon: UsersIcon },
    { label: 'Bulk Hiring', path: '/customer/bulk-hire', icon: Briefcase },
    { label: 'Reports', path: '/admin/reports', icon: ShieldAlert, badge: pendingReports.length }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-4 animate-fade-in text-left">
      <Sidebar links={sidebarLinks} title="Admin Panel" />

      <div className="flex-grow space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white leading-tight font-heading">Disputes & Reports Management</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Audit customer complaints, service disputes, and coordinate resolutions.</p>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-12 text-center text-stone-500 shadow-xs">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-[#283845] dark:text-white font-heading">No Open Disputes</h3>
            <p className="text-xs text-stone-400 mt-1">Platform operations are running smoothly with zero unresolved reports!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(rep => (
              <div 
                key={rep.reportId}
                className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4 text-xs text-left"
              >
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-stone-400">ID: #{rep.reportId.toUpperCase()}</span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold capitalize ${
                      rep.status === 'open' ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {rep.status}
                    </span>
                    <span className="text-[10px] bg-stone-100 dark:bg-[#11171E] text-stone-700 dark:text-stone-300 font-bold px-2 py-0.5 rounded-md border border-[#EBE5DE] dark:border-white/10">
                      Reason: {rep.reason}
                    </span>
                  </div>

                  <p className="font-semibold text-[#283845] dark:text-white text-sm">
                    Reported worker: <span className="font-bold text-[#FFA649]">{rep.reportedUserName}</span> by client <span className="font-bold text-[#283845] dark:text-white">{rep.reporterName}</span>
                  </p>

                  <p className="text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 p-3 rounded-xl italic">
                    "{rep.description}"
                  </p>

                  <span className="block text-[10px] text-stone-400 font-medium">
                    Report placed on: {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {rep.status === 'open' && (
                  <button
                    onClick={() => handleResolve(rep.reportId)}
                    className="flex-shrink-0 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                  >
                    Resolve Dispute
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
