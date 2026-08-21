import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';
import VerifiedBadge from './VerifiedBadge';
import { MapPin, Award, ArrowRight, CheckCircle, User } from 'lucide-react';

export default function WorkerCard({ worker, onSelect, actionText = 'View Profile' }) {
  if (!worker) return null;

  return (
    <div className="bg-white dark:bg-[#1B2731] rounded-2xl border border-[#EBE5DE] dark:border-white/10 hover:border-[#FFA649]/60 dark:hover:border-[#FFA649]/60 hover:shadow-lg transition-all duration-300 p-5 flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden animate-fade-in text-left">
      {/* Availability Status Pill */}
      <span className={`absolute top-4 right-4 inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full ${
        worker.availability 
          ? 'bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] border border-[#FFA649]/30' 
          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-[#EBE5DE] dark:border-stone-700'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${worker.availability ? 'bg-[#FFA649] animate-pulse' : 'bg-stone-400'}`}></span>
        {worker.availability ? 'Available Today' : 'Unavailable'}
      </span>

      {/* Avatar Container */}
      <div className="flex-shrink-0 flex justify-center">
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#283845] to-[#1B2731] border-2 border-[#FFA649]/30 shadow-sm flex flex-col items-center justify-center text-[#FFA649]">
            <User className="w-7 h-7 mb-0.5" />
            <span className="text-[10px] font-extrabold tracking-wider uppercase font-mono">
              {worker.name?.slice(0, 2) || 'SP'}
            </span>
          </div>
          {worker.verified && (
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1B2731] rounded-full p-0.5 shadow-sm">
              <div className="w-5 h-5 rounded-full bg-[#FFA649] text-[#11171E] flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 stroke-[3px]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Worker Details Content */}
      <div className="flex-grow flex flex-col items-start">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold text-[#283845] dark:text-white leading-tight font-heading">
            {worker.name}
          </h3>
          <VerifiedBadge verified={worker.verified} worker={worker} />
        </div>

        {/* Rating and Experience Badges */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
          <RatingStars rating={worker.rating} count={worker.reviewCount} />
          
          <span className="flex items-center gap-1 text-xs font-bold text-[#283845] dark:text-[#FFA649] bg-[#283845]/10 dark:bg-[#283845]/40 border border-[#283845]/20 dark:border-[#FFA649]/30 px-2 py-0.5 rounded-lg">
            <Award className="w-3.5 h-3.5 text-[#FFA649]" />
            {worker.experience} yrs exp
          </span>

          {worker.completedJobs > 0 && (
            <span className="text-xs font-bold bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] border border-[#FFA649]/30 px-2 py-0.5 rounded-lg">
              {worker.completedJobs} jobs done
            </span>
          )}
        </div>

        {/* Location & Pricing */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            {worker.location}
          </span>
          {worker.priceRange && (
            <span className="font-extrabold text-[#283845] dark:text-stone-200 bg-stone-100 dark:bg-[#283845] px-2 py-0.5 rounded-md">
              Est: {worker.priceRange}
            </span>
          )}
        </div>

        {/* Bio summary */}
        <p className="text-xs text-stone-600 dark:text-stone-300 mt-2.5 line-clamp-2 leading-relaxed">
          {worker.bio || 'Verified trade specialist ready for fast dispatch and professional work.'}
        </p>

        {/* Skills Tag chips */}
        {worker.skills && worker.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {worker.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="bg-stone-100 dark:bg-[#283845] text-[#283845] dark:text-stone-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#EBE5DE] dark:border-white/10">
                {skill}
              </span>
            ))}
            {worker.skills.length > 3 && (
              <span className="bg-stone-50 dark:bg-[#1B2731] text-stone-500 dark:text-stone-400 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-[#EBE5DE] dark:border-white/10">
                +{worker.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0 flex flex-col justify-end">
        {worker.recommendationScore !== undefined && (
          <div className="text-[11px] text-right font-bold text-[#283845] dark:text-[#FFA649] mb-2 hidden md:block">
            ★ {(worker.recommendationScore * 100).toFixed(0)}% Match
          </div>
        )}
        
        {onSelect ? (
          <button 
            onClick={() => onSelect(worker)}
            disabled={!worker.availability}
            className="w-full md:w-auto px-5 py-2.5 text-xs font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link 
            to={`/customer/worker/${worker.userId}`}
            className="w-full md:w-auto text-center px-5 py-2.5 text-xs font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
