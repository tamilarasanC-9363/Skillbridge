import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PriceEstimate from '../../components/PriceEstimate';
import BackButton from '../../components/BackButton';
import { MapPin, Calendar, Clock } from 'lucide-react';
import FormInput from '../../components/FormInput';

const CATEGORY_JOBS = {
  'Plumbing': [
    'Pipe Leakage Repair', 'Tap / Faucet Repair', 'Toilet Repair', 
    'Drain Blockage', 'Water Tank Installation', 'Pipe Installation'
  ],
  'Electrical': [
    'Wiring Installation', 'Electrical Fault Repair', 'Switch / Socket Repair', 
    'Fan Installation / Repair', 'Light Installation', 'MCB / DB Repair', 
    'Short-Circuit Troubleshooting'
  ],
  'Carpentry': [
    'Door Repair', 'Door Installation', 'Furniture Repair', 
    'Cabinet Installation', 'Wardrobe Work', 'Custom Furniture'
  ],
  'Mason / Construction': [
    'Brick Wall Construction', 'Wall Repair', 'Cement Work', 
    'Tile Installation', 'Plastering', 'Concrete Work', 
    'Demolition Work', 'Construction Labor'
  ],
  'Painting': [
    'Interior Wall Painting', 'Exterior Painting', 'Ceiling Painting', 
    'Repainting', 'Waterproof Coating'
  ],
  'Cleaning': [
    'Home Deep Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning', 
    'Office Cleaning', 'Post-Construction Cleaning', 'Water Tank Cleaning'
  ]
};

export default function ServiceSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'Plumbing';

  const [category, setCategory] = useState(categoryParam);
  const [selectedJob, setSelectedJob] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [bookingType, setBookingType] = useState('instant');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Reset selected job if category changes
  useEffect(() => {
    setSelectedJob('');
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedJob) {
      setError('Please select a specific job.');
      return;
    }
    if (!location.trim()) {
      setError('Please enter your location.');
      return;
    }
    if (bookingType === 'pre-booking' && (!scheduledDate || !scheduledTime)) {
      setError('Please choose preferred date and time for scheduled pre-booking.');
      return;
    }

    // Pass configuration variables to recommendation list view
    navigate('/customer/workers', {
      state: {
        category,
        jobType: selectedJob,
        location,
        urgency,
        bookingType,
        scheduledDate: bookingType === 'instant' ? new Date().toISOString().split('T')[0] : scheduledDate,
        scheduledTime: bookingType === 'instant' ? 'Immediate' : scheduledTime,
        description
      }
    });
  };

  const jobsList = CATEGORY_JOBS[category] || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to="/customer" label="Back to Dashboard" className="mb-6" />

      <div className="bg-card-bg border border-border-custom rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6 border-b border-border-custom pb-5">
          <h1 className="text-xl font-bold text-text-main">Define Service Requirements</h1>
          <p className="text-xs text-text-muted mt-1">Specify your exact job needs so our recommendation system can find the best local matching specialist.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3.5 text-xs font-medium mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Service Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-border-custom rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary bg-card-bg/60 text-text-main cursor-pointer"
            >
              {Object.keys(CATEGORY_JOBS).map(cat => (
                <option key={cat} value={cat} className="bg-[#0F172A] text-white">{cat}</option>
              ))}
            </select>
          </div>

          {/* Job Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Select Specific Job Type *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {jobsList.map(job => (
                <button
                  type="button"
                  key={job}
                  onClick={() => setSelectedJob(job)}
                  className={`px-4 py-3 border rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    selectedJob === job 
                      ? 'bg-primary/20 border-primary text-white shadow-3xs' 
                      : 'border-border-custom text-text-sub hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {job}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Estimation preview (interactive helper) */}
          {selectedJob && (
            <PriceEstimate category={category} jobType={selectedJob} showDisclaimer={true} />
          )}

          {/* Location field */}
          <div>
            <FormInput
              label="Your Location (Locality / Area / City)"
              icon={MapPin}
              type="text"
              name="location"
              placeholder="e.g. Chennai Central"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <div className="text-[10px] text-text-muted mt-1.5">Try entering "Chennai Central" or "Adyar" to test location proximity scores!</div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Urgency Level</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-text-sub cursor-pointer font-medium hover:text-white">
                <input 
                  type="radio" 
                  name="urgency" 
                  value="normal" 
                  checked={urgency === 'normal'} 
                  onChange={() => setUrgency('normal')}
                  className="text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                Normal (Regular schedule)
              </label>
              <label className="flex items-center gap-2 text-sm text-text-sub cursor-pointer font-medium hover:text-white">
                <input 
                  type="radio" 
                  name="urgency" 
                  value="urgent"
                  checked={urgency === 'urgent'} 
                  onChange={() => setUrgency('urgent')}
                  className="text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                Urgent (Immediate assistance required)
              </label>
            </div>
          </div>

          {/* Booking Type selection tabs */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Booking Type *</label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#0F172A]/90 border border-white/10 rounded-full max-w-lg select-none">
              <button
                type="button"
                onClick={() => setBookingType('instant')}
                className={`py-2.5 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                  bookingType === 'instant' 
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-md shadow-indigo-500/20' 
                    : 'text-text-muted hover:text-white border border-transparent bg-transparent'
                }`}
              >
                <span className={`inline-block w-1.5 h-1.5 rounded-full bg-white transition-transform duration-300 ${bookingType === 'instant' ? 'scale-100' : 'scale-0'}`} />
                Instant Booking
              </button>
              <button
                type="button"
                onClick={() => setBookingType('pre-booking')}
                className={`py-2.5 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                  bookingType === 'pre-booking' 
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-md shadow-indigo-500/20' 
                    : 'text-text-muted hover:text-white border border-transparent bg-transparent'
                }`}
              >
                <span className={`inline-block w-1.5 h-1.5 rounded-full bg-white transition-transform duration-300 ${bookingType === 'pre-booking' ? 'scale-100' : 'scale-0'}`} />
                Pre-Booking (Schedule later)
              </button>
            </div>
          </div>

          {/* Date & Time fields if Pre-Booking */}
          {bookingType === 'pre-booking' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <div>
                <FormInput
                  label="Preferred Date"
                  icon={Calendar}
                  type="date"
                  name="scheduledDate"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Preferred Time Slot</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                    <Clock className="w-4 h-4" />
                  </span>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full border border-border-custom rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-card-bg/60 text-text-main cursor-pointer"
                    required
                  >
                    <option value="" className="bg-[#0F172A] text-white">Choose slot</option>
                    <option value="09:00 AM – 12:00 PM" className="bg-[#0F172A] text-white">Morning (9 AM - 12 PM)</option>
                    <option value="12:00 PM – 03:00 PM" className="bg-[#0F172A] text-white">Noon (12 PM - 3 PM)</option>
                    <option value="03:00 PM – 06:00 PM" className="bg-[#0F172A] text-white">Afternoon (3 PM - 6 PM)</option>
                    <option value="06:00 PM – 09:00 PM" className="bg-[#0F172A] text-white">Evening (6 PM - 9 PM)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Optional description */}
          <FormInput
            label="Optional Description (Describe the problem)"
            type="textarea"
            name="description"
            placeholder="e.g. Faucet is leaking from the joint. Need a washers replacement or complete valve fix."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <button
            type="submit"
            className="w-full py-3.5 mt-4 text-sm font-bold text-white btn-gradient rounded-xl shadow-xs text-center cursor-pointer"
          >
            Find Matching Specialists
          </button>
        </form>
      </div>
    </div>
  );
}
