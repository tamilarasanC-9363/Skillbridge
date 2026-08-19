import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForUser } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import BackButton from '../../components/BackButton';
import { IndianRupee, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Earnings() {
  const { currentUser } = useAuth();
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const list = await getBookingsForUser(currentUser.uid, 'worker');
        const completed = list.filter(b => b.status === 'Completed');
        setCompletedJobs(completed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [currentUser]);

  // Aggregate numbers
  const totalEarnings = completedJobs.reduce((sum, b) => {
    const match = b.estimatedPrice?.replace(/[^0-9–]/g, '').split('–');
    const val = match ? Number(match[0]) : 300;
    return sum + val;
  }, 0);

  const averageEarning = completedJobs.length > 0 
    ? Math.round(totalEarnings / completedJobs.length) 
    : 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to="/worker" label="Back to Dashboard" className="mb-6" />

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Earnings Summary</h1>
        <p className="text-xs text-gray-500 mt-1">Track payouts, average job sizes, and completed contracts history.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Total Income */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-100/90 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/60 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-[#1E3A8A] dark:text-[#93C5FD] stroke-[2.5px]" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase">Total Income</span>
            <span className="text-xl font-bold text-gray-900">₹{totalEarnings}</span>
          </div>
        </div>

        {/* Average / Job */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#064E3B] dark:text-[#6EE7B7] stroke-[2.5px]" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase">Average / Job</span>
            <span className="text-xl font-bold text-gray-900">₹{averageEarning}</span>
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-100/90 dark:bg-amber-950/80 border border-amber-200/80 dark:border-amber-800/60 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#78350F] dark:text-[#FCD34D] stroke-[2.5px]" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase">Completed Jobs</span>
            <span className="text-xl font-bold text-gray-900">{completedJobs.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-4">Payouts Ledger</h3>
        {completedJobs.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400 font-medium">
            No payments found. Complete assignments to generate earnings data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold tracking-wider">
                  <th className="py-3 px-2">Job Type</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2 text-right">Earning Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {completedJobs.map(job => (
                  <tr key={job.bookingId} className="hover:bg-gray-50/50">
                    <td className="py-4 px-2 font-bold text-gray-900">{job.jobType}</td>
                    <td className="py-4 px-2">
                      {new Date(job.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-2 font-semibold">{job.customerName}</td>
                    <td className="py-4 px-2 font-bold text-gray-900 text-right">
                      ₹{job.estimatedPrice?.replace(/[^0-9–]/g, '').split('–')[0] || 300}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
