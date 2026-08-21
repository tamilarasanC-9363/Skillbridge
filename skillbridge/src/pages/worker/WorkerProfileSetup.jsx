import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateWorkerProfile, uploadWorkerFile } from '../../services/workerService';
import { performAIVerification, PROOF_OF_WORK_TYPES } from '../../services/aiVerificationService';
import LoadingSpinner from '../../components/LoadingSpinner';
import FormInput from '../../components/FormInput';
import BackButton from '../../components/BackButton';
import AIVerificationCard from '../../components/AIVerificationCard';
import { Check, Camera, Wrench, PhoneCall } from 'lucide-react';

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
  
  // Work Verification Files & Metadata
  const [profileFile, setProfileFile] = useState(null);
  const [proofOfWorkFile, setProofOfWorkFile] = useState(null);
  const [proofOfWorkType, setProofOfWorkType] = useState('previous_work');
  const [proofDescription, setProofDescription] = useState('');
  
  // Local Reference (Optional)
  const [referenceName, setReferenceName] = useState('');
  const [referencePhone, setReferencePhone] = useState('');
  const [referenceRelation, setReferenceRelation] = useState('Previous Customer');

  // AI Verification State
  const [aiReport, setAiReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const workerName = currentUser?.displayName || currentUser?.name || 'Worker Specialist';

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const runQualityAudit = async (newProfileFile, newProofFile, newType, newDesc, newRef) => {
    const pFile = newProfileFile !== undefined ? newProfileFile : profileFile;
    const wFile = newProofFile !== undefined ? newProofFile : proofOfWorkFile;
    const pType = newType !== undefined ? newType : proofOfWorkType;
    const pDesc = newDesc !== undefined ? newDesc : proofDescription;
    const pRef = newRef !== undefined ? newRef : (referenceName && referencePhone ? { name: referenceName, phone: referencePhone, relation: referenceRelation } : null);

    if (pFile || wFile) {
      setIsAnalyzing(true);
      try {
        const report = await performAIVerification({
          workerName,
          categories: selectedCategories,
          profilePhoto: pFile,
          proofOfWorkFile: wFile,
          proofOfWorkType: pType,
          proofDescription: pDesc,
          localReference: pRef,
          currentUserId: currentUser?.uid
        });
        setAiReport(report);
      } catch (err) {
        console.error('Work verification audit error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleProfileFileChange = (file) => {
    setProfileFile(file);
    runQualityAudit(file, proofOfWorkFile, proofOfWorkType, proofDescription);
  };

  const handleProofFileChange = (file) => {
    setProofOfWorkFile(file);
    runQualityAudit(profileFile, file, proofOfWorkType, proofDescription);
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
    if (!profileFile) {
      setError('Please upload your Profile Photo (Required for worker identity).');
      return;
    }
    if (!proofOfWorkFile) {
      setError('Please upload Proof of Work (Photo/video of previous work, invoice, or setup).');
      return;
    }

    setLoading(true);
    try {
      let profileImageUrl = '';
      let proofOfWorkUrl = '';

      // Upload files
      if (profileFile) {
        profileImageUrl = await uploadWorkerFile(currentUser.uid, 'profile', profileFile);
      }
      if (proofOfWorkFile) {
        proofOfWorkUrl = await uploadWorkerFile(currentUser.uid, 'proof_of_work', proofOfWorkFile);
      }

      // Generate final AI Audit Report
      const localRefObj = (referenceName.trim() && referencePhone.trim()) ? {
        name: referenceName.trim(),
        phone: referencePhone.trim(),
        relation: referenceRelation
      } : null;

      let finalAIReport = aiReport;
      if (!finalAIReport) {
        finalAIReport = await performAIVerification({
          workerName,
          categories: selectedCategories,
          profilePhoto: profileImageUrl || profileFile,
          proofOfWorkFile: proofOfWorkUrl || proofOfWorkFile,
          proofOfWorkType,
          proofDescription,
          localReference: localRefObj,
          currentUserId: currentUser.uid
        });
      }

      const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);

      // Save worker profile fields
      await updateWorkerProfile(currentUser.uid, {
        name: workerName,
        email: currentUser.email,
        phone: currentUser.phone || '',
        categories: selectedCategories,
        skills,
        experience: parseInt(experience),
        location,
        priceRange,
        bio,
        profileImageUrl,
        proofOfWorkUrl,
        proofOfWorkType,
        proofDescription,
        localReference: localRefObj,
        aiAuditReport: finalAIReport,
        workVerificationStatus: 'Pending Admin Approval',
        verified: false, // Verified badge activates once approved by Admin and meeting Rating/Exp criteria
        rating: 0,
        reviewCount: 0,
        completedJobs: 0,
        availability: true
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/worker');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Failed to setup worker profile. Please try again.');
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
        <h1 className="text-2xl font-bold text-[#283845] dark:text-white font-heading">Work Verification Submitted!</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
          Your profile photo, proof of work, and trade details have been quality-audited and sent to Admin for review.
        </p>
        <div className="mt-4 flex justify-center">
          <LoadingSpinner size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to="/worker" label="Back to Dashboard" className="mb-6" />

      <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6 border-b border-[#EBE5DE] dark:border-white/10 pb-5">
          <h1 className="text-xl font-bold text-[#283845] dark:text-white font-heading">SkillBridge Work Verification</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Complete your trade registration with proof of your actual work. Submissions are quality-audited and reviewed by Admin.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-3.5 text-xs font-semibold mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Categories select */}
          <div>
            <label className="block text-[11px] font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-2">
              Select Your Trade Categories * (Select all that apply)
            </label>
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
                        ? 'bg-[#FFA649]/20 border-[#FFA649] text-[#283845] dark:text-[#FFA649] shadow-xs' 
                        : 'border-[#EBE5DE] dark:border-white/10 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5'
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
            label="Specific Skills (Comma separated) *"
            type="text"
            name="skills"
            placeholder="e.g. Pipe Leakage Repair, Tap Fitting, Water Tank Installation"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            required
          />

          {/* Experience & Location & Price range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Years of Experience *"
              type="number"
              name="experience"
              placeholder="e.g. 4"
              min="0"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
            />

            <FormInput
              label="Primary Service Location *"
              type="text"
              name="location"
              placeholder="e.g. T. Nagar, Chennai"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <FormInput
              label="Price Range / Visiting Charge"
              type="text"
              name="priceRange"
              placeholder="e.g. ₹300 – ₹800"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[11px] font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-2">
              Professional Work Bio * (Min. 20 characters)
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-[#EBE5DE] dark:border-white/10 bg-stone-50/50 dark:bg-stone-900/50 text-xs text-[#283845] dark:text-stone-100 focus:outline-none focus:border-[#FFA649] transition-colors"
              placeholder="Describe your hands-on expertise, tools you use, and commitment to quality service..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* ========================================================================= */}
          {/* SKILLBRIDGE WORK VERIFICATION SECTION */}
          {/* ========================================================================= */}
          <div className="border-t border-[#EBE5DE] dark:border-white/10 pt-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#283845] dark:text-white flex items-center gap-2 font-heading">
                <Wrench className="w-4.5 h-4.5 text-[#FFA649]" />
                SkillBridge Work Verification Uploads
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Upload your profile portrait, practical proof of work, and optional local customer reference.
              </p>
            </div>

            {/* 1. 📸 Profile Photo (Required) & 2. 🛠️ Proof of Work (Required) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Profile Photo */}
              <div className="p-4 border border-[#EBE5DE] dark:border-white/10 rounded-2xl bg-stone-50 dark:bg-[#11171E] space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#FFA649]" />
                  <label className="block text-[11px] font-extrabold text-[#283845] dark:text-stone-200 uppercase">
                    1. Profile Photo <span className="text-rose-500">*</span>
                  </label>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Upload a clear portrait photo showing your face.
                </p>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleProfileFileChange(e.target.files[0])}
                  className="w-full text-[11px] text-stone-600 dark:text-stone-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FFA649]/20 file:text-[#283845] dark:file:text-[#FFA649] cursor-pointer"
                  required
                />
              </div>

              {/* Proof of Work */}
              <div className="p-4 border border-[#EBE5DE] dark:border-white/10 rounded-2xl bg-stone-50 dark:bg-[#11171E] space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#FFA649]" />
                  <label className="block text-[11px] font-extrabold text-[#283845] dark:text-stone-200 uppercase">
                    2. Proof of Work <span className="text-rose-500">*</span>
                  </label>
                </div>

                {/* Proof Type Selector */}
                <select
                  value={proofOfWorkType}
                  onChange={(e) => {
                    setProofOfWorkType(e.target.value);
                    runQualityAudit(profileFile, proofOfWorkFile, e.target.value, proofDescription);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#EBE5DE] dark:border-white/10 bg-white dark:bg-[#1B2731] text-[11px] text-stone-700 dark:text-stone-200 focus:outline-none focus:border-[#FFA649]"
                >
                  {PROOF_OF_WORK_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>

                <input 
                  type="file" 
                  accept="image/*,video/*,.pdf"
                  onChange={(e) => handleProofFileChange(e.target.files[0])}
                  className="w-full text-[11px] text-stone-600 dark:text-stone-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FFA649]/20 file:text-[#283845] dark:file:text-[#FFA649] cursor-pointer"
                  required
                />

                <input 
                  type="text"
                  placeholder="Short work description (e.g. Bathroom pipeline fitting)"
                  value={proofDescription}
                  onChange={(e) => {
                    setProofDescription(e.target.value);
                    runQualityAudit(profileFile, proofOfWorkFile, proofOfWorkType, e.target.value);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#EBE5DE] dark:border-white/10 bg-white dark:bg-[#1B2731] text-[11px] text-[#283845] dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-[#FFA649]"
                />
              </div>
            </div>

            {/* 3. 🤝 Local Reference (Optional) */}
            <div className="p-4 border border-[#EBE5DE] dark:border-white/10 rounded-2xl bg-stone-50 dark:bg-[#11171E] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-[#FFA649]" />
                  <label className="block text-[11px] font-extrabold text-[#283845] dark:text-stone-200 uppercase">
                    3. Local Reference <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                </div>
                <span className="text-[10px] text-stone-400">Previous customer or contractor</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input 
                  type="text"
                  placeholder="Referee Name (e.g. S. Rajendran)"
                  value={referenceName}
                  onChange={(e) => setReferenceName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#EBE5DE] dark:border-white/10 bg-white dark:bg-[#1B2731] text-[11px] text-[#283845] dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-[#FFA649]"
                />
                <input 
                  type="tel"
                  placeholder="Referee Phone (e.g. 9840123456)"
                  value={referencePhone}
                  onChange={(e) => setReferencePhone(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#EBE5DE] dark:border-white/10 bg-white dark:bg-[#1B2731] text-[11px] text-[#283845] dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-[#FFA649]"
                />
                <select
                  value={referenceRelation}
                  onChange={(e) => setReferenceRelation(e.target.value)}
                  className="px-2.5 py-2 rounded-lg border border-[#EBE5DE] dark:border-white/10 bg-white dark:bg-[#1B2731] text-[11px] text-stone-700 dark:text-stone-200 focus:outline-none focus:border-[#FFA649]"
                >
                  <option value="Previous Customer">Previous Customer</option>
                  <option value="General Contractor">General Contractor</option>
                  <option value="Trade Master / Supervisor">Trade Master / Supervisor</option>
                  <option value="Hardware Shop Owner">Hardware Shop Owner</option>
                </select>
              </div>
            </div>

            {/* AI Automated Quality Audit Live Card */}
            {(isAnalyzing || aiReport) && (
              <AIVerificationCard 
                report={aiReport} 
                isAnalyzing={isAnalyzing} 
                className="mt-4 animate-fade-in"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-6 text-sm font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-xs text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <LoadingSpinner size="sm" color="white" /> : 'Submit for Admin Work Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}
