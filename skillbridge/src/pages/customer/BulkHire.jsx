import React from 'react';
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
        <h1 className="text-2xl font-extrabold text-gray-900">Bulk Hiring Portal</h1>
        <p className="text-xs text-gray-500 mt-1">Submit high-volume staffing requests for commercial jobs, construction, painting, or cleaning contracts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BulkHireForm />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-primary" />
              How It Works
            </h3>
            <ol className="text-xs text-gray-600 space-y-3 list-decimal pl-4 leading-relaxed">
              <li>Submit details about your business requirements, worker count, location, and durations.</li>
              <li>Our administration reviews your application and validates available workers.</li>
              <li>An operations expert coordinates details and matches background-verified personnel to your schedule.</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 text-xs text-blue-800 leading-relaxed flex gap-2.5">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Enterprise support:</span> Our bulk contracts include comprehensive check-ins and verified billing estimates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
