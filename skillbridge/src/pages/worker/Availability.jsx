import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getWorkerProfile, toggleAvailability } from '../../services/workerService';
import LoadingSpinner from '../../components/LoadingSpinner';
import BackButton from '../../components/BackButton';
import { Clock, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        <h1 className="text-2xl font-extrabold text-gray-900">Work Availability</h1>
        <p className="text-xs text-gray-500 mt-1">Configure active status and job booking hours.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Toggle Panel */}
        <div className="flex justify-between items-center bg-gray-50/50 border border-gray-100 p-5 rounded-2xl">
          <div className="text-left">
            <span className="block text-[10px] font-bold text-gray-400 uppercase">Availability Status</span>
            <span className={`text-base font-bold ${profile?.availability ? 'text-emerald-600' : 'text-gray-400'}`}>
              {profile?.availability ? 'Open for Booking Match' : 'Offline / Unavailable'}
            </span>
            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">When online, you appear in client recommendations searches.</p>
          </div>
          <button 
            onClick={handleToggle}
            disabled={saving}
            className="text-primary hover:opacity-90 transition-opacity"
            title="Toggle Online"
          >
            {profile?.availability ? (
              <ToggleRight className="w-12 h-12 text-emerald-500 fill-current" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-gray-300" />
            )}
          </button>
        </div>

        {/* Working Hours settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Clock className="w-4.5 h-4.5 text-primary" />
            Working Hours Config
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Standard Work Shift</label>
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50/30"
              >
                <option value="09:00 AM – 06:00 PM">9 AM – 6 PM</option>
                <option value="08:00 AM – 05:00 PM">8 AM – 5 PM</option>
                <option value="10:00 AM – 08:00 PM">10 AM – 8 PM</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Active Days</label>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50/30"
              >
                <option value="Monday – Saturday">Monday – Saturday</option>
                <option value="Everyday">Everyday</option>
                <option value="Monday – Friday">Monday – Friday</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
