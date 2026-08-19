import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Users as UsersIcon, FileBarChart2, Clock, 
  Calendar, ShieldAlert, Briefcase, CheckCircle, ShieldCheck 
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
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Disputes & Reports Management</h1>
          <p className="text-xs text-gray-500 mt-1">Audit customer complaints, service disputes, and coordinate resolutions.</p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : reports.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 shadow-3xs">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-gray-800">No Open Disputes</h3>
            <p className="text-xs text-gray-400 mt-1">Platform operations are running smoothly with zero unresolved reports!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(rep => (
              <div 
                key={rep.reportId}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-3xs flex flex-col lg:flex-row justify-between lg:items-center gap-4 text-xs text-left"
              >
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">ID: #{rep.reportId.toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold capitalize ${
                      rep.status === 'open' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {rep.status}
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-md">
                      Reason: {rep.reason}
                    </span>
                  </div>

                  <p className="font-semibold text-gray-800 text-sm">
                    Reported worker: <span className="font-bold text-primary">{rep.reportedUserName}</span> by client <span className="font-bold">{rep.reporterName}</span>
                  </p>

                  <p className="text-gray-650 bg-gray-50 border p-3 rounded-xl italic">
                    "{rep.description}"
                  </p>

                  <span className="block text-[10px] text-gray-400 font-medium">
                    Report placed on: {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {rep.status === 'open' && (
                  <button
                    onClick={() => handleResolve(rep.reportId)}
                    className="flex-shrink-0 py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl"
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
