import { useState } from 'react';
import { submitBulkRequest } from '../services/bulkService';
import LoadingSpinner from './LoadingSpinner';
import FormInput from './FormInput';
import { Building, Users, Calendar, MapPin, AlignLeft, Check } from 'lucide-react';

const CATEGORIES = [
  'Plumbing', 'Electrical', 'Carpentry', 'Mason / Construction', 'Painting', 'Cleaning'
];

export default function BulkHireForm() {
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    numberOfWorkers: 1,
    requiredSkills: '',
    startDate: '',
    endDate: '',
    location: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.businessName || !formData.category || !formData.startDate || !formData.endDate || !formData.location) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const skillsArray = formData.requiredSkills 
        ? formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) 
        : [];
      
      await submitBulkRequest({
        businessName: formData.businessName,
        categories: [formData.category],
        numberOfWorkers: Number(formData.numberOfWorkers),
        requiredSkills: skillsArray,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        description: formData.description
      });

      setSuccess(true);
      setFormData({
        businessName: '',
        category: '',
        numberOfWorkers: 1,
        requiredSkills: '',
        startDate: '',
        endDate: '',
        location: '',
        description: ''
      });
    } catch (err) {
      setError('Bulk request submission failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-8 shadow-xs max-w-xl mx-auto text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 mb-6">
          <Check className="w-8 h-8 stroke-[3px]" />
        </div>
        <h3 className="text-xl font-bold text-[#283845] dark:text-white font-heading">Request Submitted Successfully</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
          Thank you! Our operations team is reviewing your requirements and will reach out to you within 24 hours with suitable worker matches.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-6 px-6 py-2.5 text-xs font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-xs cursor-pointer"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs max-w-xl mx-auto text-left animate-fade-in">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#283845] dark:text-white font-heading">Business / Bulk Hiring Portal</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Need multiple skilled workers for your workspace, retail center, or construction site? Let us handle the sourcing and vetting.</p>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-4 text-xs font-medium mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Business Name */}
        <FormInput
          label="Business / Corporate Name"
          icon={Building}
          type="text"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          placeholder="e.g. Apex Builders Inc."
          required
        />

        {/* Row 2: Category & Worker Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-1.5">Primary Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full h-11 border border-[#EBE5DE] dark:border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#FFA649] focus:ring-2 focus:ring-[#FFA649]/25 bg-stone-50/80 dark:bg-[#18222B] text-[#283845] dark:text-white cursor-pointer"
              required
            >
              <option value="" className="bg-white dark:bg-[#18222B] text-[#283845] dark:text-white">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-white dark:bg-[#18222B] text-[#283845] dark:text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <FormInput
            label="No. of Workers Needed"
            icon={Users}
            type="number"
            name="numberOfWorkers"
            value={formData.numberOfWorkers}
            onChange={handleChange}
            min="1"
            max="50"
            required
          />
        </div>

        {/* Required Skills */}
        <FormInput
          label="Required Skills (Comma separated)"
          type="text"
          name="requiredSkills"
          value={formData.requiredSkills}
          onChange={handleChange}
          placeholder="e.g. Concrete Work, Tile Installation, Wall Plastering"
        />

        {/* Job Location */}
        <FormInput
          label="Job Location"
          icon={MapPin}
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. Adyar Sector 2, Chennai"
          required
        />

        {/* Row 4: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Start Date"
            icon={Calendar}
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />

          <FormInput
            label="End Date"
            icon={Calendar}
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <FormInput
          label="Detailed Requirements Description"
          icon={AlignLeft}
          type="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detail work scope, shift timings, tools provided, etc..."
          rows={3}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 text-xs sm:text-sm font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? <LoadingSpinner size="sm" color="white" /> : 'Submit Bulk Request'}
        </button>
      </form>
    </div>
  );
}
