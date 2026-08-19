import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import LogoutModal from './LogoutModal';
import { LogOut, User, Menu, X, ShieldAlert, Sun, Moon } from 'lucide-react';

function NavTab({ to, label, active }) {
  return (
    <Link 
      to={to} 
      className={`relative py-1 text-sm transition-all duration-200 select-none flex flex-col items-center group ${
        active 
          ? 'text-white font-bold' 
          : 'text-text-muted hover:text-white font-medium'
      }`}
    >
      <span>{label}</span>
      {active && (
        <span 
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-[2.5px] rounded-full transition-all duration-300 shadow-sm"
          style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
        />
      )}
    </Link>
  );
}

export default function Navbar() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [theme, setTheme] = useState(
    typeof window !== 'undefined' ? (document.documentElement.classList.contains('dark') ? 'dark' : 'light') : 'light'
  );

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sb_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sb_theme', 'light');
    }
  };

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

  const getDashboardLink = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'worker') return '/worker';
    return '/customer';
  };

  const isDashboardActive = () => {
    if (userRole === 'admin') return pathname === '/admin';
    if (userRole === 'worker') return pathname === '/worker';
    return pathname === '/customer';
  };

  return (
    <nav className="bg-white border-b border-gray-100 dark:bg-slate-900 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-col items-start select-none">
              <span className="text-xl font-bold tracking-tight text-gradient">SkillBridge</span>
              <span className="text-[10px] text-gray-400 font-medium -mt-1 hidden sm:block dark:text-slate-500">Bridging skills, building trust.</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {currentUser ? (
              <>
                <NavTab 
                  to={getDashboardLink()} 
                  label="Dashboard" 
                  active={isDashboardActive()} 
                />

                {userRole === 'customer' && (
                  <>
                    <NavTab 
                      to="/customer/search" 
                      label="Book Service" 
                      active={pathname === '/customer/search' || pathname === '/customer/workers' || pathname.startsWith('/customer/worker/')} 
                    />
                    <NavTab 
                      to="/customer/bookings" 
                      label="My Bookings" 
                      active={pathname === '/customer/bookings' || pathname.startsWith('/customer/booking/') || pathname.startsWith('/customer/chat/')} 
                    />
                    <NavTab 
                      to="/customer/bulk-hire" 
                      label="Bulk Hire" 
                      active={pathname === '/customer/bulk-hire'} 
                    />
                  </>
                )}

                {userRole === 'worker' && (
                  <>
                    <NavTab 
                      to="/worker/bookings" 
                      label="Jobs" 
                      active={pathname === '/worker/bookings' || pathname === '/worker/requests'} 
                    />
                    <NavTab 
                      to="/worker/earnings" 
                      label="Earnings" 
                      active={pathname === '/worker/earnings'} 
                    />
                    <NavTab 
                      to="/worker/profile" 
                      label="My Profile" 
                      active={pathname === '/worker/profile' || pathname === '/worker/profile/setup' || pathname === '/worker/availability'} 
                    />
                  </>
                )}

                {userRole === 'admin' && (
                  <>
                    <NavTab 
                      to="/admin/verification" 
                      label="Verifications" 
                      active={pathname === '/admin/verification'} 
                    />
                    <NavTab 
                      to="/admin/bookings" 
                      label="Bookings" 
                      active={pathname === '/admin/bookings'} 
                    />
                  </>
                )}

                <div className="h-6 w-px bg-gray-200 dark:bg-slate-800"></div>

                {/* Notifications & User Profile */}
                <NotificationBell />

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-500 hover:text-primary transition-colors duration-150 rounded-full hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-primary cursor-pointer animate-fade-in"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-900 dark:text-slate-100">{currentUser.name || 'User'}</div>
                    <div className="text-[10px] font-medium text-gray-400 capitalize">{userRole}</div>
                  </div>
                  
                  {/* Avatar / Profile Icon */}
                  <Link to={userRole === 'worker' ? '/worker/profile' : userRole === 'customer' ? '/customer/profile' : '/admin'}>
                    <img 
                      src={currentUser.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'U')}&background=2563EB&color=fff`} 
                      alt="avatar" 
                      className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-slate-850 hover:border-primary transition-colors"
                    />
                  </Link>

                  <button 
                    onClick={() => setShowLogoutModal(true)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary px-3 py-2 rounded-lg transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-bold text-white btn-gradient px-4 py-2 rounded-lg shadow-sm">
                  Register
                </Link>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-500 hover:text-primary transition-colors duration-150 rounded-full hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-primary cursor-pointer"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            {currentUser && <NotificationBell />}
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-primary transition-colors duration-150 rounded-full hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-primary cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 p-2 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-50 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {currentUser ? (
            <>
              <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800 flex items-center space-x-3 mb-2">
                <img 
                  src={currentUser.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'U')}&background=2563EB&color=fff`} 
                  alt="avatar" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{currentUser.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{userRole} Profile</div>
                </div>
              </div>

              <Link 
                to={getDashboardLink()} 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary"
              >
                Dashboard
              </Link>

              {userRole === 'customer' && (
                <>
                  <Link 
                    to="/customer/search" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary"
                  >
                    Book Service
                  </Link>
                  <Link 
                    to="/customer/bookings" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary"
                  >
                    My Bookings
                  </Link>
                  <Link 
                    to="/customer/bulk-hire" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    Bulk Hire
                  </Link>
                </>
              )}

              {userRole === 'worker' && (
                <>
                  <Link 
                    to="/worker/bookings" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary"
                  >
                    Jobs
                  </Link>
                  <Link 
                    to="/worker/earnings" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary"
                  >
                    Earnings
                  </Link>
                  <Link 
                    to="/worker/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary"
                  >
                    My Profile
                  </Link>
                </>
              )}

              {userRole === 'admin' && (
                <>
                  <Link 
                    to="/admin/verification" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary"
                  >
                    Verification Queue
                  </Link>
                  <Link 
                    to="/admin/bookings" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    All Bookings
                  </Link>
                </>
              )}

              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 mt-4 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 border border-gray-200 rounded-lg text-base font-semibold text-gray-700"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 btn-gradient rounded-lg text-base font-bold text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Reusable Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        loading={logoutLoading}
      />
    </nav>
  );
}
