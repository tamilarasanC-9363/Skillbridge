import { Star, StarHalf } from 'lucide-react';

export default function RatingStars({ rating = 0, count, showNumber = true }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3 && rating % 1 <= 0.8;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center space-x-1">
      <div className="flex text-amber-500 drop-shadow-xs">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-current" />
        ))}
        {hasHalf && <StarHalf className="w-3.5 h-3.5 fill-current" />}
        {[...Array(Math.max(0, emptyStars))].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">
          {rating > 0 ? rating.toFixed(1) : 'New'}
          {count !== undefined && (
            <span className="text-slate-400 dark:text-slate-400 font-normal text-[11px] ml-1">
              ({count})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
