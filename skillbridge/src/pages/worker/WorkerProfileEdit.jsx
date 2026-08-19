import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getWorkerProfile, updateWorkerProfile } from '../../services/workerService';
import { getReviewsForWorker } from '../../services/reviewService';
import RatingStars from '../../components/RatingStars';
import VerifiedBadge from '../../components/VerifiedBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import FormInput from '../../components/FormInput';
import BackButton from '../../components/BackButton';
import { User, Award, MapPin, CheckCircle, ShieldAlert, Calendar, Sparkles, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'Plumbing', 'Electrical', 'Carpentry', 'Mason / Construction', 'Painting', 'Cleaning'
];

export const WORKER_ACHIEVEMENTS = [
  {
    id: 1,
    title: 'Modern Kitchen & Living Room Repaint',
    category: 'Painting',
    description: 'Complete interior repaint of open-plan kitchen and living room using premium matte enamel finish. Finished 2 days ahead of schedule with spotless trim detailing.',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    completedDate: '12 May 2026',
    location: 'Anna Nagar, Chennai',
  },
  {
    id: 2,
    title: 'Bathroom Pipeline Replacement',
    category: 'Plumbing',
    description: 'Replaced corroded multi-branch CPVC supply lines and resolved persistent low-pressure leaks across two master bathrooms with hydro-static pressure testing.',
    imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    completedDate: '21 Mar 2026',
    location: 'Adyar, Chennai',
  },
  {
    id: 3,
    title: 'Office Floor Rewiring & Ceiling Fans',
    category: 'Electrical',
    description: 'Installed 6 high-efficiency ceiling fans and executed complete circuit rewiring with safety MCB panel distribution for an entire commercial floor.',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    completedDate: '8 Jan 2026',
    location: 'T. Nagar, Chennai',
  },
  {
    id: 4,
    title: 'Residential Pipe Installation',
    category: 'Plumbing',
    description: 'Executed complete cold and hot water plumbing line routing with concealed copper fittings for a newly constructed 3-bedroom villa.',
    imageUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80',
    completedDate: '18 Apr 2026',
    location: 'Velachery, Chennai',
  },
  {
    id: 5,
    title: 'Main Door & Custom Cabinet Repair',
    category: 'Carpentry',
    description: 'Repaired warped teakwood main entrance doorway, replaced hydraulic soft-close hinges, and refinished kitchen pantry cabinetry with waterproof laminate.',
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    completedDate: '29 Feb 2026',
    location: 'Nungambakkam, Chennai',
  },
  {
    id: 6,
    title: 'Complete House Exterior Painting',
    category: 'Painting',
    description: 'Weatherproof exterior wall coating, pressure wash, primer application, and dual-layer acrylic emulsion application for a two-story residential residence.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    completedDate: '15 Jun 2026',
    location: 'OMR, Chennai',
  },
];

export default function WorkerProfileEdit() {
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
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

  const loadProfile = async () => {
    setLoading(true);
    try {
      const prof = await getWorkerProfile(currentUser.uid);
      setProfile(prof);
      
      if (prof) {
        setCategories(prof.categories || []);
        setSkillsText(prof.skills?.join(', ') || '');
        setExperience(prof.experience || '');
        setLocation(prof.location || '');
        setPriceRange(prof.priceRange || '');
        setBio(prof.bio || '');

        const workerReviews = await getReviewsForWorker(currentUser.uid);
        setReviews(workerReviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const handleCategoryToggle = (cat) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (categories.length === 0) {
      setError('Please select at least one category.');
      return;
    }

    setSaving(true);
    try {
      const skillsArray = skillsText 
        ? skillsText.split(',').map(s => s.trim()).filter(Boolean) 
        : [];

      const updated = await updateWorkerProfile(currentUser.uid, {
        categories,
        skills: skillsArray,
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
        <div className="bg-rose-50 text-rose-600 rounded-xl p-4 text-xs font-semibold">
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
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs text-center">
            <img 
              src={profile.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=2563EB&color=fff`} 
              alt={profile.name} 
              className="w-24 h-24 rounded-full object-cover mx-auto shadow-inner border"
            />
            <h2 className="text-xl font-bold text-gray-900 mt-4 flex items-center justify-center gap-1">
              {profile.name}
            </h2>
            <div className="flex justify-center mt-1">
              <VerifiedBadge verified={profile.verified} />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-gray-50 p-2.5 rounded-xl">
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Jobs Done</span>
                <span className="font-bold text-gray-800 text-sm">{profile.completedJobs || 0}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl">
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Avg Rating</span>
                <span className="font-bold text-gray-800 text-sm flex items-center justify-center gap-0.5">
                  ★ {profile.rating > 0 ? profile.rating.toFixed(1) : '—'}
                </span>
              </div>
            </div>

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="w-full mt-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer hover:brightness-110 transition-all"
              >
                Edit Profile Settings
              </button>
            )}
          </div>

          {/* Verification indicator */}
          {!profile.verified && (
            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 text-xs text-amber-800 leading-relaxed flex gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Awaiting Verification Badge:</span> Uploads are currently in review. Your matches will unlock as soon as approved.
              </div>
            </div>
          )}
        </div>

        {/* Right Side: View or Edit Content */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-3.5 text-xs font-semibold mb-5">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl p-3.5 text-xs font-semibold mb-5">
              {success}
            </div>
          )}

          {editMode ? (
            <div className="bg-card-bg border border-border-custom rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-text-main mb-5">Edit Profile Details</h3>
              <form onSubmit={handleSave} className="space-y-4">
                {/* Categories */}
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Service Categories</label>
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
                    className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    {saving ? <LoadingSpinner size="sm" color="white" /> : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-5 py-2.5 border border-border-custom hover:bg-white/5 font-bold text-xs rounded-xl text-text-sub cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Details View */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-55 pb-3">Capability Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Service Category</span>
                    <span className="font-semibold text-gray-800">{profile.categories?.join(', ')}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Specific Skills</span>
                    <span className="font-semibold text-gray-800">{profile.skills?.join(', ')}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Service Location</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-0.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {profile.location}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pricing Estimates</span>
                    <span className="font-semibold text-gray-800">{profile.priceRange}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Short Biography</span>
                  <p className="text-xs text-gray-600 bg-gray-50 border p-3 rounded-xl leading-relaxed italic">
                    "{profile.bio}"
                  </p>
                </div>
              </div>

              {/* Achievements Section */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-primary" />
                      Verified Project Achievements ({WORKER_ACHIEVEMENTS.length})
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Showcase of realistic completed job sites and verified craft accomplishments.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {WORKER_ACHIEVEMENTS.map(item => (
                    <div 
                      key={item.id} 
                      className="group bg-gray-50 border border-gray-100 hover:border-primary/40 rounded-2xl overflow-hidden shadow-3xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
                    >
                      {/* Image Header with Badge & Gradient */}
                      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-900">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                        
                        {item.category && (
                          <span className="absolute top-3 left-3 bg-slate-900/90 text-primary border border-primary/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-sm">
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

                      {/* Content Body */}
                      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3 text-left">
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-y-1.5 text-[11px] text-gray-500 font-semibold">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            {item.completedDate}
                          </span>
                          {item.location && (
                            <span className="flex items-center gap-1 text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              {item.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h3 className="text-base font-bold text-gray-900 mb-4">Reviews & Client Testimonials ({reviews.length})</h3>
                {reviews.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400">
                    No reviews yet. Completed bookings will display customer stars here.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 space-y-4">
                    {reviews.map((rev, idx) => (
                      <div key={idx} className="pt-4 first:pt-0 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-800">Verified Client</span>
                          <RatingStars rating={rev.rating} showNumber={false} />
                        </div>
                        <p className="text-gray-600 italic">"{rev.comment}"</p>
                        <span className="text-[10px] text-gray-400 block mt-1">
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
