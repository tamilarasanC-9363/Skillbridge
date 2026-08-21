import { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRecommendedWorkers } from '../../services/recommendationService';
import WorkerCard from '../../components/WorkerCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import BackButton from '../../components/BackButton';
import { RefreshCw, Star, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function WorkerList() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Safeguard if state is lost on page refreshes
  const searchCriteria = useMemo(() => state || {
    category: 'Plumbing',
    jobType: 'Pipe Leakage Repair',
    location: 'Chennai Central',
    urgency: 'normal',
    bookingType: 'instant',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: 'Immediate',
    description: ''
  }, [state]);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await getRecommendedWorkers(
        searchCriteria.category,
        searchCriteria.jobType,
        searchCriteria.location
      );
      setWorkers(list);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve worker recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchCriteria.category, searchCriteria.jobType, searchCriteria.location]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleWorkerSelect = (worker) => {
    // Navigate to WorkerProfile passing search requirements too
    navigate(`/customer/worker/${worker.userId}`, {
      state: {
        bookingCriteria: searchCriteria,
        worker
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in text-left">
      <div className="mb-4">
        <BackButton 
          to={`/customer/search?category=${encodeURIComponent(searchCriteria.category)}`}
          label="Back to Search Options"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#283845] dark:text-white font-heading">Recommended Specialists</h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Matching <span className="font-bold text-[#283845] dark:text-[#FFA649]">{searchCriteria.jobType}</span> in <span className="font-bold text-[#283845] dark:text-[#FFA649]">{searchCriteria.location}</span>.
          </p>
        </div>

        <button 
          onClick={fetchRecommendations}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#283845] dark:text-stone-300 border border-[#EBE5DE] dark:border-white/10 rounded-xl hover:bg-stone-100 dark:hover:bg-white/5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#FFA649]" />
          Refresh Matches
        </button>
      </div>

      {/* Smart Recommendation explanation compact card */}
      <div 
        onClick={() => setShowDetails(!showDetails)}
        className="group bg-white dark:bg-[#1B2731] border border-[#FFA649]/30 hover:border-[#FFA649]/60 rounded-2xl p-3.5 sm:p-4 mb-6 transition-all duration-300 shadow-sm cursor-pointer select-none"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#FFA649]/15 border border-[#FFA649]/30 text-[#FFA649] flex items-center justify-center flex-shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
              <span className="text-xs font-bold text-[#283845] dark:text-stone-200">Why are these workers recommended?</span>
              <span className="hidden sm:inline text-stone-400 text-xs">·</span>
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                Ranked by proximity, verified rating & past success
              </span>
            </div>
          </div>
          <div className="text-stone-400 group-hover:text-[#FFA649] transition-colors flex-shrink-0">
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {/* Collapsible Details Content */}
        {showDetails && (
          <div className="mt-3.5 pt-3.5 border-t border-[#EBE5DE] dark:border-white/10 text-xs text-stone-600 dark:text-stone-300 space-y-2 animate-fade-in">
            <div className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFA649] mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#283845] dark:text-white">Matching algorithm:</strong> Specialists within {searchCriteria.location} are prioritized to ensure sub-15 minute arrival.</span>
            </div>
            <div className="flex items-start gap-2">
              <Star className="w-3.5 h-3.5 text-[#FFA649] mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#283845] dark:text-white">Trust weighting:</strong> Completed job history and high reviews increase ranking in the match feed.</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl p-6 text-center text-xs font-semibold">
          {error}
        </div>
      ) : workers.length === 0 ? (
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-10 text-center shadow-xs">
          <p className="text-base font-bold text-[#283845] dark:text-white">No available specialists matched your exact query.</p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">Try adjusting the service locality or expanding to neighboring pin codes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workers.map(worker => (
            <WorkerCard 
              key={worker.userId}
              worker={worker}
              onSelect={handleWorkerSelect}
              actionText="Select & Book"
            />
          ))}
        </div>
      )}
    </div>
  );
}
