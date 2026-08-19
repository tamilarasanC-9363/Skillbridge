import React from 'react';
import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';
import VerifiedBadge from './VerifiedBadge';
import { MapPin, Award } from 'lucide-react';

export default function WorkerCard({ worker, onSelect, actionText = 'View Profile' }) {
  if (!worker) return null;

  return (
    <div className="bg-card-bg rounded-2xl shadow-2xs border border-border-custom hover:shadow-xs hover:border-primary/30 transition-all duration-200 p-5 flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden animate-fade-in">
      {/* Availability Pill */}
      <span className={`absolute top-4 right-4 inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
        worker.availability 
          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
          : 'bg-gray-50 dark:bg-slate-900 text-text-muted border border-border-custom'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${worker.availability ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
        {worker.availability ? 'Available' : 'Unavailable'}
      </span>

      {/* Avatar Container */}
      <div className="flex-shrink-0 flex justify-center">
        <img 
          src={worker.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=2563EB&color=fff`} 
          alt={worker.name} 
          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-border-custom"
        />
      </div>

      {/* Info Content */}
      <div className="flex-grow flex flex-col items-start text-left">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold text-text-main leading-tight">{worker.name}</h3>
          <VerifiedBadge verified={worker.verified} />
        </div>

        {/* Rating and Experience row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
          <RatingStars rating={worker.rating} count={worker.reviewCount} />
          
          <span className="flex items-center gap-1 text-sm text-text-muted font-medium">
            <Award className="w-4 h-4 text-primary" />
            {worker.experience} yrs exp
          </span>

          {worker.completedJobs > 0 && (
            <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">
              {worker.completedJobs} jobs done
            </span>
          )}
        </div>

        {/* Location & Pricing */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-text-muted">
          <span className="flex items-center gap-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {worker.location}
          </span>
          {worker.priceRange && (
            <span className="font-semibold text-text-main bg-gray-50 dark:bg-slate-805/50 border border-border-custom px-2 py-0.5 rounded-sm">
              Est: {worker.priceRange}
            </span>
          )}
        </div>

        {/* Bio summary */}
        <p className="text-sm text-text-sub mt-3 line-clamp-2 leading-relaxed">
          {worker.bio || 'Professional and background-verified service provider.'}
        </p>

        {/* Skills Tag clouds */}
        {worker.skills && worker.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3.5">
            {worker.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="bg-gray-55/60 dark:bg-slate-800 text-text-sub border border-border-custom text-[10px] font-semibold px-2 py-0.5 rounded-md">
                {skill}
              </span>
            ))}
            {worker.skills.length > 3 && (
              <span className="bg-gray-50 dark:bg-slate-900 text-text-muted text-[10px] font-medium px-2 py-0.5 rounded-md">
                +{worker.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Button Action */}
      <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0 flex flex-col justify-end">
        {worker.recommendationScore !== undefined && (
          <div className="text-[10px] text-right text-text-muted font-semibold mb-2 hidden md:block">
            Score: {(worker.recommendationScore * 100).toFixed(0)}% Match
          </div>
        )}
        
        {onSelect ? (
          <button 
            onClick={() => onSelect(worker)}
            disabled={!worker.availability}
            className="w-full md:w-auto px-5 py-2.5 text-sm font-bold text-white btn-gradient rounded-xl shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {actionText}
          </button>
        ) : (
          <Link 
            to={`/customer/worker/${worker.userId}`}
            className="w-full md:w-auto text-center px-5 py-2.5 text-sm font-bold text-white btn-gradient rounded-xl shadow-xs"
          >
            {actionText}
          </Link>
        )}
      </div>
    </div>
  );
}
