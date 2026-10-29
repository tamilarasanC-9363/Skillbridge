import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getWorkerProfile, getWorkerEarningsData } from '../../services/workerService';
import { getBookingsForUser } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import BackButton from '../../components/BackButton';
import { IndianRupee, TrendingUp, Calendar, ChevronLeft, ChevronRight, Percent } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function Earnings() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!currentUser?.uid) return;
      try {
        const [prof, list] = await Promise.all([
          getWorkerProfile(currentUser.uid),
          getBookingsForUser(currentUser.uid, 'worker')
        ]);
        setProfile(prof);
        setBookings(list || []);
      } catch (err) {
        console.error('Error loading earnings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [currentUser]);

  const earningsData = getWorkerEarningsData(profile, bookings);
  const { 
    totalCompletedJobs, 
    grossEarnings = 0, 
    deductions = 0, 
    netEarnings = 0, 
    averageEarnings, 
    allCompletedJobs 
  } = earningsData;

  const totalPages = Math.ceil(allCompletedJobs.length / ITEMS_PER_PAGE) || 1;
  const paginatedJobs = allCompletedJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to="/worker" label="Back to Dashboard" className="mb-6" />

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white font-heading">Earnings Summary</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Detailed breakdown of gross billed contracts, platform fee deductions (10%), and net take-home payouts.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Gross Earnings */}
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Gross Billed</span>
            <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg">
              <IndianRupee className="w-4 h-4 text-stone-500 dark:text-stone-300" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-[#283845] dark:text-white font-heading block">
              ₹{grossEarnings.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-stone-400">Total job value</span>
          </div>
        </div>

        {/* Platform Deductions */}
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Platform Fee (10%)</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
              <Percent className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400 font-heading block">
              -₹{deductions.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-stone-400">Insurance & service</span>
          </div>
        </div>

        {/* Net Take-Home */}
        <div className="bg-white dark:bg-[#1B2731] border border-[#FFA649]/40 dark:border-[#FFA649]/40 p-5 rounded-2xl shadow-xs flex flex-col justify-between bg-gradient-to-br from-[#FFA649]/5 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <span className="block text-[10px] font-extrabold text-[#FFA649] uppercase tracking-wider">Net Payout</span>
            <div className="p-2 bg-[#FFA649]/20 rounded-lg">
              <IndianRupee className="w-4 h-4 text-[#FFA649]" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold text-[#283845] dark:text-white font-heading block">
              ₹{netEarnings.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Net take-home</span>
          </div>
        </div>

        {/* Average / Job */}
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Average / Job</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-[#283845] dark:text-white font-heading block">
              ₹{averageEarnings.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-stone-400">Net per contract</span>
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-5 rounded-2xl col-span-2 lg:col-span-1 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="block text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Completed Jobs</span>
            <div className="p-2 bg-[#283845]/10 dark:bg-[#283845]/40 rounded-lg">
              <Calendar className="w-4 h-4 text-[#283845] dark:text-[#FFA649]" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-[#283845] dark:text-white font-heading block">
              {totalCompletedJobs}
            </span>
            <span className="text-[10px] text-stone-400">Verified contracts</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="text-base font-bold text-[#283845] dark:text-white font-heading">Payouts Ledger</h3>
          {allCompletedJobs.length > 0 && (
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, allCompletedJobs.length)} of {allCompletedJobs.length} payouts
            </span>
          )}
        </div>

        {allCompletedJobs.length === 0 ? (
          <div className="text-center py-8 text-xs text-stone-400 font-medium">
            No payments found. Complete assignments to generate earnings data.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EBE5DE] dark:border-white/10 text-stone-400 dark:text-stone-400 uppercase font-bold tracking-wider">
                    <th className="py-3 px-2">Job Type & Ref</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2 text-right">Gross Amount</th>
                    <th className="py-3 px-2 text-right">Platform Fee (10%)</th>
                    <th className="py-3 px-2 text-right">Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE5DE] dark:divide-white/10 text-stone-700 dark:text-stone-300">
                  {paginatedJobs.map(job => (
                    <tr key={job.bookingId} className="hover:bg-stone-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2">
                        <div className="font-bold text-[#283845] dark:text-white flex items-center gap-1.5">
                          {job.jobType}
                          {job.isLive ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold uppercase">
                              Live
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 font-bold uppercase">
                              Demo
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">#{job.bookingId?.slice(-8)}</span>
                      </td>
                      <td className="py-4 px-2">
                        {new Date(job.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-2 font-semibold text-[#283845] dark:text-white">{job.customerName}</td>
                      <td className="py-4 px-2 text-right font-mono text-stone-600 dark:text-stone-300">
                        ₹{job.grossAmount?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="py-4 px-2 text-right font-mono text-rose-500">
                        -₹{job.deduction?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="py-4 px-2 font-bold text-emerald-600 dark:text-emerald-400 text-right font-mono">
                        ₹{job.netEarnings?.toLocaleString('en-IN') || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#EBE5DE] dark:border-white/10 pt-4 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-[#FFA649] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && <span className="px-1 text-xs text-stone-400">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                              currentPage === page
                                ? 'bg-[#FFA649] text-[#11171E]'
                                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-[#FFA649] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
