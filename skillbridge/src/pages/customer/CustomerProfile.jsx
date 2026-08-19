import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import LogoutModal from '../../components/LogoutModal';
import { User, Mail, Phone, Shield, LogOut } from 'lucide-react';
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
        <h1 className="text-2xl font-extrabold text-gray-900">Account Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your customer profile and account credentials.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-50 pb-5">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-primary text-xl font-bold">
            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{currentUser?.name}</h3>
            <span className="text-xs bg-blue-50 text-primary font-bold px-2 py-0.5 rounded-md capitalize">
              Role: {userRole}
            </span>
          </div>
        </div>

        {/* Profile details list */}
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</span>
              <span className="font-semibold text-gray-800">{currentUser?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone Number</span>
              <span className="font-semibold text-gray-800">{currentUser?.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Authentication Provider</span>
              <span className="font-semibold text-gray-800">Email & Password Credentials</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex gap-4">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 border border-rose-100 text-rose-600 font-bold text-xs rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out Account
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
