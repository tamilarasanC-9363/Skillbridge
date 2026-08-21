import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getWorkerProfile, updateWorkerProfile } from '../../services/workerService';
import { getReviewsForWorker } from '../../services/reviewService';
import { getBookingsForUser } from '../../services/bookingService';
import RatingStars from '../../components/RatingStars';
import VerifiedBadge from '../../components/VerifiedBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import FormInput from '../../components/FormInput';
import BackButton from '../../components/BackButton';
import AIVerificationCard from '../../components/AIVerificationCard';
import VerificationEligibilityCard from '../../components/VerificationEligibilityCard';
import { MapPin, CheckCircle, ShieldAlert, Calendar, Sparkles, Briefcase, User } from 'lucide-react';

const CATEGORIES = [
  'Plumbing', 'Electrical', 'Carpentry', 'Mason / Construction', 'Painting', 'Cleaning'
];

export default function WorkerProfileEdit() {
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit Form Fields
  const [editMode, setEditMode] = useState(false);
  const [categories, setCategories] = useState([]);
  const [skillsText, setSkillsText] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProfile = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const prof = await getWorkerProfile(currentUser.uid);
      setProfile(prof);
      
      if (prof) {
        setCategories(prof.categories || []);
        setSkillsText(prof.skills?.join(', ') || '');
        setExperience(prof.experience || '');
        setLocation(prof.location || '');
        setPriceRange(prof.priceRange || '₹300 – ₹1,000');
        setBio(prof.bio || '');
      }

      const revs = await getReviewsForWorker(currentUser.uid);
      setReviews(revs || []);

      const allBookings = await getBookingsForUser(currentUser.uid, 'worker');
      const completed = (allBookings || []).filter(b => b.status === 'Completed');
      setCompletedProjects(completed);
    } catch (err) {
      console.error(err);
      setError('Could not load profile.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleCategoryToggle = (category) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(c => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (categories.length === 0) {
      setError('Select at least one category.');
      return;
    }

    setSaving(true);
    try {
      const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      const updated = await updateWorkerProfile(currentUser.uid, {
        categories,
        skills,
        experience: Number(experience),
        location,
        priceRange,
        bio
      });

      setProfile(updated);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError('Failed to save profile details.');
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

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl p-4 text-xs font-semibold">
          Error: Worker profile details are not initialized.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to="/worker" label="Back to Dashboard" className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 shadow-xs text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#283845] to-[#1B2731] border-2 border-[#FFA649]/30 shadow-md flex flex-col items-center justify-center text-[#FFA649] mx-auto">
              <User className="w-10 h-10 mb-1" />
              <span className="text-xs font-extrabold tracking-wider uppercase font-mono">
                {profile.name?.slice(0, 2) || 'SP'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#283845] dark:text-white mt-4 flex items-center justify-center gap-1 font-heading">
              {profile.name}
            </h2>
            <div className="flex justify-center mt-1">
              <VerifiedBadge verified={profile.verified} worker={profile} />
            </div>

            <div className="mt-4 pt-4 border-t border-[#EBE5DE] dark:border-white/10 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-stone-50 dark:bg-[#11171E] p-2.5 rounded-xl border border-[#EBE5DE] dark:border-white/10">
                <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase">Jobs Done</span>
                <span className="font-bold text-[#283845] dark:text-white text-sm">{profile.completedJobs || 0}</span>
              </div>
              <div className="bg-stone-50 dark:bg-[#11171E] p-2.5 rounded-xl border border-[#EBE5DE] dark:border-white/10">
                <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase">Avg Rating</span>
                <span className="font-bold text-[#283845] dark:text-white text-sm flex items-center justify-center gap-0.5">
                  ★ {profile.rating > 0 ? profile.rating.toFixed(1) : '—'}
                </span>
              </div>
            </div>

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="w-full mt-6 py-2.5 btn-gradient text-[#11171E] font-extrabold text-xs rounded-xl shadow-xs cursor-pointer hover:brightness-110 transition-all"
              >
                Edit Profile Settings
              </button>
            )}
          </div>

          {/* 4-Criteria Verification Eligibility Card */}
          <VerificationEligibilityCard worker={profile} />

          {/* AI Audit Report Card / Verification indicator */}
          {profile.aiAuditReport ? (
            <AIVerificationCard report={profile.aiAuditReport} />
          ) : !profile.verified && (
            <div className="bg-[#FFA649]/15 border border-[#FFA649]/30 rounded-3xl p-5 text-xs text-[#283845] dark:text-[#FFA649] leading-relaxed flex gap-2.5">
              <ShieldAlert className="w-5 h-5 text-[#FFA649] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Awaiting Verification Badge:</span> Uploads are currently in review. Your matches will unlock as soon as approved by the administrator.
              </div>
            </div>
          )}
        </div>

        {/* Right Side: View or Edit Content */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-3.5 text-xs font-semibold mb-5">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl p-3.5 text-xs font-semibold mb-5">
              {success}
            </div>
          )}

          {editMode ? (
            <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-[#283845] dark:text-white mb-5 font-heading">Edit Profile Details</h3>
              <form onSubmit={handleSave} className="space-y-4">
                {/* Categories */}
                <div>
                  <label className="block text-[11px] font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-2">Service Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => {
                      const isSelected = categories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => handleCategoryToggle(cat)}
                          className={`px-3 py-1.5 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#FFA649]/20 border-[#FFA649] text-[#283845] dark:text-[#FFA649] shadow-xs font-bold' 
                              : 'border-[#EBE5DE] dark:border-white/10 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Skills */}
                <FormInput
                  label="Skills (Comma separated)"
                  type="text"
                  name="skills"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  required
                />

                {/* Experience & Location & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormInput
                    label="Experience (Yrs)"
                    type="number"
                    name="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                  <FormInput
                    label="Service Location"
                    type="text"
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                  <FormInput
                    label="Pricing Range"
                    type="text"
                    name="priceRange"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    required
                  />
                </div>

                {/* Bio */}
                <FormInput
                  label="Bio"
                  type="textarea"
                  name="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                  rows={3}
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 btn-gradient text-[#11171E] font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    {saving ? <LoadingSpinner size="sm" color="white" /> : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-5 py-2.5 border border-[#EBE5DE] dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 font-bold text-xs rounded-xl text-stone-600 dark:text-stone-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Details View */}
              <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#283845] dark:text-white border-b border-[#EBE5DE] dark:border-white/10 pb-3 font-heading">Capability Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider">Service Category</span>
                    <span className="font-semibold text-[#283845] dark:text-white">{profile.categories?.join(', ')}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider">Specific Skills</span>
                    <span className="font-semibold text-[#283845] dark:text-white">{profile.skills?.join(', ')}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider">Service Location</span>
                    <span className="font-semibold text-[#283845] dark:text-white flex items-center gap-0.5">
                      <MapPin className="w-4 h-4 text-[#FFA649]" />
                      {profile.location}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider">Pricing Estimates</span>
                    <span className="font-semibold text-[#283845] dark:text-white">{profile.priceRange}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider mb-1">Short Biography</span>
                  <p className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 p-3 rounded-xl leading-relaxed italic">
                    "{profile.bio}"
                  </p>
                </div>
              </div>

              {/* Completed Work Portfolio Section */}
              <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-[#283845] dark:text-white flex items-center gap-2 font-heading">
                      <Sparkles className="w-4.5 h-4.5 text-[#FFA649]" />
                      Verified Project Achievements ({completedProjects.length})
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Real verified project pictures and completed bookings on SkillBridge.</p>
                  </div>
                </div>

                {completedProjects.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-stone-50/70 dark:bg-[#11171E] rounded-2xl border border-dashed border-[#EBE5DE] dark:border-white/10 space-y-2">
                    <Briefcase className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
                    <h4 className="text-xs font-bold text-[#283845] dark:text-white">No Completed Projects Yet</h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                      Completed job tasks and verified client projects will automatically appear here once you finish service requests.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {completedProjects.map(item => {
                      const dateStr = item.completedAt || item.scheduledDate || item.createdAt;
                      const formattedDate = dateStr 
                        ? new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Recently Completed';

                      return (
                        <div 
                          key={item.bookingId} 
                          className="group bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 hover:border-[#FFA649]/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
                        >
                          {/* Image Header with Badge & Gradient */}
                          {item.workImageUrl || item.imageUrl ? (
                            <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-900">
                              <img 
                                src={item.workImageUrl || item.imageUrl} 
                                alt={item.jobType || 'Completed Project'} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                              
                              {item.category && (
                                <span className="absolute top-3 left-3 bg-[#283845]/90 text-[#FFA649] border border-[#FFA649]/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-sm">
                                  {item.category}
                                </span>
                              )}

                              <div className="absolute bottom-3 left-3 right-3 text-left pointer-events-none">
                                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 drop-shadow-sm">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Completed Project
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 bg-stone-100 dark:bg-[#18222B] border-b border-[#EBE5DE] dark:border-white/10 flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-[#FFA649] uppercase tracking-wider bg-[#FFA649]/10 px-2.5 py-1 rounded-md border border-[#FFA649]/20">
                                {item.category || 'Trade Service'}
                              </span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Verified Completed Job
                              </span>
                            </div>
                          )}

                          {/* Content Body */}
                          <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3 text-left">
                            <div className="space-y-1.5">
                              <h4 className="text-sm font-bold text-[#283845] dark:text-white leading-snug group-hover:text-[#FFA649] transition-colors">
                                {item.jobType || 'Service Completion'}
                              </h4>
                              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                                {item.description || 'Successfully completed service request according to customer requirements.'}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-[#EBE5DE] dark:border-white/10 flex flex-wrap items-center justify-between gap-y-1.5 text-[11px] text-stone-500 font-semibold">
                              <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                                <Calendar className="w-3.5 h-3.5 text-[#FFA649] flex-shrink-0" />
                                {formattedDate}
                              </span>
                              {item.location && (
                                <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                                  <MapPin className="w-3.5 h-3.5 text-[#FFA649] flex-shrink-0" />
                                  {item.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h3 className="text-base font-bold text-[#283845] dark:text-white mb-4 font-heading">Reviews & Client Testimonials ({reviews.length})</h3>
                {reviews.length === 0 ? (
                  <div className="text-center py-6 text-xs text-stone-400 font-medium">
                    No reviews yet. Completed bookings will display customer stars here.
                  </div>
                ) : (
                  <div className="divide-y divide-[#EBE5DE] dark:divide-white/10 space-y-4">
                    {reviews.map((rev, idx) => (
                      <div key={idx} className="pt-4 first:pt-0 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[#283845] dark:text-white">Verified Client</span>
                          <RatingStars rating={rev.rating} showNumber={false} />
                        </div>
                        <p className="text-stone-600 dark:text-stone-300 italic">"{rev.comment}"</p>
                        <span className="text-[10px] text-stone-400 block mt-1">
                          Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
