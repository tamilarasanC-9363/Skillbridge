import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FormInput from '../components/FormInput';
import { Mail, Lock, LogIn, User, Briefcase, ShieldCheck, Shield, Eye, EyeOff } from 'lucide-react';
import { MOCK_WORKERS } from '../services/recommendationService';

const ROLE_PRESETS = {
  customer: {
    label: 'Customer',
    icon: User,
    email: 'customer@skillbridge.demo',
    password: 'password123',
    desc: 'Hire verified tradesmen'
  },
  worker: {
    label: 'Skilled Pro',
    icon: Briefcase,
    email: 'ramesh.kumar@skillbridge.demo',
    password: 'password123',
    desc: 'Accept local job contracts'
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    email: 'admin@skillbridge.demo',
    password: 'password123',
    desc: 'Manage verifications'
  }
};

export default function Login() {
  const { login } = useAuth();
  const { withLoading } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedRole, setSelectedRole] = useState('customer');
  const [email, setEmail] = useState('customer@skillbridge.demo');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const infoMessage = location.state?.message || '';

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setError('');
    setEmail(ROLE_PRESETS[roleKey].email);
    setPassword(ROLE_PRESETS[roleKey].password);
  };

  const handleWorkerPresetChange = (workerEmail) => {
    setEmail(workerEmail);
    setPassword('password123');
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
      await withLoading(async () => {
        const user = await login(email, password);
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'worker') {
          navigate('/worker');
        } else {
          navigate('/customer');
        }
      }, {
        title: 'Almost there!',
        subtitle: `Setting everything up for you…`
      });
    } catch (err) {
      setError(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in text-left">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#283845] via-[#384F60] to-[#FFA649] p-[1.5px] shadow-sm">
            <div className="w-full h-full bg-[#283845] rounded-[9px] flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-[#FFA649]" />
            </div>
          </div>
          <span className="text-2xl font-extrabold font-heading text-gradient">SkillBridge</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-[#283845] dark:text-white font-heading">
          Welcome back
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Select your portal role and sign in with your demo credentials.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          {infoMessage && (
            <div className="bg-[#FFA649]/15 border border-[#FFA649]/30 text-[#283845] dark:text-[#FFA649] rounded-xl p-3.5 text-xs font-bold mb-5">
              {infoMessage}
            </div>
          )}

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-3.5 text-xs font-semibold mb-5">
              {error}
            </div>
          )}

          {/* Quick Demo Role Selector */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
              Select Role Portal
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-2xl">
              {Object.entries(ROLE_PRESETS).map(([key, item]) => {
                const Icon = item.icon;
                const isSelected = selectedRole === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRoleSelect(key)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-[#283845] text-[#283845] dark:text-[#FFA649] shadow-sm border border-[#EBE5DE] dark:border-white/15 font-extrabold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-[#283845] dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demo Worker Switcher if Skilled Pro is selected */}
          {selectedRole === 'worker' && (
            <div className="mb-4 p-3 bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-2xl">
              <label className="block text-[10px] font-extrabold text-[#283845]/70 dark:text-[#FFA649] uppercase tracking-wider mb-1.5">
                Quick Switch Demo Worker:
              </label>
              <select
                value={email}
                onChange={(e) => handleWorkerPresetChange(e.target.value)}
                className="w-full text-xs font-bold bg-white dark:bg-[#18222B] border border-[#EBE5DE] dark:border-white/10 rounded-xl px-3 py-2 text-[#283845] dark:text-white focus:outline-none focus:border-[#FFA649]"
              >
                {MOCK_WORKERS.map((w) => (
                  <option key={w.userId} value={w.email}>
                    {w.name} ({w.categories?.[0] || 'Worker'}) — {w.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Email Address"
              icon={Mail}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="e.g. ramesh.kumar@skillbridge.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FormInput
              label="Password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="text-stone-400 hover:text-[#FFA649] transition-colors p-1 cursor-pointer focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            {/* Show Password Option & Forgot Password Link */}
            <div className="flex items-center justify-between text-xs pt-1 select-none">
              <label className="flex items-center gap-2 text-stone-600 dark:text-stone-300 font-medium cursor-pointer hover:text-[#283845] dark:hover:text-white transition-colors">
                <input
                  type="checkbox"
                  id="login-show-password"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-4 h-4 rounded border-[#EBE5DE] dark:border-white/20 text-[#FFA649] focus:ring-[#FFA649] accent-[#FFA649] cursor-pointer"
                />
                <span>Show password</span>
              </label>

              <Link
                to="/forgot-password"
                state={{ email }}
                className="font-semibold text-stone-500 dark:text-stone-400 hover:text-[#283845] dark:hover:text-[#FFA649] transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-6 text-xs sm:text-sm font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5px]" />
                  Sign In as {ROLE_PRESETS[selectedRole]?.label}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#EBE5DE] dark:border-white/10 text-center">
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Don't have an account yet?{' '}
              <Link 
                to={selectedRole === 'admin' ? '/admin/register' : selectedRole === 'worker' ? '/register?role=worker' : '/register?role=customer'} 
                className="font-extrabold text-[#283845] dark:text-[#FFA649] hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
