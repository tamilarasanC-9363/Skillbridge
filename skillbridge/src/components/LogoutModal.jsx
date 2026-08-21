import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose, onConfirm, loading = false }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] select-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999
      }}
    >
      {/* Fullscreen backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh'
        }}
        onClick={onClose}
      />

      {/* Center Modal Card */}
      <div 
        className="fixed z-[100000] w-[90%] max-w-sm bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-scale-up"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-inner">
          <LogOut className="w-6 h-6 stroke-[2.2px]" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-[#283845] dark:text-white leading-snug font-heading">
            Sign out of SkillBridge?
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            You will need to sign back in with your credentials to access your portal.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-[#EBE5DE] dark:border-white/10 hover:bg-stone-100 dark:hover:bg-stone-800 text-[#283845] dark:text-stone-200 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md shadow-rose-600/25 transition-all cursor-pointer"
          >
            {loading ? 'Exiting...' : 'Yes, Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
