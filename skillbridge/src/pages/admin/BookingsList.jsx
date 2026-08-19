import React, { useEffect, useState } from 'react';
import { getBookingsForUser } from '../../services/bookingService';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Calendar, FileBarChart2, Clock, Users as UsersIcon, 
  ShieldAlert, ClipboardList, Briefcase 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_THEMES = {
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200/50',
  'Accepted': 'bg-blue-50 text-blue-700 border-blue-200/50',
  'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  'Rejected': 'bg-rose-50 text-rose-700 border-rose-200/50',
  'Cancelled': 'bg-gray-100 text-gray-600 border-gray-200'
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
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">All Platform Bookings</h1>
          <p className="text-xs text-gray-500 mt-1">Audit transactions, schedules, and completion statuses across all clients.</p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 shadow-3xs">
            <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No Booking Records</h3>
            <p className="text-xs text-gray-400 mt-1">There are currently no transaction bookings placed on the platform.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold tracking-wider">
                    <th className="py-3 px-2">Booking ID</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Worker</th>
                    <th className="py-3 px-2">Job Type</th>
                    <th className="py-3 px-2">Scheduled Date</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-2 text-right">Estimate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {bookings.map(b => (
                    <tr key={b.bookingId} className="hover:bg-gray-50/50">
                      <td className="py-4 px-2 font-bold text-gray-900">
                        <Link to={`/customer/booking/${b.bookingId}`} className="text-primary hover:underline">
                          #{b.bookingId.substr(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-4 px-2 font-semibold">{b.customerName || 'Client'}</td>
                      <td className="py-4 px-2 font-semibold">{b.workerName || 'Worker'}</td>
                      <td className="py-4 px-2">{b.jobType}</td>
                      <td className="py-4 px-2">
                        {new Date(b.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${STATUS_THEMES[b.status] || STATUS_THEMES.Pending}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 font-bold text-gray-900 text-right">{b.estimatedPrice?.split('–')[0]}</td>
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
