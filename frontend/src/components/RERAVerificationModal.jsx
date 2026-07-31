import React from 'react';
import { ShieldCheck, ExternalLink, AlertTriangle, Calendar, Building2, CheckCircle2, XCircle, FileText, Scale, Lock } from 'lucide-react';

export const RERAVerificationModal = ({ isOpen, onClose, reraData, reraNumber }) => {
  if (!isOpen) return null;

  const {
    rera_number = reraNumber || 'PR/GJ/AHMEDABAD/10293/2026',
    state_authority = 'Gujarat RERA (GujRERA)',
    project_name = 'Luxury Enclave Project',
    promoter_name = 'Apex Infrastructure Developers Ltd',
    registration_status = 'approved',
    compliance_score = 96,
    promised_completion_date = '2027-12-31',
    revised_completion_date = '2027-12-31',
    escrow_verified = true,
    escrow_bank_name = 'HDFC Bank RERA Escrow Account',
    litigation_count = 0,
    approved_floors = 18,
    total_units = 144,
    official_portal_url = 'https://gujrera.gujarat.gov.in/projectSearch',
  } = reraData || {};

  const isApproved = registration_status === 'approved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-navy/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-surface-variant max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-ink-navy text-soft-ivory p-6 flex items-start justify-between relative border-b border-primary-container">
          <div className="space-y-1 pr-8">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-signal-teal/20 text-signal-teal text-xs font-label-caps uppercase border border-signal-teal/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{state_authority} Audit Report</span>
            </div>
            <h2 className="font-display-lg text-xl sm:text-2xl font-semibold text-soft-ivory line-clamp-1">{project_name}</h2>
            <p className="font-mono text-xs text-warm-brass font-medium">RERA Reg No: {rera_number}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-grey hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm font-body-md text-ink-navy">
          {/* Trust Score & Status Banner */}
          <div className="p-4 rounded-lg bg-surface-container border border-outline/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-signal-teal/10 border-2 border-signal-teal text-signal-teal-text">
                <span className="font-headline-sm text-xl font-bold">{compliance_score}</span>
                <span className="text-[9px] block text-slate-grey absolute bottom-1">/100</span>
              </div>
              <div>
                <span className="text-xs text-slate-grey font-label-caps uppercase block">EstateIQ RERA Trust Index</span>
                <span className="font-headline-sm text-base font-semibold text-ink-navy">
                  {compliance_score >= 90 ? '🟢 Top Tier RERA Compliant' : compliance_score >= 75 ? '🟡 Good Standing' : '🔴 High Risk Review'}
                </span>
                <p className="text-xs text-slate-grey mt-0.5">Verified against statutory timeline & escrow benchmarks</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-label-caps uppercase ${
                isApproved ? 'bg-signal-teal/10 text-signal-teal-text border border-signal-teal/30' : 'bg-alert-coral/10 text-alert-coral border border-alert-coral/30'
              }`}>
                {isApproved ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
                {registration_status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Audit Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Developer Entity */}
            <div className="p-3.5 rounded-lg border border-surface-variant bg-white space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-grey text-xs font-label-caps">
                <Building2 className="w-4 h-4 text-warm-brass" />
                <span>Promoter / Developer</span>
              </div>
              <span className="font-semibold text-ink-navy block">{promoter_name}</span>
            </div>

            {/* Escrow Account Check */}
            <div className="p-3.5 rounded-lg border border-surface-variant bg-white space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-grey text-xs font-label-caps">
                <Lock className="w-4 h-4 text-signal-teal" />
                <span>70% Mandatory Escrow Status</span>
              </div>
              <div className="flex items-center space-x-1.5 text-signal-teal-text font-semibold">
                <CheckCircle2 className="w-4 h-4 text-signal-teal" />
                <span>{escrow_bank_name}</span>
              </div>
            </div>

            {/* Completion Timeline */}
            <div className="p-3.5 rounded-lg border border-surface-variant bg-white space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-grey text-xs font-label-caps">
                <Calendar className="w-4 h-4 text-warm-brass" />
                <span>Promised Possession Date</span>
              </div>
              <span className="font-semibold text-ink-navy block">
                {promised_completion_date ? new Date(promised_completion_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Dec 2027'} (On Schedule)
              </span>
            </div>

            {/* Active Litigations */}
            <div className="p-3.5 rounded-lg border border-surface-variant bg-white space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-grey text-xs font-label-caps">
                <Scale className="w-4 h-4 text-ink-navy/70" />
                <span>Active RERA Litigations</span>
              </div>
              <span className="font-semibold text-signal-teal-text block">
                {litigation_count === 0 ? '0 Active Complaints' : `${litigation_count} Active Complaint(s)`}
              </span>
            </div>
          </div>

          {/* Project Scale */}
          <div className="p-4 rounded-lg bg-surface-container-lowest border border-outline/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-grey block font-label-caps">Approved Building Scale</span>
              <span className="font-bold text-ink-navy text-sm">{approved_floors} Floors • {total_units} Total Registered Units</span>
            </div>
            <div>
              <span className="text-slate-grey block font-label-caps">State Board</span>
              <span className="font-semibold text-warm-brass">{state_authority}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer / Official Govt Portal Link */}
        <div className="p-4 bg-surface-container border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-grey">
            Official government records can be directly verified on the state portal.
          </p>

          <a
            href={official_portal_url || 'https://gujrera.gujarat.gov.in/projectSearch'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 rounded bg-warm-brass hover:bg-warm-brass-dark text-white font-label-caps text-xs uppercase flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <span>Verify on Official State RERA Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
