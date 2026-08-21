// FormInput component

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
  rows,
  rightElement
}) {
  const isTextArea = type === 'textarea';

  return (
    <div className="flex flex-col text-left w-full animate-fade-in select-none">
      {label && (
        <label htmlFor={name} className="block text-[11px] font-bold text-[#283845] dark:text-stone-300 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-[#FFA649]">*</span>}
        </label>
      )}

      <div className="input-wrapper relative w-full group">
        {Icon && (
          <span className={`input-icon absolute left-3.5 pointer-events-none text-stone-400 dark:text-stone-500 group-focus-within:text-[#FFA649] transition-colors duration-150 ${
            isTextArea ? 'top-3.5' : 'top-1/2 -translate-y-1/2'
          }`}>
            <Icon className="w-4 h-4 stroke-[2.2px]" aria-hidden="true" />
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
            className={`w-full bg-stone-50/80 dark:bg-[#18222B] border border-[#EBE5DE] dark:border-white/10 text-[#283845] dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:border-[#FFA649] focus:bg-white dark:focus:bg-[#18222B] focus:ring-2 focus:ring-[#FFA649]/25 outline-none rounded-xl py-2.5 pr-4 text-xs sm:text-sm transition-all duration-150 ${
              Icon ? 'pl-10' : 'pl-3.5'
            } ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''} ${className}`}
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
            className={`w-full bg-stone-50/80 dark:bg-[#18222B] border border-[#EBE5DE] dark:border-white/10 text-[#283845] dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:border-[#FFA649] focus:bg-white dark:focus:bg-[#18222B] focus:ring-2 focus:ring-[#FFA649]/25 outline-none rounded-xl h-11 ${rightElement ? 'pr-10' : 'pr-4'} text-xs sm:text-sm transition-all duration-150 ${
              Icon ? 'pl-10' : 'pl-3.5'
            } ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''} ${className}`}
          />
        )}

        {rightElement && !isTextArea && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <span className="text-[11px] font-bold text-rose-500 dark:text-rose-400 mt-1.5 animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
}
