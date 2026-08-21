import { useEffect, useState } from 'react';
import { getAllWorkerProfiles } from '../../services/workerService';
import { getBookingsForUser } from '../../services/bookingService';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Users as UsersIcon, Briefcase, ShieldCheck, 
  Clock, FileBarChart2, 
  ShieldAlert, Calendar, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  
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

  const totalWorkers = workers.length;
  const verifiedWorkers = workers.filter(w => w.verified).length;
  const pendingVerifications = workers.filter(w => !w.verified).length;
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => ['Pending', 'Accepted', 'In Progress'].includes(b.status)).length;

  const sidebarLinks = [
    { label: 'Overview', path: '/admin', icon: FileBarChart2, end: true },
    { label: 'Worker Queue', path: '/admin/verification', icon: Clock, badge: pendingVerifications },
    { label: 'All Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'User Directory', path: '/admin/users', icon: UsersIcon },
    { label: 'Bulk Hiring', path: '/customer/bulk-hire', icon: Briefcase },
    { label: 'Reports', path: '/admin/reports', icon: ShieldAlert }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-4 animate-fade-in text-left">
      {/* Sidebar Layout */}
      <Sidebar links={sidebarLinks} title="Administration" />

      {/* Main Panel Content */}
      <div className="flex-grow space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white font-heading leading-tight">
            System Command Center
          </h1>
          <p className="text-xs text-[#4A5B69] dark:text-stone-400 mt-1">
            Real-time platform metrics, tradesmen audit queue, and active assignments.
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-5 rounded-2xl shadow-xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-[#283845]/10 dark:bg-[#283845]/40 border border-[#283845]/20 dark:border-[#FFA649]/30 flex items-center justify-center mb-2">
              <UsersIcon className="w-5 h-5 text-[#283845] dark:text-[#FFA649] stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Total Accounts</span>
            <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">{usersCount}</span>
          </div>

          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-5 rounded-2xl shadow-xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-[#FFA649]/15 border border-[#FFA649]/30 flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5 text-[#FFA649] stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Verified Pros</span>
            <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">{verifiedWorkers} <span className="text-xs text-stone-400 font-normal">/ {totalWorkers}</span></span>
          </div>

          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-5 rounded-2xl shadow-xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-[#FFA649]/15 border border-[#FFA649]/30 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-[#FFA649] stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Pending Audits</span>
            <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">{pendingVerifications}</span>
          </div>

          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-5 rounded-2xl shadow-xs text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-[#283845]/10 dark:bg-[#283845]/40 border border-[#283845]/20 dark:border-[#FFA649]/30 flex items-center justify-center mb-2">
              <Briefcase className="w-5 h-5 text-[#283845] dark:text-[#FFA649] stroke-[2.2px]" />
            </div>
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Active Bookings</span>
            <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading mt-0.5 block">{activeBookings} <span className="text-xs text-stone-400 font-normal">/ {totalBookings}</span></span>
          </div>
        </div>

        {/* Activity Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audit Queue Summary */}
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#283845] dark:text-white font-heading">Pending Audits Queue</h3>
              <Link to="/admin/verification" className="text-xs text-[#FFA649] font-bold hover:underline flex items-center gap-1">
                <span>View Queue</span>
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

          {/* Bookings Queue Summary */}
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#283845] dark:text-white font-heading">Recent Platform Transactions</h3>
              <Link to="/admin/bookings" className="text-xs text-[#FFA649] font-bold hover:underline flex items-center gap-1">
                <span>All Bookings</span>
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
    </div>
  );
}
