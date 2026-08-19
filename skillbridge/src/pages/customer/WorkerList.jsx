import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRecommendedWorkers } from '../../services/recommendationService';
import WorkerCard from '../../components/WorkerCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import BackButton from '../../components/BackButton';
import { RefreshCw, Star, Info } from 'lucide-react';

export default function WorkerList() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Safeguard if state is lost on page refreshes
  const searchCriteria = state || {
    category: 'Plumbing',
    jobType: 'Pipe Leakage Repair',
    location: 'Chennai Central',
    urgency: 'normal',
    bookingType: 'instant',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: 'Immediate',
    description: ''
  };

  const fetchRecommendations = async () => {
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
  };

  useEffect(() => {
    fetchRecommendations();
  }, [state]);

  const handleWorkerSelect = (worker) => {
    // Navigate to WorkerProfile passing search requirements too
    navigate(`/customer/worker/${worker.userId}`, {
      state: {
        bookingRequest: searchCriteria,
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
          <h1 className="text-xl font-bold text-gray-900">Recommended Specialists</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Matching <span className="font-semibold text-gray-700">{searchCriteria.jobType}</span> in <span className="font-semibold text-gray-700">{searchCriteria.location}</span>.
          </p>
        </div>

        <button 
          onClick={fetchRecommendations}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Matches
        </button>
      </div>

      {/* Recommendation System breakdown disclosure */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3 text-xs text-blue-800 leading-relaxed items-start">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Smart Recommendation Algorithm:</span> Sorting is calculated using a weighted balance of star ratings (35%), exact job skill matches (25%), availability status (15%), location proximity (15%), and experience duration (10%).
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-4 text-xs font-medium text-center">
          {error}
        </div>
      ) : workers.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 shadow-3xs">
          <Star className="w-12 h-12 text-amber-300 mx-auto mb-3 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-800">No Verified Workers Found</h3>
          <p className="text-xs text-gray-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            We couldn't find any verified, available workers matching this category in "{searchCriteria.location}". Try selecting a broader location like "Chennai Central" or check back shortly.
          </p>
          <Link 
            to="/customer/search"
            className="inline-block mt-6 px-6 py-2.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-xs"
          >
            Refine Search Criteria
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Recommended For You</h2>
          {workers.map((worker, idx) => (
            <WorkerCard 
              key={worker.userId}
              worker={worker}
              onSelect={handleWorkerSelect}
              actionText="View Profile & Book"
            />
          ))}
        </div>
      )}
    </div>
  );
}
