import { useState } from 'react';
import { submitBulkRequest } from '../services/bulkService';
import LoadingSpinner from './LoadingSpinner';
import FormInput from './FormInput';
import { Building, Users, Calendar, MapPin, AlignLeft, Phone, Mail, User, Clock, FileText } from 'lucide-react';

const CATEGORIES = [
  'Plumbing', 'Electrical', 'Carpentry', 'Mason / Construction', 'Painting', 'Cleaning'
];

export default function BulkHireForm() {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    category: '',
    workersRequired: 5,
    requiredSkills: '',
    jobLocation: '',
    startDate: '',
    endDate: '',
    additionalRequirements: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.organizationName || !formData.contactPerson || !formData.contactPhone || !formData.category || !formData.startDate || !formData.endDate || !formData.jobLocation) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    setLoading(true);
    try {
      const skillsArray = formData.requiredSkills 
        ? formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) 
        : [];
      
      const created = await submitBulkRequest({
        organizationName: formData.organizationName,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        category: formData.category,
        workersRequired: Number(formData.workersRequired),
        requiredSkills: skillsArray,
        jobLocation: formData.jobLocation,
        startDate: formData.startDate,
        endDate: formData.endDate,
        additionalRequirements: formData.additionalRequirements
      });

      setSubmittedRequest(created);
      setFormData({
        organizationName: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        category: '',
        workersRequired: 5,
        requiredSkills: '',
        jobLocation: '',
        startDate: '',
        endDate: '',
        additionalRequirements: ''
      });
    } catch (err) {
      setError('Bulk request submission failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submittedRequest) {
    return (
      <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-8 shadow-xs max-w-xl mx-auto text-center animate-fade-in space-y-5">
        <div className="w-16 h-16 bg-[#FFA649]/15 border border-[#FFA649]/30 rounded-2xl flex items-center justify-center mx-auto text-[#FFA649]">
          <Clock className="w-8 h-8" />
        </div>
        
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] border border-[#FFA649]/30 mb-2">
            Status: {submittedRequest.status || 'Pending Review'}
          </span>
          <h3 className="text-xl font-bold text-[#283845] dark:text-white font-heading">
            Request Submitted – Pending Review
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
            Your bulk hiring request has been registered in our database. Our operations manager will verify worker availability and assign verified personnel to your project.
          </p>
        </div>

        <div className="bg-stone-50 dark:bg-[#11171E] p-4 rounded-2xl border border-[#EBE5DE] dark:border-white/10 text-left text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Request Reference ID:</span>
            <span className="font-mono font-bold text-[#283845] dark:text-[#FFA649]">{submittedRequest.requestId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Organization:</span>
            <span className="font-semibold text-[#283845] dark:text-white">{submittedRequest.organizationName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Trade Category:</span>
            <span className="font-semibold text-[#283845] dark:text-white">{submittedRequest.category}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Workers Requested:</span>
            <span className="font-semibold text-[#283845] dark:text-white">{submittedRequest.workersRequired} personnel</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Job Site Location:</span>
            <span className="font-semibold text-[#283845] dark:text-white">{submittedRequest.jobLocation}</span>
          </div>
        </div>

        <p className="text-[11px] text-stone-400 italic">
          * Note: Booking is not confirmed immediately. Confirmation and assignment occur upon admin verification.
        </p>

        <button 
          onClick={() => setSubmittedRequest(null)}
          className="px-6 py-2.5 text-xs font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-xs cursor-pointer"
        >
          Submit Another Bulk Request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs max-w-xl mx-auto text-left animate-fade-in">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#283845] dark:text-white font-heading">Corporate & Bulk Staffing Portal</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Need a vetted team of skilled workers for commercial projects, renovations, or events? Submit your staffing specifications below.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-4 text-xs font-medium mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Organization Name */}
        <FormInput
          label="Organization / Company Name *"
          icon={Building}
          type="text"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleChange}
          placeholder="e.g. Sobha Constructions / L&T Tech Park"
          required
        />

        {/* Contact Person & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Contact Person Name *"
            icon={User}
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="e.g. Senthil Kumar"
            required
          />

          <FormInput
            label="Contact Phone Number *"
            icon={Phone}
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="e.g. 9842104512"
            required
          />
        </div>

        {/* Contact Email */}
        <FormInput
          label="Contact Email"
          icon={Mail}
          type="email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          placeholder="e.g. operations@company.com"
        />

        {/* Category & Worker Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-1.5">
              Service Category *
            </label>
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
            label="Workers Required *"
            icon={Users}
            type="number"
            name="workersRequired"
            value={formData.workersRequired}
            onChange={handleChange}
            min="1"
            max="100"
            required
          />
        </div>

        {/* Required Skills */}
        <FormInput
          label="Required Skills (Comma separated)"
          icon={FileText}
          type="text"
          name="requiredSkills"
          value={formData.requiredSkills}
          onChange={handleChange}
          placeholder="e.g. Brick Wall Construction, Tile Installation, Plastering"
        />

        {/* Job Location */}
        <FormInput
          label="Job Site Location *"
          icon={MapPin}
          type="text"
          name="jobLocation"
          value={formData.jobLocation}
          onChange={handleChange}
          placeholder="e.g. Peelamedu, Coimbatore"
          required
        />

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Project Start Date *"
            icon={Calendar}
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Project End Date *"
            icon={Calendar}
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description / Additional Requirements */}
        <FormInput
          label="Additional Requirements & Work Scope"
          icon={AlignLeft}
          type="textarea"
          name="additionalRequirements"
          value={formData.additionalRequirements}
          onChange={handleChange}
          placeholder="Shift details, site safety provisions, tooling requirements..."
          rows={3}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 text-xs sm:text-sm font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? <LoadingSpinner size="sm" color="white" /> : 'Submit Bulk Request (Pending Review)'}
        </button>
      </form>
    </div>
  );
}
