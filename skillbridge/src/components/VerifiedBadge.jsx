import React from 'react';

export default function VerifiedBadge({ verified = false, size = 'sm' }) {
  if (!verified) return null;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`inline-flex items-center gap-1 font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-full select-none ${sizeClasses[size]}`}>
      ✓ Verified
    </span>
  );
}
