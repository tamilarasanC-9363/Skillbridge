import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FormInput from '../components/FormInput';
import { Mail, Lock, LogIn, User, Briefcase, ShieldCheck } from 'lucide-react';

const ROLE_PRESETS = {
  customer: {
    label: 'Customer',
    icon: User,
    email: 'customer@skillbridge.com',
    password: 'password123'
  },
  worker: {
    label: 'Worker',
    icon: Briefcase,
    email: 'worker@skillbridge.com',
    password: 'password123'
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    email: 'admin@skillbridge.com',
    password: 'password123'
  }
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedRole, setSelectedRole] = useState('customer');
  const [email, setEmail] = useState('customer@skillbridge.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const infoMessage = location.state?.message || '';

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setError('');
    setEmail(ROLE_PRESETS[roleKey].email);
    setPassword(ROLE_PRESETS[roleKey].password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'worker') {
        navigate('/worker');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      setError(err.message || 'Incorrect email or password. Please try again.');
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
        <h2 className="mt-4 text-2xl font-bold text-text-main">Sign in to your account</h2>
        <p className="mt-2 text-xs text-text-sub">
          Or{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-hover">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card-bg py-8 px-4 border border-border-custom shadow-xs sm:rounded-2xl sm:px-10">
          {infoMessage && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl p-3.5 text-xs font-medium mb-5">
              {infoMessage}
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3.5 text-xs font-medium mb-5">
              {error}
            </div>
          )}

          {/* Role Selection Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              Select Login Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/80 border border-white/10 rounded-xl select-none">
              {Object.entries(ROLE_PRESETS).map(([key, item]) => {
                const Icon = item.icon;
                const isSelected = selectedRole === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRoleSelect(key)}
                    className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white border-indigo-400/40 shadow-md shadow-indigo-500/25 scale-[1.02]'
                        : 'text-text-muted hover:text-white border-transparent bg-transparent hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Email Address"
              icon={Mail}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FormInput
              label="Password"
              icon={Lock}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-6 text-sm font-bold text-white btn-gradient rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 transition-all"
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In as {ROLE_PRESETS[selectedRole]?.label || 'User'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
