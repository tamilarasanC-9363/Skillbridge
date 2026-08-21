import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import LogoutModal from './LogoutModal';
import { LogOut, Menu, X, Shield, ChevronRight } from 'lucide-react';

function NavTab({ to, label, active }) {
  return (
    <Link 
      to={to} 
      className={`relative px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all duration-200 select-none flex items-center gap-1.5 ${
        active 
          ? 'text-[#FFA649] bg-[#FFA649]/15 font-bold shadow-xs' 
          : 'text-stone-600 dark:text-stone-300 hover:text-[#283845] dark:hover:text-[#FFA649] hover:bg-stone-100/80 dark:hover:bg-stone-800/60'
      }`}
    >
      <span>{label}</span>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#FFA649]"></span>
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
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#11171E]/90 backdrop-blur-xl border-b border-[#EBE5DE] dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo - Deep Slate Ink & Marigold */}
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#283845] via-[#384F60] to-[#FFA649] p-[1.5px] shadow-md shadow-[#FFA649]/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#283845] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#FFA649] stroke-[2.3px]" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-extrabold tracking-tight font-heading text-gradient leading-none">
                SkillBridge
              </span>
              <span className="text-[10px] font-semibold text-[#283845] dark:text-[#FFA649]/80 tracking-wide mt-0.5 hidden sm:block">
                VERIFIED SKILLS NETWORK
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-2">
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
                      label="My Jobs" 
                      active={pathname === '/worker/bookings' || pathname === '/worker/requests'} 
                    />
                    <NavTab 
                      to="/worker/earnings" 
                      label="Earnings" 
                      active={pathname === '/worker/earnings'} 
                    />
                    <NavTab 
                      to="/worker/availability" 
                      label="Schedule" 
                      active={pathname === '/worker/availability'} 
                    />
                  </>
                )}

                {userRole === 'admin' && (
                  <>
                    <NavTab 
                      to="/admin/verification" 
                      label="Auditing Queue" 
                      active={pathname === '/admin/verification'} 
                    />
                    <NavTab 
                      to="/admin/bookings" 
                      label="Bookings" 
                      active={pathname === '/admin/bookings'} 
                    />
                    <NavTab 
                      to="/admin/reports" 
                      label="Reports" 
                      active={pathname === '/admin/reports'} 
                    />
                  </>
                )}

                <div className="h-5 w-px bg-[#EBE5DE] dark:bg-white/10 mx-1"></div>

                {/* Notifications */}
                <NotificationBell />

                {/* User Profile Pill */}
                <div className="flex items-center pl-1">
                  <Link 
                    to={userRole === 'worker' ? '/worker/profile' : userRole === 'customer' ? '/customer/profile' : '/admin'}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-[#EBE5DE] dark:border-white/10 hover:border-[#FFA649]/60 dark:hover:border-[#FFA649]/60 bg-stone-50/80 dark:bg-stone-900/60 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#283845] border border-[#FFA649]/40 flex items-center justify-center text-[#FFA649] text-[10px] font-extrabold font-mono flex-shrink-0">
                      {currentUser.name?.slice(0, 2)?.toUpperCase() || 'U'}
                    </div>
                    <div className="text-left leading-tight hidden lg:block">
                      <div className="text-xs font-bold text-[#283845] dark:text-stone-100 group-hover:text-[#FFA649] transition-colors truncate max-w-[100px]">
                        {currentUser.name?.split(' ')[0] || 'User'}
                      </div>
                      <div className="text-[10px] font-extrabold text-[#FFA649] capitalize">
                        {userRole}
                      </div>
                    </div>
                  </Link>

                  <button 
                    onClick={() => setShowLogoutModal(true)}
                    className="ml-2 p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-xs font-bold text-[#283845] dark:text-stone-200 hover:text-[#FFA649] px-3.5 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
                >
                  Sign In
                </Link>

                <Link 
                  to="/register" 
                  className="text-xs font-extrabold text-[#11171E] btn-gradient px-4 py-2 rounded-xl shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Hamburger & Quick Actions */}
          <div className="flex md:hidden items-center space-x-2">
            {currentUser && <NotificationBell />}

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#18222B]/95 backdrop-blur-2xl border-t border-[#EBE5DE] dark:border-white/10 px-4 pt-3 pb-6 space-y-2 animate-fade-in text-left">
          {currentUser ? (
            <>
              <div className="p-3 bg-stone-50 dark:bg-stone-900/80 rounded-2xl border border-[#EBE5DE] dark:border-white/10 flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#283845] border border-[#FFA649]/40 flex items-center justify-center text-[#FFA649] text-xs font-extrabold font-mono flex-shrink-0">
                    {currentUser.name?.slice(0, 2)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-900 dark:text-white">{currentUser.name}</div>
                    <div className="text-[11px] font-bold text-[#FFA649] capitalize">{userRole} Account</div>
                  </div>
                </div>
                <Link 
                  to={userRole === 'worker' ? '/worker/profile' : userRole === 'customer' ? '/customer/profile' : '/admin'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-stone-400 hover:text-[#FFA649] rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-1">
                <Link 
                  to={getDashboardLink()} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80"
                >
                  Dashboard Overview
                </Link>

                {userRole === 'customer' && (
                  <>
                    <Link 
                      to="/customer/search" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80"
                    >
                      Book a Skilled Worker
                    </Link>
                    <Link 
                      to="/customer/bookings" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80"
                    >
                      My Bookings & History
                    </Link>
                    <Link 
                      to="/customer/bulk-hire" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80"
                    >
                      Bulk Crew Hiring
                    </Link>
                  </>
                )}

                {userRole === 'worker' && (
                  <>
                    <Link 
                      to="/worker/bookings" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80"
                    >
                      Job Requests & Tasks
                    </Link>
                    <Link 
                      to="/worker/earnings" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80"
                    >
                      My Earnings & Payouts
                    </Link>
                    <Link 
                      to="/worker/availability" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80"
                    >
                      Working Hours & Availability
                    </Link>
                  </>
                )}

                {userRole === 'admin' && (
                  <>
                    <Link 
                      to="/admin/verification" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80"
                    >
                      Worker Verification Queue
                    </Link>
                    <Link 
                      to="/admin/bookings" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80"
                    >
                      All Platform Bookings
                    </Link>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-[#EBE5DE] dark:border-white/10 mt-2">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out Account
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2.5 pt-2">
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl text-sm font-bold text-stone-800 dark:text-stone-200"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 btn-gradient rounded-xl text-sm font-extrabold text-[#11171E] shadow-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        loading={logoutLoading}
      />
    </header>
  );
}
