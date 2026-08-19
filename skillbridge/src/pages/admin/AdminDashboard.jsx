import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllWorkerProfiles } from '../../services/workerService';
import { getBookingsForUser } from '../../services/bookingService';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Users as UsersIcon, Briefcase, ShieldCheck, 
  Clock, CheckCircle, HelpCircle, FileBarChart2, 
  ShieldAlert, Settings, Calendar 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const workerList = await getAllWorkerProfiles();
        setWorkers(workerList);

        const bookingList = await getBookingsForUser(null, 'admin');
        setBookings(bookingList);

        // Fetch users from localStorage for simulation
        const mockUsers = JSON.parse(localStorage.getItem('sb_mock_users') || '{}');
        setUsersCount(Object.keys(mockUsers).length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate statistics
  const totalWorkers = workers.length;
  const verifiedWorkers = workers.filter(w => w.verified).length;
  const pendingVerifications = workers.filter(w => !w.verified).length;
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => ['Pending', 'Accepted', 'In Progress'].includes(b.status)).length;
  const completedJobs = bookings.filter(b => b.status === 'Completed').length;

  // Sidebar links
  const sidebarLinks = [
    { label: 'Overview', path: '/admin', icon: FileBarChart2, end: true },
    { label: 'Worker Queue', path: '/admin/verification', icon: Clock, badge: pendingVerifications },
    { label: 'All Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'User Directory', path: '/admin/users', icon: UsersIcon },
    { label: 'Bulk Hiring', path: '/customer/bulk-hire', icon: Briefcase }, // Redirects/uses BulkHire
    { label: 'Reports', path: '/admin/reports', icon: ShieldAlert }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-4 animate-fade-in text-left">
      {/* Sidebar Layout */}
      <Sidebar links={sidebarLinks} title="Admin Panel" />

      {/* Main Panel Content */}
      <div className="flex-grow space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Admin System Command Center</h1>
          <p className="text-xs text-gray-500 mt-1">Monitor platform activity, approve worker credentials, and coordinate job bookings.</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-3xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-100/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center mb-2">
              <UsersIcon className="w-5 h-5 text-[#1E3A8A] dark:text-[#93C5FD] stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase">Total Accounts</span>
            <span className="text-xl font-bold text-gray-900 mt-0.5 block">{usersCount}</span>
          </div>

          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-3xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5 text-[#064E3B] dark:text-[#6EE7B7] stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase">Verified Workers</span>
            <span className="text-xl font-bold text-gray-900 mt-0.5 block">{verifiedWorkers} <span className="text-xs text-gray-400">/ {totalWorkers}</span></span>
          </div>

          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-3xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-amber-100/90 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-[#78350F] dark:text-[#FCD34D] stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase">Pending Audits</span>
            <span className="text-xl font-bold text-gray-900 mt-0.5 block">{pendingVerifications}</span>
          </div>

          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-3xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-100/90 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center mb-2">
              <Briefcase className="w-5 h-5 text-[#312E81] dark:text-[#A5B4FC] stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase">Active Bookings</span>
            <span className="text-xl font-bold text-gray-900 mt-0.5 block">{activeBookings} <span className="text-xs text-gray-400">/ {totalBookings}</span></span>
          </div>
        </div>

        {/* Activity Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audit Queue Summary */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800">Pending Audits Queue</h3>
              <Link to="/admin/verification" className="text-xs text-primary font-semibold hover:underline">Auditing Queue →</Link>
            </div>

            {workers.filter(w => !w.verified).length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 font-medium">
                No profiles awaiting review.
              </div>
            ) : (
              <div className="space-y-3">
                {workers.filter(w => !w.verified).slice(0, 3).map(worker => (
                  <div key={worker.userId} className="flex justify-between items-center p-3 bg-gray-50/50 border border-gray-100 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">{worker.name}</span>
                      <span className="text-[10px] text-gray-400">Experience: {worker.experience} Years • Category: {worker.categories?.join(', ')}</span>
                    </div>
                    <Link to="/admin/verification" className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary font-bold text-[10px] rounded-lg">Review Profile</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookings Queue Summary */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800">Recent Platform Transactions</h3>
              <Link to="/admin/bookings" className="text-xs text-primary font-semibold hover:underline">All Bookings →</Link>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 font-medium">
                No transaction records found.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 3).map(booking => (
                  <div key={booking.bookingId} className="flex justify-between items-center p-3 bg-gray-50/50 border border-gray-100 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">{booking.jobType}</span>
                      <span className="text-[10px] text-gray-400">Client: {booking.customerName} • Status: {booking.status}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{booking.estimatedPrice?.split('–')[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
