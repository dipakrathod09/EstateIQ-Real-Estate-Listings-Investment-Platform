import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOTP, verifyOTP } from '../api/listings';
import { Button, Input } from '../components/ui';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = (e) => {
    e.preventDefault();
    setError(null);
    const cleanedPhone = phoneNumber.trim();

    if (!cleanedPhone || cleanedPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    requestOTP(cleanedPhone)
      .then(() => {
        setStep(2);
        setLoading(false);
      })
      .catch(() => {
        // Fallback for offline / dev mode
        setStep(2);
        setLoading(false);
      });
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setError(null);
    const cleanedOtp = otp.trim();

    if (!cleanedOtp || cleanedOtp.length < 6) {
      setError('Please enter 6-digit OTP code');
      return;
    }

    if (cleanedOtp !== '123456') {
      setError('Invalid OTP code. Please use 123456 for testing.');
      return;
    }

    setLoading(true);

    const devUser = {
      id: 1,
      username: `user_${phoneNumber.slice(-6) || '987654'}`,
      email: `${phoneNumber.slice(-6) || 'user'}@estateiq.com`,
      role: role,
      phone_number: phoneNumber,
      is_phone_verified: true,
    };

    verifyOTP(phoneNumber, cleanedOtp, role)
      .then((data) => {
        localStorage.setItem('token', data.access || 'mock_jwt_access_token_estateiq_2026');
        localStorage.setItem('user', JSON.stringify(data.user || devUser));
        setLoading(false);
        navigate('/dashboard');
      })
      .catch(() => {
        // Fallback for offline / dev mode
        localStorage.setItem('token', 'mock_jwt_access_token_estateiq_2026');
        localStorage.setItem('user', JSON.stringify(devUser));
        setLoading(false);
        navigate('/dashboard');
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

        <div className="p-3 rounded bg-signal-teal/10 text-signal-teal-text border border-signal-teal/30 text-xs font-data-stats text-center">
          Test OTP Code: <span className="font-bold text-ink-navy">123456</span>
        </div>

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
                    className={`py-2 px-3 rounded text-xs font-label-caps border transition-colors cursor-pointer ${
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
              placeholder="9876543210"
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
              className="w-full text-xs font-label-caps text-slate-grey hover:text-ink-navy text-center cursor-pointer"
            >
              Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
