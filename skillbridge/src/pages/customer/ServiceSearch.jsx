import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PriceEstimate from '../../components/PriceEstimate';
import BackButton from '../../components/BackButton';
import { MapPin, Calendar, Clock, Zap, CalendarDays } from 'lucide-react';
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

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setSelectedJob('');
  };

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

      <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6 border-b border-[#EBE5DE] dark:border-white/10 pb-5">
          <h1 className="text-xl font-bold text-[#283845] dark:text-white font-heading">Define Service Requirements</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Specify your exact job needs so our recommendation system can find the best local matching specialist.</p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-3.5 text-xs font-medium mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-1.5">Service Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full h-11 border border-[#EBE5DE] dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#FFA649] focus:ring-2 focus:ring-[#FFA649]/25 bg-stone-50/80 dark:bg-[#18222B] text-[#283845] dark:text-white cursor-pointer"
            >
              {Object.keys(CATEGORY_JOBS).map(cat => (
                <option key={cat} value={cat} className="bg-white dark:bg-[#18222B] text-[#283845] dark:text-white">{cat}</option>
              ))}
            </select>
          </div>

          {/* Job Selection Grid */}
          <div>
            <label className="block text-[11px] font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-2">Select Specific Job Type *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {jobsList.map(job => (
                <button
                  type="button"
                  key={job}
                  onClick={() => setSelectedJob(job)}
                  className={`px-4 py-3 border rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    selectedJob === job 
                      ? 'bg-[#FFA649]/20 border-[#FFA649] text-[#283845] dark:text-[#FFA649] shadow-sm font-extrabold' 
                      : 'border-[#EBE5DE] dark:border-white/10 text-stone-700 dark:text-stone-300 bg-stone-50/50 dark:bg-[#18222B]/60 hover:bg-stone-100 dark:hover:bg-[#18222B]'
                  }`}
                >
                  {job}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Estimation preview */}
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
            <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-1.5 font-medium">Try entering "Chennai Central" or "Adyar" to test location proximity scores!</div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-[11px] font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-2">Urgency Level</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-xs text-[#283845] dark:text-stone-300 cursor-pointer font-semibold">
                <input 
                  type="radio" 
                  name="urgency" 
                  value="normal" 
                  checked={urgency === 'normal'} 
                  onChange={() => setUrgency('normal')}
                  className="text-[#FFA649] focus:ring-[#FFA649] w-4 h-4 cursor-pointer accent-[#FFA649]"
                />
                Normal (Regular schedule)
              </label>
              <label className="flex items-center gap-2 text-xs text-[#283845] dark:text-stone-300 cursor-pointer font-semibold">
                <input 
                  type="radio" 
                  name="urgency" 
                  value="urgent" 
                  checked={urgency === 'urgent'} 
                  onChange={() => setUrgency('urgent')}
                  className="text-[#FFA649] focus:ring-[#FFA649] w-4 h-4 cursor-pointer accent-[#FFA649]"
                />
                Urgent (Immediate assistance required)
              </label>
            </div>
          </div>

          {/* Booking Type selection tabs */}
          <div>
            <label className="block text-[11px] font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-2">Booking Type *</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-2xl max-w-lg select-none">
              <button
                type="button"
                onClick={() => setBookingType('instant')}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  bookingType === 'instant' 
                    ? 'bg-white dark:bg-[#283845] text-[#283845] dark:text-[#FFA649] shadow-sm font-extrabold border border-[#EBE5DE] dark:border-white/15' 
                    : 'text-stone-600 dark:text-stone-400 hover:text-[#283845] dark:hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Dispatch (ASAP)</span>
              </button>

              <button
                type="button"
                onClick={() => setBookingType('pre-booking')}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  bookingType === 'pre-booking' 
                    ? 'bg-white dark:bg-[#283845] text-[#283845] dark:text-[#FFA649] shadow-sm font-extrabold border border-[#EBE5DE] dark:border-white/15' 
                    : 'text-stone-600 dark:text-stone-400 hover:text-[#283845] dark:hover:text-white'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Schedule Later</span>
              </button>
            </div>
          </div>

          {/* Schedule fields if pre-booking is selected */}
          {bookingType === 'pre-booking' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 animate-fade-in">
              <FormInput
                label="Preferred Service Date"
                icon={Calendar}
                type="date"
                name="scheduledDate"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />

              <FormInput
                label="Preferred Time Slot"
                icon={Clock}
                type="time"
                name="scheduledTime"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>
          )}

          {/* Optional details textarea */}
          <div>
            <FormInput
              label="Job Notes / Problem Details (Optional)"
              type="textarea"
              name="description"
              placeholder="Tell the worker specifics about the issue (e.g. 2nd floor bathroom, pipe broken behind sink)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 mt-4 text-xs sm:text-sm font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            Find Recommended Pros
          </button>
        </form>
      </div>
    </div>
  );
}
