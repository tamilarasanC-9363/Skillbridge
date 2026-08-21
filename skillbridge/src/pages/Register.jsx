import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FormInput from '../components/FormInput';
import { User, Mail, Phone, Lock, UserPlus, Shield, ShieldCheck, Briefcase, UserCheck, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { withLoading } = useLoading();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleParam = searchParams.get('role');
  const initialRole = (roleParam === 'worker' || roleParam === 'customer') ? roleParam : 'customer';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPhoneError('');

    if (!name || !email || !phone || !password || !role) {
      setError('Please fill in all required fields.');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Enter a valid 10-digit mobile number.');
      setError('Please correct the validation errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      await withLoading(async () => {
        const registeredUser = await register(email, password, name, phone, role);
        const nextRole = registeredUser?.role || role;

        if (nextRole === 'worker') {
          navigate('/worker', { replace: true });
        } else {
          navigate('/customer', { replace: true });
        }
      }, {
        title: 'Almost there!',
        subtitle: 'Setting everything up for you…'
      });
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err?.message || 'Registration failed. Please try again.');
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
          Create an account
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Join the trusted network for on-demand home & commercial trade services.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-3.5 text-xs font-semibold mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                Select Registration Role
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-2xl select-none">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'customer' 
                      ? 'bg-white dark:bg-[#283845] text-[#283845] dark:text-[#FFA649] shadow-sm border border-[#EBE5DE] dark:border-white/15 font-extrabold' 
                      : 'text-stone-600 dark:text-stone-400 hover:text-[#283845] dark:hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'worker' 
                      ? 'bg-white dark:bg-[#283845] text-[#283845] dark:text-[#FFA649] shadow-sm border border-[#EBE5DE] dark:border-white/15 font-extrabold' 
                      : 'text-stone-600 dark:text-stone-400 hover:text-[#283845] dark:hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Skilled Pro</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/register')}
                  className="py-2.5 px-2 text-xs font-bold rounded-xl transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-stone-600 dark:text-stone-400 hover:text-[#283845] dark:hover:text-white"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
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
              placeholder="e.g. Rahul Sharma"
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
              placeholder="rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Phone */}
            <FormInput
              label="Mobile Number"
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
              label="Create Password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
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

            {/* Show Password Option */}
            <div className="flex items-center justify-between text-xs pt-1 select-none">
              <label className="flex items-center gap-2 text-stone-600 dark:text-stone-300 font-medium cursor-pointer hover:text-[#283845] dark:hover:text-white transition-colors">
                <input
                  type="checkbox"
                  id="register-show-password"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-4 h-4 rounded border-[#EBE5DE] dark:border-white/20 text-[#FFA649] focus:ring-[#FFA649] accent-[#FFA649] cursor-pointer"
                />
                <span>Show password</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-6 text-xs sm:text-sm font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create {role === 'worker' ? 'Worker' : 'Customer'} Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#EBE5DE] dark:border-white/10 text-center">
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Already have an account?{' '}
              <Link to="/login" className="font-extrabold text-[#283845] dark:text-[#FFA649] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
