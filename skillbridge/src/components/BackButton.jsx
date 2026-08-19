import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ 
  to = '/worker', 
  label = 'Back to Dashboard',
  className = '',
  state = null,
  onClick = null
}) {
  const baseClasses = `inline-flex items-center gap-2 px-[18px] py-[10px] text-sm font-semibold text-text-sub hover:text-white bg-card-bg hover:bg-white/10 border border-border-custom hover:border-primary/40 rounded-[10px] transition-all duration-200 shadow-xs group cursor-pointer ${className}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={baseClasses}>
        <ArrowLeft className="w-4 h-4 text-text-muted group-hover:text-primary transition-transform group-hover:-translate-x-1" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link to={to} state={state} className={baseClasses}>
      <ArrowLeft className="w-4 h-4 text-text-muted group-hover:text-primary transition-transform group-hover:-translate-x-1" />
      <span>{label}</span>
    </Link>
  );
}
