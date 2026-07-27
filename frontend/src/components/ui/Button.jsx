import React from 'react';
import { Link } from 'react-router-dom';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  to,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-body-md font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-warm-brass/50 disabled:opacity-50 disabled:cursor-not-allowed rounded cursor-pointer select-none';

  const variants = {
    primary: 'bg-ink-navy text-soft-ivory hover:bg-primary-container shadow-sm active:scale-[0.98]',
    secondary: 'border border-warm-brass text-warm-brass hover:bg-warm-brass/10 active:scale-[0.98]',
    ghost: 'text-ink-navy hover:bg-surface-container-high active:scale-[0.98]',
    danger: 'bg-alert-coral text-white hover:bg-error-container hover:text-on-error-container active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const combinedClasses = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  if (to && !disabled) {
    return (
      <Link to={to} className={combinedClasses} onClick={onClick} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
};
