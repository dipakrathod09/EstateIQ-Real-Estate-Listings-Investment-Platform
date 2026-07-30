import React from 'react';
import { ShieldCheck, Tag, TrendingDown, AlertCircle } from 'lucide-react';

export const Badge = ({
  children,
  variant = 'status',
  status = 'live',
  dealTag = 'Fair Price',
  className = '',
}) => {
  if (variant === 'verified') {
    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-label-caps bg-signal-teal/10 text-signal-teal-text border border-signal-teal/30 ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-signal-teal" />
        <span>RERA Verified</span>
      </span>
    );
  }

  if (variant === 'deal') {
    const isGood = dealTag === 'Good Deal';
    const isOverpriced = dealTag === 'Overpriced';

    const dealStyles = isGood
      ? 'bg-signal-teal/15 text-signal-teal-text border-signal-teal/40'
      : isOverpriced
      ? 'bg-alert-coral/15 text-alert-coral border-alert-coral/40'
      : 'bg-slate-grey/15 text-slate-grey border-slate-grey/30';

    const Icon = isGood ? TrendingDown : isOverpriced ? AlertCircle : Tag;

    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-label-caps font-semibold border ${dealStyles} ${className}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{children || dealTag}</span>
      </span>
    );
  }

  const statusStyles = {
    draft: 'bg-slate-grey/10 text-slate-grey border-slate-grey/30',
    pending_review: 'bg-warm-brass/10 text-warm-brass border-warm-brass/30',
    pending: 'bg-warm-brass/10 text-warm-brass border-warm-brass/30',
    live: 'bg-signal-teal/10 text-signal-teal-text border-signal-teal/30',
    rejected: 'bg-alert-coral/10 text-alert-coral border-alert-coral/30',
    sold: 'bg-ink-navy/10 text-ink-navy border-ink-navy/30',
    rented: 'bg-ink-navy/10 text-ink-navy border-ink-navy/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-label-caps uppercase tracking-wider border ${statusStyles[status] || statusStyles.live} ${className}`}>
      {children || status.replace('_', ' ')}
    </span>
  );
};
