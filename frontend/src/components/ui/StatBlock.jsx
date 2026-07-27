import React from 'react';

export const StatBlock = ({
  label,
  value,
  subtext,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={`p-3 rounded-lg bg-surface-container border border-surface-variant/80 ${className}`}>
      <div className="flex items-center justify-between text-slate-grey text-xs font-label-caps uppercase tracking-wider mb-1">
        <span>{label}</span>
        {Icon && <Icon className="w-4 h-4 text-warm-brass" />}
      </div>
      <div className="text-base font-data-stats font-semibold text-ink-navy">
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-slate-grey mt-0.5 font-body-md">
          {subtext}
        </div>
      )}
    </div>
  );
};
