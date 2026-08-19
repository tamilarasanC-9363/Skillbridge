import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateWorkerProfile, uploadWorkerFile } from '../../services/workerService';
import LoadingSpinner from '../../components/LoadingSpinner';
import FormInput from '../../components/FormInput';
import BackButton from '../../components/BackButton';
import { ShieldAlert, FileText, UserPlus, Image, Award, Check } from 'lucide-react';

const CATEGORIES = [
  'Plumbing', 'Electrical', 'Carpentry', 'Mason / Construction', 'Painting', 'Cleaning'
];

export default function WorkerProfileSetup() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [skillsText, setSkillsText] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('₹300 – ₹800');
  const [bio, setBio] = useState('');
  
  // Files
  const [profileFile, setProfileFile] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [certFile, setCertFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedCategories.length === 0) {
      setError('Please select at least one service category.');
      return;
    }
    if (!skillsText.trim()) {
      setError('Please fill in your specific skills.');
      return;
    }
    if (!experience.trim() || isNaN(experience) || parseInt(experience) < 0) {
      setError('Please enter a valid number for experience.');
      return;
    }
    if (!location.trim()) {
      setError('Please enter your service location.');
      return;
    }
    if (!bio.trim() || bio.length < 20) {
      setError('Bio must be at least 20 characters long.');
      return;
    }

    setLoading(true);
    try {
      let profileImageUrl = '';
      let idProofUrl = '';
      let certificateUrl = '';

      // Upload files sequentially
      if (profileFile) {
        profileImageUrl = await uploadWorkerFile(currentUser.uid, 'profile', profileFile);
      }
      if (idFile) {
        idProofUrl = await uploadWorkerFile(currentUser.uid, 'id_proof', idFile);
      }
      if (certFile) {
        certificateUrl = await uploadWorkerFile(currentUser.uid, 'certificate', certFile);
      }

      const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);

      // Save worker profile fields
      await updateWorkerProfile(currentUser.uid, {
        name: currentUser.displayName || currentUser.name || 'Worker Specialist',
        email: currentUser.email,
        phone: currentUser.phone || '',
        categories: selectedCategories,
        skills,
        experience: parseInt(experience),
        location,
        priceRange,
        bio,
        profileImageUrl,
        idProofUrl,
        certificateUrl,
        verified: false, // Wait for admin review
        availability: true,
        rating: 5.0,
        reviewCount: 0,
        completedJobs: 0
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/worker');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-6">
          <Check className="w-8 h-8 stroke-[3px]" />
        </div>
        <h1 className="text-2xl font-bold text-text-main">Profile Setup Complete!</h1>
        <p className="text-sm text-text-sub mt-2 leading-relaxed">
          Your credentials and proofs are submitted. The system administrator will review them shortly. You are being redirected to your dashboard.
        </p>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to="/worker" label="Back to Dashboard" className="mb-6" />

      <div className="bg-card-bg border border-border-custom rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6 border-b border-border-custom pb-5">
          <h1 className="text-xl font-bold text-text-main">Worker Profile Registration</h1>
          <p className="text-xs text-text-muted mt-1">Complete your professional registration. Admins will verify certificates to unlock your badge.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl p-3.5 text-xs font-semibold mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Categories select */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Select Your Categories * (Select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => handleCategoryToggle(cat)}
                    className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-primary border-primary text-white shadow-3xs' 
                        : 'border-border-custom text-text-sub hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific skills */}
          <FormInput
            label="Specific Skills (Comma separated)"
            type="text"
            name="skills"
            placeholder="e.g. Pipe Leakage Repair, Tap Repair, Water Tank Installation"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            required
          />

          {/* Experience & Location & Price range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Years of Experience"
              type="number"
              name="experience"
              placeholder="e.g. 5"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
            />

            <FormInput
              label="Service Location"
              type="text"
              name="location"
              placeholder="e.g. Chennai Central"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Price Range Estimate *</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full h-11 border border-border-custom rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary bg-card-bg/60 text-text-main cursor-pointer"
                required
              >
                <option value="₹300 – ₹800" className="bg-[#0F172A] text-white">₹300 – ₹800 (Plumbing/Cleaning)</option>
                <option value="₹400 – ₹1,000" className="bg-[#0F172A] text-white">₹400 – ₹1,000 (Electrical)</option>
                <option value="₹500 – ₹1,500" className="bg-[#0F172A] text-white">₹500 – ₹1,500 (Carpentry/Painting)</option>
                <option value="₹600 – ₹2,000" className="bg-[#0F172A] text-white">₹600 – ₹2,000 (Masonry)</option>
                <option value="₹1,000 – ₹3,000" className="bg-[#0F172A] text-white">₹1,000 – ₹3,000 (Bulk/Custom)</option>
              </select>
            </div>
          </div>

          {/* Short Bio */}
          <FormInput
            label="Short Bio (Introduce yourself)"
            type="textarea"
            name="bio"
            placeholder="e.g. Punctual, background-verified electrician with specialized training. Expert in switchboard repairs and troubleshooting."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            rows={3}
          />

          {/* File Uploads (ID proof & Certs) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-border-custom">
            {/* Profile pic */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <Image className="w-4 h-4 text-primary" />
                Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileFile(e.target.files[0])}
                className="w-full text-xs text-text-sub file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border border-border-custom file:border-0 file:text-xs file:font-bold file:bg-white/5 file:text-text-sub hover:file:bg-white/10 file:cursor-pointer"
              />
            </div>

            {/* ID Proof */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-4 h-4 text-primary" />
                Govt ID Proof
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setIdFile(e.target.files[0])}
                className="w-full text-xs text-text-sub file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border border-border-custom file:border-0 file:text-xs file:font-bold file:bg-white/5 file:text-text-sub hover:file:bg-white/10 file:cursor-pointer"
              />
            </div>

            {/* Certificate */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <Award className="w-4 h-4 text-primary" />
                Skill Certificate
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setCertFile(e.target.files[0])}
                className="w-full text-xs text-text-sub file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border border-border-custom file:border-0 file:text-xs file:font-bold file:bg-white/5 file:text-text-sub hover:file:bg-white/10 file:cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-6 text-sm font-bold text-white btn-gradient rounded-xl shadow-xs text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <LoadingSpinner size="sm" color="white" /> : (
              <>
                <UserPlus className="w-4 h-4" />
                Register Profile & Submit documents
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
