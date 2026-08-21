import { 
  ShieldCheck, Star, Award, 
  CheckCircle2, XCircle, Info, Sparkles, Wrench
} from 'lucide-react';
import { evaluateWorkerEligibility } from '../services/verificationEligibilityService';

export default function VerificationEligibilityCard({ worker, className = '' }) {
  if (!worker) return null;

  const eligibility = worker.verificationEligibility || evaluateWorkerEligibility(worker);
  const { isEligible, metCount, totalCriteria, eligibilityScore, criteria, disclaimer } = eligibility;

  const criteriaList = [
    {
      key: 'rating',
      icon: Star,
      data: criteria.rating,
      requirement: 'Rating ≥ 4.0'
    },
    {
      key: 'experience',
      icon: Award,
      data: criteria.experience,
      requirement: 'Experience ≥ 2 Yrs'
    },
    {
      key: 'workVerification',
      icon: Wrench,
      data: criteria.workVerification,
      requirement: 'Work Verification Approved'
    }
  ];

  return (
    <div className={`p-5 rounded-3xl bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 shadow-xs text-left space-y-4 ${className}`}>
      {/* Header with Eligibility Badge & Score */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBE5DE] dark:border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isEligible 
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
              : 'bg-[#FFA649]/20 text-[#FFA649] border border-[#FFA649]/40'
          }`}>
            {isEligible ? <ShieldCheck className="w-4.5 h-4.5" /> : <Sparkles className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#283845] dark:text-white font-heading">
              Verification Eligibility Status
            </h4>
            <span className="text-[10px] text-stone-400">
              {metCount} of {totalCriteria} Core Criteria Met
            </span>
          </div>
        </div>

        <div>
          {isEligible ? (
            <span className="px-3 py-1 text-[11px] font-extrabold rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>🏅</span>
              <span>Verified Worker</span>
            </span>
          ) : (
            <span className="px-3 py-1 text-[11px] font-extrabold rounded-full bg-[#384F60]/25 border border-[#FFA649]/30 text-[#FFA649] flex items-center gap-1">
              <span>✨</span>
              <span>New Worker ({eligibilityScore}%)</span>
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-[#EBE5DE] dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${isEligible ? 'bg-emerald-500' : 'bg-[#FFA649]'}`} 
            style={{ width: `${eligibilityScore}%` }}
          />
        </div>
      </div>

      {/* 3 Criteria Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        {criteriaList.map(item => {
          const Icon = item.icon;
          const isMet = item.data?.met;
          return (
            <div 
              key={item.key}
              className={`p-3 rounded-2xl border transition-all ${
                isMet 
                  ? 'bg-white dark:bg-[#1B2731] border-[#EBE5DE] dark:border-white/10' 
                  : 'bg-white/50 dark:bg-[#18222B]/60 border-amber-200/50 dark:border-amber-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    isMet ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-stone-100 dark:bg-white/5 text-stone-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[#283845] dark:text-white">
                      {item.data?.label}
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">
                      {item.data?.detail}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isMet ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notice */}
      <div className="pt-2 border-t border-[#EBE5DE] dark:border-white/10 flex items-start gap-2 text-[10px] text-stone-500 dark:text-stone-400 italic">
        <Info className="w-3.5 h-3.5 text-[#FFA649] flex-shrink-0 mt-0.5" />
        <span>
          {disclaimer}
        </span>
      </div>
    </div>
  );
}
