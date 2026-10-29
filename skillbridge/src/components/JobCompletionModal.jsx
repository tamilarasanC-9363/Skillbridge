import { useState, useEffect } from 'react';
import { completeJobWithEvidence } from '../services/bookingService';
import LoadingSpinner from './LoadingSpinner';
import { 
  Camera, MapPin, CheckCircle, AlertTriangle, 
  X, Info 
} from 'lucide-react';

export default function JobCompletionModal({ booking, workerId, onClose, onSuccess }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notes, setNotes] = useState('');
  
  // Geolocation state
  const [locationStatus, setLocationStatus] = useState('requesting'); // requesting | captured | denied | unavailable
  const [coords, setCoords] = useState(null);
  const [locationTimestamp, setLocationTimestamp] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-request location on modal mount
  const requestDeviceLocation = () => {
    setLocationStatus('requesting');
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy)
        });
        setLocationTimestamp(new Date().toISOString());
        setLocationStatus('captured');
      },
      (err) => {
        console.warn('Geolocation capture failed or denied:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('denied');
        } else {
          setLocationStatus('unavailable');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    requestDeviceLocation();
  }, []);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, WEBP).');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!photoFile) {
      setError('Photo evidence is required to mark this job as completed.');
      return;
    }

    if (!notes.trim()) {
      setError('Please provide a brief completion note describing the work performed.');
      return;
    }

    setLoading(true);
    try {
      await completeJobWithEvidence({
        bookingId: booking.bookingId || booking.id,
        workerId,
        photoFile,
        notes: notes.trim(),
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
        locationAccuracy: coords?.accuracy || null,
        locationStatus
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Job completion error:', err);
      setError(err.message || 'Failed to submit job completion evidence.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none text-left">
      <div 
        className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EBE5DE] dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-[#283845] dark:text-white font-heading">
                Mark Job Completed
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Submit completion evidence with photo and geotagging for quality assurance.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-white p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Job Summary Banner */}
        <div className="p-3.5 bg-stone-50 dark:bg-[#11171E] rounded-2xl border border-[#EBE5DE] dark:border-white/10 text-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#283845] dark:text-white text-sm">{booking.jobType}</span>
            <span className="font-mono text-[10px] text-stone-400">#{booking.bookingId?.slice(-6).toUpperCase()}</span>
          </div>
          <div className="text-stone-500 flex items-center gap-2 flex-wrap">
            <span>Client: <strong className="text-stone-700 dark:text-stone-300">{booking.customerName || 'Customer'}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#FFA649]" />
              {booking.location || 'Client Location'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Geolocation Status Card */}
          <div className="p-3.5 rounded-2xl border text-xs space-y-2 bg-stone-50 dark:bg-[#11171E] border-[#EBE5DE] dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#283845] dark:text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FFA649]" />
                Job Site Geotagging
              </span>
              {locationStatus === 'captured' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ✓ Coordinates Recorded
                </span>
              )}
              {locationStatus === 'requesting' && (
                <span className="text-[10px] text-[#FFA649] font-medium flex items-center gap-1">
                  <LoadingSpinner size="sm" /> Acquiring GPS...
                </span>
              )}
              {['denied', 'unavailable'].includes(locationStatus) && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  GPS Unverified
                </span>
              )}
            </div>

            {locationStatus === 'captured' && coords && (
              <div className="text-[11px] text-stone-600 dark:text-stone-300 space-y-1">
                <div className="font-mono">
                  Latitude: <strong>{coords.latitude}°</strong> • Longitude: <strong>{coords.longitude}°</strong> (±{coords.accuracy}m)
                </div>
                <div className="text-[10px] text-stone-400">
                  Captured at: {new Date(locationTimestamp).toLocaleTimeString()}
                </div>
              </div>
            )}

            {locationStatus === 'denied' && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                <p>
                  <strong>Location permission denied:</strong> Your browser denied GPS access. The completion will proceed with photo evidence and will be flagged for review without coordinates.
                </p>
                <button
                  type="button"
                  onClick={requestDeviceLocation}
                  className="mt-1 text-xs font-bold text-[#FFA649] hover:underline cursor-pointer"
                >
                  Retry Location Permission
                </button>
              </div>
            )}

            {locationStatus === 'unavailable' && (
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-500 leading-relaxed">
                Device location service is not available on this device. Completion will proceed with photo evidence.
              </div>
            )}
          </div>

          {/* Photo Evidence Capture (Camera or File) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider">
              Photo Evidence of Completed Work *
            </label>

            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#EBE5DE] dark:border-white/10 bg-slate-900 h-44 group">
                <img 
                  src={photoPreview} 
                  alt="Job Completion Evidence" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label className="px-3.5 py-1.5 btn-gradient text-[#11171E] text-xs font-bold rounded-xl cursor-pointer shadow-md">
                    Change Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      onChange={handlePhotoSelect} 
                      className="hidden" 
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#EBE5DE] dark:border-white/15 hover:border-[#FFA649] dark:hover:border-[#FFA649] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-stone-50/50 dark:bg-[#11171E]">
                <div className="w-12 h-12 rounded-2xl bg-[#FFA649]/15 text-[#FFA649] flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-[#283845] dark:text-white block">
                    Take a Photo or Upload Work Picture
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 block">
                    Supports mobile camera capture or photo gallery
                  </span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handlePhotoSelect} 
                  className="hidden" 
                />
              </label>
            )}
          </div>

          {/* Completion Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider">
              Work Completion Notes & Description *
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the completed work, parts replaced, or tests performed (e.g. Cleared sink pipe blockage, tested flow for 10 minutes with zero leakage)..."
              className="w-full bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-xl p-3 text-xs text-[#283845] dark:text-white placeholder-stone-400 focus:outline-none focus:border-[#FFA649] resize-none"
              required
            />
          </div>

          {/* Supporting Evidence Disclaimer */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
            <span>
              Disclaimer: Geotagged photo evidence is supporting documentation for quality assurance. Photo evidence and timestamps assist the platform and client in verification.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-[#EBE5DE] dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[#EBE5DE] dark:border-white/10 text-stone-600 dark:text-stone-300 hover:text-[#283845] dark:hover:text-white text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 btn-gradient text-[#11171E] text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="black" />
                  <span>Submitting Evidence...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Evidence & Complete Job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

