import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FormInput from '../components/FormInput';
import { User, Mail, Phone, Lock, UserPlus } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Extract role from search queries (e.g. /register?role=worker)
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'worker' || roleParam === 'customer') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPhoneError('');

    if (!name || !email || !phone || !password || !role) {
      setError('Please fill in all required fields.');
      return;
    }

    // Indian Phone format validation (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Enter a valid 10-digit mobile number.');
      setError('Please correct the validation errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name, phone, role);
      if (role === 'worker') {
        navigate('/worker/profile/setup');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in text-left">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block">
          <span className="text-3xl font-extrabold tracking-tight text-gradient">SkillBridge</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-text-main">Create your new account</h2>
        <p className="mt-2 text-xs text-text-sub font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-hover">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card-bg py-8 px-4 border border-border-custom shadow-xs sm:rounded-2xl sm:px-10">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3.5 text-xs font-medium mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Select User Account Type</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 border border-white/10 rounded-xl select-none">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer border ${
                    role === 'customer' 
                      ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white border-indigo-400/40 shadow-md shadow-indigo-500/25 scale-[1.02]' 
                      : 'text-text-muted hover:text-white border-transparent bg-transparent hover:bg-white/5'
                  }`}
                >
                  Customer (Hire Help)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer border ${
                    role === 'worker' 
                      ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white border-indigo-400/40 shadow-md shadow-indigo-500/25 scale-[1.02]' 
                      : 'text-text-muted hover:text-white border-transparent bg-transparent hover:bg-white/5'
                  }`}
                >
                  Skilled Worker (Find Jobs)
                </button>
              </div>
            </div>

            {/* Name */}
            <FormInput
              label="Full Name"
              icon={User}
              type="text"
              name="name"
              autoComplete="name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {/* Email */}
            <FormInput
              label="Email Address"
              icon={Mail}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Phone */}
            <FormInput
              label="Phone Number"
              icon={Phone}
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="numeric"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError('');
              }}
              error={phoneError}
              required
            />

            {/* Password */}
            <FormInput
              label="Password"
              icon={Lock}
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-6 text-sm font-bold text-white btn-gradient rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
