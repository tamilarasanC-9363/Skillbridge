import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getWorkerProfile, getWorkerEarningsData } from '../../services/workerService';
import { getBookingsForUser } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import BackButton from '../../components/BackButton';
import { IndianRupee, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const { totalCompletedJobs, totalIncome, averageEarnings, allCompletedJobs } = earningsData;

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
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to="/worker" label="Back to Dashboard" className="mb-6" />

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white font-heading">Earnings Summary</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Track payouts, average job sizes, and completed contracts history.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Total Income */}
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-6 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-[#FFA649]/15 dark:bg-[#FFA649]/20 border border-[#FFA649]/30 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-[#FFA649] stroke-[2.5px]" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider">Total Income</span>
            <span className="text-xl font-bold text-[#283845] dark:text-white font-heading">
              ₹{totalIncome.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Average / Job */}
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-6 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400 stroke-[2.5px]" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider">Average / Job</span>
            <span className="text-xl font-bold text-[#283845] dark:text-white font-heading">
              ₹{averageEarnings.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 p-6 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-[#283845]/10 dark:bg-[#283845]/40 border border-[#283845]/20 dark:border-[#FFA649]/30 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#283845] dark:text-[#FFA649] stroke-[2.5px]" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider">Completed Jobs</span>
            <span className="text-xl font-bold text-[#283845] dark:text-white font-heading">
              {totalCompletedJobs}
            </span>
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
                    <th className="py-3 px-2">Job Type</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2 text-right">Earning Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE5DE] dark:divide-white/10 text-stone-700 dark:text-stone-300">
                  {paginatedJobs.map(job => (
                    <tr key={job.bookingId} className="hover:bg-stone-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2 font-bold text-[#283845] dark:text-white flex items-center gap-1.5">
                        {job.jobType}
                        {job.isLive && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold uppercase">
                            Live
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-2">
                        {new Date(job.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-2 font-semibold text-[#283845] dark:text-white">{job.customerName}</td>
                      <td className="py-4 px-2 font-bold text-[#283845] dark:text-[#FFA649] text-right font-mono">
                        ₹{job.payoutAmount?.toLocaleString('en-IN') || 0}
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
