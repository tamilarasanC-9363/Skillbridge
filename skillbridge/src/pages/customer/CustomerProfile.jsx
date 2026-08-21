import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import LogoutModal from '../../components/LogoutModal';
import { Mail, Phone, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomerProfile() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      setShowLogoutModal(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in text-left">
      <BackButton to="/customer" label="Back to Dashboard" className="mb-6" />

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white font-heading">Account Profile</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Manage your customer credentials, contact info, and security.</p>
      </div>

      <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-[#EBE5DE] dark:border-white/10 pb-5">
          <div className="w-16 h-16 bg-[#FFA649]/20 border border-[#FFA649]/40 rounded-2xl flex items-center justify-center text-[#283845] dark:text-[#FFA649] text-xl font-extrabold font-heading shadow-inner">
            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#283845] dark:text-white font-heading">{currentUser?.name}</h3>
            <span className="inline-flex items-center gap-1 text-xs bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] font-extrabold px-2.5 py-0.5 rounded-lg border border-[#FFA649]/30 capitalize mt-1">
              <CheckCircle2 className="w-3 h-3 text-[#FFA649]" />
              Role: {userRole}
            </span>
          </div>
        </div>

        {/* Profile details list */}
        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="flex items-center gap-3.5 text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-[#11171E] p-3.5 rounded-2xl border border-[#EBE5DE] dark:border-white/10">
            <div className="p-2 rounded-xl bg-stone-200/60 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">Email Address</span>
              <span className="font-bold text-[#283845] dark:text-white">{currentUser?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-[#11171E] p-3.5 rounded-2xl border border-[#EBE5DE] dark:border-white/10">
            <div className="p-2 rounded-xl bg-stone-200/60 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">Mobile Number</span>
              <span className="font-bold text-[#283845] dark:text-white">{currentUser?.phone || '+91 98765 43210'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-[#11171E] p-3.5 rounded-2xl border border-[#EBE5DE] dark:border-white/10">
            <div className="p-2 rounded-xl bg-stone-200/60 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">Authentication Provider</span>
              <span className="font-bold text-[#283845] dark:text-white">Protected Credentials</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#EBE5DE] dark:border-white/10 flex gap-4">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Account
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        loading={logoutLoading}
      />
    </div>
  );
}
