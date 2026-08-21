import { 
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, 
  ScanLine, Info, Camera, Wrench, FileCheck, PhoneCall
} from 'lucide-react';

export default function AIVerificationCard({ report, isAnalyzing = false, className = '' }) {
  if (isAnalyzing) {
    return (
      <div className={`p-5 rounded-2xl bg-[#FFA649]/10 border border-[#FFA649]/30 animate-pulse text-left ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFA649]/20 border border-[#FFA649]/40 flex items-center justify-center text-[#FFA649]">
            <ScanLine className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#283845] dark:text-white flex items-center gap-1.5 font-heading">
              <Sparkles className="w-3.5 h-3.5 text-[#FFA649]" />
              Work Verification Quality Audit in Progress...
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Auditing profile photo clarity, proof of work resolution & trade category consistency.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const { 
    decision = 'Ready for Admin Review', 
    decisionReason, 
    proofOfWorkLabel,
    layers = {}, 
    disclaimer 
  } = report;

  const isReady = decision === 'Ready for Admin Review';

  return (
    <div className={`p-5 rounded-2xl bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 shadow-xs text-left space-y-4 ${className}`}>
      {/* Header banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBE5DE] dark:border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#283845] border border-[#FFA649]/40 flex items-center justify-center text-[#FFA649]">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#283845] dark:text-white font-heading">
              SkillBridge Work Verification Audit
            </h4>
            <span className="text-[10px] text-stone-400 font-mono">
              Proof Type: {proofOfWorkLabel || 'Previous Work Proof'}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
          isReady 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-[#FFA649]/15 border border-[#FFA649]/30 text-[#283845] dark:text-[#FFA649]'
        }`}>
          {isReady ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ready for Admin Review</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Action Required</span>
            </>
          )}
        </div>
      </div>

      {/* Decision Reason Callout */}
      {decisionReason && (
        <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
          isReady 
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
            : 'bg-[#FFA649]/10 border-[#FFA649]/20 text-[#283845] dark:text-stone-200'
        }`}>
          <div className="font-extrabold uppercase text-[10px] tracking-wider mb-0.5 opacity-80">
            Audit Summary
          </div>
          <div>{decisionReason}</div>
        </div>
      )}

      {/* 4 Checks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {/* Check 1: Profile Photo */}
        {layers?.profilePhoto && (
          <div className="p-3 rounded-xl bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 flex items-start gap-2.5">
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
              layers.profilePhoto.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              <Camera className="w-3 h-3" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[10px] text-[#283845]/80 dark:text-[#FFA649] uppercase tracking-wider">
                  1. Profile Photo
                </span>
                <span className={`text-[10px] font-bold ${layers.profilePhoto.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {layers.profilePhoto.status}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300">
                {layers.profilePhoto.detail}
              </p>
            </div>
          </div>
        )}

        {/* Check 2: Proof of Work */}
        {layers?.proofOfWork && (
          <div className="p-3 rounded-xl bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 flex items-start gap-2.5">
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
              layers.proofOfWork.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[#FFA649]/20 text-[#FFA649]'
            }`}>
              <FileCheck className="w-3 h-3" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[10px] text-[#283845]/80 dark:text-[#FFA649] uppercase tracking-wider">
                  2. Proof of Work Clarity
                </span>
                <span className={`text-[10px] font-bold ${layers.proofOfWork.passed ? 'text-emerald-500' : 'text-[#FFA649]'}`}>
                  {layers.proofOfWork.status}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300">
                {layers.proofOfWork.detail}
              </p>
            </div>
          </div>
        )}

        {/* Check 3: Trade Consistency */}
        {layers?.tradeConsistency && (
          <div className="p-3 rounded-xl bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 flex items-start gap-2.5">
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
              layers.tradeConsistency.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[#FFA649]/20 text-[#FFA649]'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[10px] text-[#283845]/80 dark:text-[#FFA649] uppercase tracking-wider">
                  3. Trade Alignment
                </span>
                <span className={`text-[10px] font-bold ${layers.tradeConsistency.passed ? 'text-emerald-500' : 'text-[#FFA649]'}`}>
                  {layers.tradeConsistency.status}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300">
                {layers.tradeConsistency.detail}
              </p>
            </div>
          </div>
        )}

        {/* Check 4: Local Reference */}
        {layers?.localReference && (
          <div className="p-3 rounded-xl bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#FFA649]/20 text-[#FFA649]">
              <PhoneCall className="w-3 h-3" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[10px] text-[#283845]/80 dark:text-[#FFA649] uppercase tracking-wider">
                  4. Local Reference
                </span>
                <span className="text-[10px] font-bold text-[#FFA649]">
                  {layers.localReference.status}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300">
                {layers.localReference.detail}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Audit Disclaimer */}
      <div className="pt-2 border-t border-[#EBE5DE] dark:border-white/10 flex items-start gap-2 text-[10px] text-stone-500 dark:text-stone-400 italic">
        <Info className="w-3.5 h-3.5 text-[#FFA649] flex-shrink-0 mt-0.5" />
        <span>
          {disclaimer || 'SkillBridge AI audits image quality & trade consistency. Final verification approval is authorized by Admin Operations.'}
        </span>
      </div>
    </div>
  );
}
