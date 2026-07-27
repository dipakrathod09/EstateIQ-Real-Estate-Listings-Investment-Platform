import React from 'react';

export const Input = ({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-label-caps uppercase tracking-wider text-ink-navy">
          {label} {required && <span className="text-alert-coral">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3.5 py-2.5 rounded bg-surface-container-lowest border ${
          error ? 'border-alert-coral focus:ring-alert-coral' : 'border-outline/40 focus:border-warm-brass focus:ring-warm-brass/50'
        } text-ink-navy placeholder-slate-grey/60 text-sm focus:outline-none focus:ring-2 transition-all ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-alert-coral font-body-md mt-1">{error}</p>
      )}
    </div>
  );
};
