import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { Mail, Shield, ArrowLeft, CheckCircle, Send } from 'lucide-react';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { withLoading } = useLoading();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await withLoading(async () => {
        const res = await resetPassword(email);
        setSuccessMsg(res?.message || `A password reset link has been sent to ${email}.`);
      }, {
        title: 'Almost there!',
        subtitle: 'Setting everything up for you…'
      });
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(err?.message || 'Failed to send password reset email. Please check your email.');
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
          Reset Password
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl p-4 text-xs font-semibold mb-5 flex items-start gap-2.5">
              <span className="text-rose-500 font-bold text-base leading-none">⚠️</span>
              <div className="flex-1 leading-relaxed">
                {error}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 rounded-2xl p-4 sm:p-5 text-xs font-medium mb-5 space-y-2.5">
              <div className="flex items-center gap-2 font-extrabold text-emerald-700 dark:text-emerald-300 text-sm">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                <span>Password Reset Email Sent</span>
              </div>
              <p className="leading-relaxed text-xs text-stone-600 dark:text-stone-300">
                {successMsg}
              </p>
              <div className="pt-1 text-[11px] text-stone-500 dark:text-stone-400 border-t border-emerald-200/60 dark:border-emerald-800/40">
                Didn't receive it? Please check your <strong>Spam/Junk</strong> folder or wait a minute before requesting another link.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Registered Email Address"
              icon={Mail}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-6 text-xs sm:text-sm font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : (
                <>
                  <Send className="w-4 h-4" />
                  Send Password Reset Link
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#EBE5DE] dark:border-white/10 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#283845] dark:text-[#FFA649] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
