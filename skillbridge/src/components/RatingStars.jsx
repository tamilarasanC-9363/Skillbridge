import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export default function RatingStars({ rating = 0, count, showNumber = true }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3 && rating % 1 <= 0.8;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center space-x-1">
      <div className="flex text-amber-500">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-current" />
        ))}
        {hasHalf && <StarHalf className="w-4 h-4 fill-current" />}
        {[...Array(Math.max(0, emptyStars))].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {rating > 0 ? rating.toFixed(1) : 'No ratings'}
          {count !== undefined && (
            <span className="text-gray-400 font-normal text-xs ml-1">
              ({count} {count === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
