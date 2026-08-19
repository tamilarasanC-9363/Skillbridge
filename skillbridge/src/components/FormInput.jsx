import React from 'react';

export default function FormInput({
  label,
  icon: Icon,
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  inputMode,
  disabled = false,
  required = false,
  className = '',
  rows
}) {
  const isTextArea = type === 'textarea';

  return (
    <div className="flex flex-col text-left w-full animate-fade-in select-none">
      {label && (
        <label htmlFor={name} className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="input-wrapper relative w-full group">
        {Icon && (
          <span className={`input-icon absolute left-4 pointer-events-none text-[#94A3B8] group-focus-within:text-[#8B9CFF] transition-colors duration-150 ${
            isTextArea ? 'top-4' : 'top-1/2 -translate-y-1/2'
          }`}>
            <Icon className="w-4.5 h-4.5 stroke-[2.2px]" aria-hidden="true" />
          </span>
        )}

        {isTextArea ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows || 3}
            className={`w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#6366F1] focus:bg-[rgba(255,255,255,0.08)] outline-none rounded-xl py-2.5 pr-4 text-sm transition-all duration-150 ${
              Icon ? 'pl-12' : 'pl-4'
            } ${error ? 'border-red-500/50 focus:border-red-500' : ''} ${className}`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            inputMode={inputMode}
            className={`w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#6366F1] focus:bg-[rgba(255,255,255,0.08)] outline-none rounded-xl h-11 pr-4 text-sm transition-all duration-150 ${
              Icon ? 'pl-12' : 'pl-4'
            } ${error ? 'border-red-500/50 focus:border-red-500' : ''} ${className}`}
          />
        )}
      </div>

      {error && (
        <span className="text-[11px] font-bold text-red-400 mt-1.5 animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
}
