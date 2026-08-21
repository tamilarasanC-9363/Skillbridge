import { useEffect, useState } from 'react';
import { getBookingsForUser } from '../../services/bookingService';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Calendar, FileBarChart2, Clock, Users as UsersIcon, 
  ShieldAlert, ClipboardList, Briefcase 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_THEMES = {
  'Pending': 'bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] border-[#FFA649]/30 font-bold',
  'Accepted': 'bg-[#283845]/10 dark:bg-[#283845]/40 text-[#283845] dark:text-[#FFA649] border-[#283845]/30 font-bold',
  'In Progress': 'bg-[#FFA649]/25 text-[#1B2731] dark:text-[#FFA649] border-[#FFA649]/40 font-bold',
  'Completed': 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 font-bold',
  'Rejected': 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80 font-bold',
  'Cancelled': 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-700 font-bold'
};

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const list = await getBookingsForUser(null, 'admin');
        setBookings(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const sidebarLinks = [
    { label: 'Overview', path: '/admin', icon: FileBarChart2, end: true },
    { label: 'Worker Queue', path: '/admin/verification', icon: Clock },
    { label: 'All Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'User Directory', path: '/admin/users', icon: UsersIcon },
    { label: 'Bulk Hiring', path: '/customer/bulk-hire', icon: Briefcase },
    { label: 'Reports', path: '/admin/reports', icon: ShieldAlert }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-4 animate-fade-in text-left">
      <Sidebar links={sidebarLinks} title="Admin Panel" />

      <div className="flex-grow space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white leading-tight font-heading">All Platform Bookings</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Audit transactions, schedules, and completion statuses across all clients.</p>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-12 text-center text-stone-500 shadow-xs">
            <ClipboardList className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#283845] dark:text-white font-heading">No Booking Records</h3>
            <p className="text-xs text-stone-400 mt-1">There are currently no transaction bookings placed on the platform.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EBE5DE] dark:border-white/10 text-stone-400 uppercase font-bold tracking-wider">
                    <th className="py-3 px-2">Booking ID</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Worker</th>
                    <th className="py-3 px-2">Job Type</th>
                    <th className="py-3 px-2">Scheduled Date</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-2 text-right">Estimate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE5DE] dark:divide-white/10 text-stone-700 dark:text-stone-300">
                  {bookings.map(b => (
                    <tr key={b.bookingId} className="hover:bg-stone-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2 font-bold">
                        <Link to={`/customer/booking/${b.bookingId}`} className="text-[#283845] dark:text-[#FFA649] hover:underline">
                          #{b.bookingId.substr(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-4 px-2 font-semibold text-[#283845] dark:text-white">{b.customerName || 'Client'}</td>
                      <td className="py-4 px-2 font-semibold text-[#283845] dark:text-white">{b.workerName || 'Worker'}</td>
                      <td className="py-4 px-2 font-medium">{b.jobType}</td>
                      <td className="py-4 px-2">
                        {new Date(b.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${STATUS_THEMES[b.status] || STATUS_THEMES.Pending}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 font-bold text-[#283845] dark:text-[#FFA649] text-right">
                        {b.estimatedPrice?.split('–')[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
