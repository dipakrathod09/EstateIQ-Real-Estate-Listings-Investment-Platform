import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-body-md font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-warm-brass/50 disabled:opacity-50 disabled:cursor-not-allowed rounded';

  const variants = {
    primary: 'bg-ink-navy text-soft-ivory hover:bg-primary-container shadow-sm',
    secondary: 'border border-warm-brass text-warm-brass hover:bg-warm-brass/10',
    ghost: 'text-ink-navy hover:bg-surface-container-high',
    danger: 'bg-alert-coral text-white hover:bg-error-container hover:text-on-error-container',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
