import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForUser } from '../../services/bookingService';
import { subscribeToReviewsForWorker } from '../../services/reviewService';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import RatingStars from '../../components/RatingStars';
import { Briefcase, CalendarDays, CheckSquare, Clock, Play, Star, UserRound } from 'lucide-react';

export default function WorkerFeedbacks() {
  const { currentUser } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    let unsubscribeReviews = () => {};
    let cancelled = false;

    const loadBookingsAndReviews = async () => {
      try {
        setLoading(true);
        const bookings = await getBookingsForUser(currentUser.uid, 'worker');
        const bookingMap = new Map((bookings || []).map(booking => [booking.bookingId, booking]));

        unsubscribeReviews = subscribeToReviewsForWorker(currentUser.uid, (reviews) => {
          if (cancelled) return;

          const enriched = (reviews || [])
            .map(review => {
              const booking = bookingMap.get(review.bookingId) || {};
              const date = review.createdAt?.seconds
                ? new Date(review.createdAt.seconds * 1000)
                : new Date(review.createdAt || Date.now());

              const mockUsers = JSON.parse(localStorage.getItem('sb_mock_users') || '{}');
              const customerName = booking.customerName || mockUsers[review.customerId]?.name || 'Customer';

              return {
                ...review,
                customerName,
                jobName: booking.jobType || booking.category || 'Service',
                date
              };
            })
            .sort((a, b) => b.date - a.date);

          setFeedbacks(enriched);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error loading worker feedbacks:', error);
        setLoading(false);
      }
    };

    loadBookingsAndReviews();

    return () => {
      cancelled = true;
      unsubscribeReviews();
    };
  }, [currentUser]);

  const sidebarLinks = [
    { label: 'Overview Dashboard', path: '/worker', icon: Briefcase, end: true },
    { label: 'Incoming Job Requests', path: '/worker/requests', icon: Clock },
    { label: 'Active Service Tasks', path: '/worker/jobs', icon: Play },
    { label: 'My Bookings History', path: '/worker/bookings', icon: CheckSquare },
    { label: 'Customer Feedbacks', path: '/worker/feedbacks', icon: Star }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-4 animate-fade-in text-left">
      <Sidebar links={sidebarLinks} title="Worker Portal" />

      <div className="flex-grow space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white font-heading flex items-center gap-2.5">
              <Star className="w-6 h-6 text-[#FFA649] fill-current" />
              Customer Feedbacks
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Review the latest customer ratings and comments left after your completed jobs.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-[#FFA649]/15 border border-[#FFA649]/30 text-[#283845] dark:text-[#FFA649] text-xs font-bold flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[#FFA649] fill-current" />
            {feedbacks.length} Reviews
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-12 text-center text-stone-500 shadow-xs space-y-3">
            <Star className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
            <h3 className="text-base font-bold text-[#283845] dark:text-white font-heading">No customer feedback yet</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Completed bookings will show customer ratings, comments, and job summaries here as soon as reviews are submitted.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map(feedback => (
              <div
                key={feedback.reviewId || `${feedback.bookingId}-${feedback.customerId}`}
                className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EBE5DE] dark:border-white/10">
                  <div className="flex items-center gap-2.5 text-[#283845] dark:text-white font-bold text-sm">
                    <UserRound className="w-4 h-4 text-[#FFA649]" />
                    {feedback.customerName}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <CalendarDays className="w-3.5 h-3.5 text-stone-400" />
                    {feedback.date.toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">Rating</span>
                    <RatingStars rating={Number(feedback.rating || 0)} showNumber={true} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-[#11171E] rounded-xl border border-[#EBE5DE] dark:border-white/10 px-3 py-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#FFA649]" />
                    {feedback.jobName}
                  </div>
                </div>

                <div className="mt-4 bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-2xl p-4 text-xs text-stone-600 dark:text-stone-300 leading-relaxed italic">
                  “{feedback.comment || 'No additional comment provided.'}”
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
