import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getWorkerProfile, toggleAvailability } from '../../services/workerService';
import LoadingSpinner from '../../components/LoadingSpinner';
import BackButton from '../../components/BackButton';
import { Clock, ToggleLeft, ToggleRight } from 'lucide-react';

export default function Availability() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Working Hours (mock parameters)
  const [hours, setHours] = useState('09:00 AM – 06:00 PM');
  const [days, setDays] = useState('Monday – Saturday');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const prof = await getWorkerProfile(currentUser.uid);
        setProfile(prof);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleToggle = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const nextVal = !profile.availability;
      await toggleAvailability(currentUser.uid, nextVal);
      setProfile(prev => ({ ...prev, availability: nextVal }));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to="/worker" label="Back to Dashboard" className="mb-6" />

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white font-heading">Work Availability</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Configure active status and job booking hours.</p>
      </div>

      <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Toggle Panel */}
        <div className="flex justify-between items-center bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 p-5 rounded-2xl">
          <div className="text-left">
            <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider">Availability Status</span>
            <span className={`text-base font-bold ${profile?.availability ? 'text-[#FFA649]' : 'text-stone-400'}`}>
              {profile?.availability ? 'Open for Booking Match' : 'Offline / Unavailable'}
            </span>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-[200px]">When online, you appear in client recommendations searches.</p>
          </div>
          <button 
            onClick={handleToggle}
            disabled={saving}
            className="text-[#FFA649] hover:opacity-90 transition-opacity cursor-pointer"
            title="Toggle Online"
          >
            {profile?.availability ? (
              <ToggleRight className="w-12 h-12 text-[#FFA649] fill-current" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-stone-300 dark:text-stone-600" />
            )}
          </button>
        </div>

        {/* Working Hours settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#283845] dark:text-white flex items-center gap-1.5 font-heading">
            <Clock className="w-4.5 h-4.5 text-[#FFA649]" />
            Working Hours Config
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider mb-1">Standard Work Shift</label>
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full h-11 border border-[#EBE5DE] dark:border-white/10 rounded-xl px-3 py-2.5 bg-stone-50 dark:bg-[#11171E] text-[#283845] dark:text-white cursor-pointer"
              >
                <option value="09:00 AM – 06:00 PM" className="bg-white dark:bg-[#11171E] text-[#283845] dark:text-white">9 AM – 6 PM</option>
                <option value="08:00 AM – 05:00 PM" className="bg-white dark:bg-[#11171E] text-[#283845] dark:text-white">8 AM – 5 PM</option>
                <option value="10:00 AM – 08:00 PM" className="bg-white dark:bg-[#11171E] text-[#283845] dark:text-white">10 AM – 8 PM</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider mb-1">Active Days</label>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full h-11 border border-[#EBE5DE] dark:border-white/10 rounded-xl px-3 py-2.5 bg-stone-50 dark:bg-[#11171E] text-[#283845] dark:text-white cursor-pointer"
              >
                <option value="Monday – Saturday" className="bg-white dark:bg-[#11171E] text-[#283845] dark:text-white">Monday – Saturday</option>
                <option value="Everyday" className="bg-white dark:bg-[#11171E] text-[#283845] dark:text-white">Everyday</option>
                <option value="Monday – Friday" className="bg-white dark:bg-[#11171E] text-[#283845] dark:text-white">Monday – Friday</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
