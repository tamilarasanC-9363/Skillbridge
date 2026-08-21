import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ 
  to = null, 
  label = 'Back',
  className = '',
  state = null,
  onClick = null
}) {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const getDashboardFallback = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'worker') return '/worker';
    if (userRole === 'customer') return '/customer';
    return '/';
  };

  const defaultFallback = to || getDashboardFallback();

  const handleBackNavigation = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
      return;
    }

    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
      setTimeout(() => {
        const path = window.location.pathname;
        if (path === '/login' || path === '/register' || path === '/') {
          navigate(defaultFallback, { replace: true });
        }
      }, 50);
    } else {
      navigate(defaultFallback, { state });
    }
  };

  const baseClasses = `inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#283845] dark:text-stone-200 hover:text-[#FFA649] dark:hover:text-[#FFA649] bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 hover:border-[#FFA649]/50 dark:hover:border-[#FFA649]/50 rounded-xl transition-all duration-200 shadow-xs group cursor-pointer ${className}`;

  return (
    <button type="button" onClick={handleBackNavigation} className={baseClasses}>
      <ArrowLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#FFA649] dark:group-hover:text-[#FFA649] transition-transform group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </button>
  );
}
