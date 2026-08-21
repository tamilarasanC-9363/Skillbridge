export default function VerifiedBadge({ verified = false, worker, showNew = true, size = 'sm' }) {
  // Determine if worker is verified based on explicit flag or full criteria
  const isVerified = worker 
    ? Boolean(worker.verified === true || worker.workVerificationStatus === 'Approved')
    : Boolean(verified);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  if (isVerified) {
    return (
      <span className={`inline-flex items-center gap-1 font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full select-none shadow-2xs ${sizeClasses[size]}`}>
        <span>🏅</span>
        <span>Verified Worker</span>
      </span>
    );
  }

  if (showNew) {
    return (
      <span className={`inline-flex items-center gap-1 font-bold bg-[#384F60]/20 text-[#FFA649] border border-[#FFA649]/30 rounded-full select-none ${sizeClasses[size]}`}>
        <span>✨</span>
        <span>New Worker</span>
      </span>
    );
  }

  return null;
}
