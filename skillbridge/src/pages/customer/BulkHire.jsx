import BulkHireForm from '../../components/BulkHireForm';
import BackButton from '../../components/BackButton';
import { Briefcase, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BulkHire() {
  const { userRole } = useAuth();
  const defaultDashboard = userRole === 'admin' ? '/admin' : userRole === 'worker' ? '/worker' : '/customer';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to={defaultDashboard} label="Back to Dashboard" className="mb-6" />

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white font-heading">Bulk Hiring Portal</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Submit high-volume staffing requests for commercial jobs, construction, painting, or cleaning contracts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BulkHireForm />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#283845] dark:text-white mb-3 flex items-center gap-1.5 font-heading">
              <Briefcase className="w-4 h-4 text-[#FFA649]" />
              How It Works
            </h3>
            <ol className="text-xs text-stone-600 dark:text-stone-300 space-y-3 list-decimal pl-4 leading-relaxed">
              <li>Submit details about your business requirements, worker count, location, and durations.</li>
              <li>Our administration reviews your application and validates available workers.</li>
              <li>An operations expert coordinates details and matches background-verified personnel to your schedule.</li>
            </ol>
          </div>

          <div className="bg-[#FFA649]/10 dark:bg-[#FFA649]/15 border border-[#FFA649]/30 rounded-3xl p-6 text-xs text-[#283845] dark:text-[#FFA649] leading-relaxed flex gap-2.5">
            <Info className="w-5 h-5 text-[#FFA649] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Enterprise support:</span> Our bulk contracts include comprehensive check-ins and verified billing estimates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
