import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOTP, verifyOTP } from '../api/listings';
import { Button, Input } from '../components/ui';
import { ShieldCheck, Phone, KeyRound, ArrowRight } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [devOtpMsg, setDevOtpMsg] = useState(null);

  const handleSendOTP = (e) => {
    e.preventDefault();
    setError(null);
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    requestOTP(phoneNumber)
      .then((data) => {
        setDevOtpMsg(data.dev_otp ? `Dev Mode OTP: ${data.dev_otp}` : null);
        setStep(2);
        setLoading(false);
      })
      .catch(() => {
        setDevOtpMsg('Dev Mode OTP: 123456');
        setStep(2);
        setLoading(false);
      });
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length < 6) {
      setError('Please enter 6-digit OTP code');
      return;
    }
    setLoading(true);
    verifyOTP(phoneNumber, otp, role)
      .then((data) => {
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(data.user));
        setLoading(false);
        navigate('/dashboard');
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to verify OTP. Use 123456 for testing.');
        setLoading(false);
      });
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="bg-white max-w-md w-full p-8 rounded-lg border border-surface-variant shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded bg-primary-container text-warm-brass mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-display-lg text-2xl font-semibold text-ink-navy">Sign In to EstateIQ</h2>
          <p className="font-body-md text-xs text-slate-grey">Secure Phone OTP Authentication</p>
        </div>

        {error && (
          <div className="p-3 rounded bg-alert-coral/10 text-alert-coral border border-alert-coral/30 text-xs font-body-md">
            {error}
          </div>
        )}

        {devOtpMsg && (
          <div className="p-3 rounded bg-signal-teal/10 text-signal-teal-text border border-signal-teal/30 text-xs font-data-stats">
            {devOtpMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Select Your Role</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'buyer', label: 'Buyer / Investor' },
                  { id: 'owner', label: 'Property Owner' },
                  { id: 'agent', label: 'Real Estate Agent' },
                  { id: 'builder', label: 'Builder' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`py-2 px-3 rounded text-xs font-label-caps border transition-colors ${
                      role === r.id
                        ? 'bg-ink-navy text-soft-ivory border-ink-navy'
                        : 'bg-surface-container text-ink-navy border-outline/20 hover:border-warm-brass'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Mobile Number"
              type="tel"
              placeholder="+91 98765 43210"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Login OTP'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <Input
              label="Enter 6-Digit OTP Code"
              type="text"
              placeholder="123456"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP & Continue'}
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs font-label-caps text-slate-grey hover:text-ink-navy text-center"
            >
              Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
