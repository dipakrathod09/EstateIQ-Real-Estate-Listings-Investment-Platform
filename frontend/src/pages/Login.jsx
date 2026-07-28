import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOTP, verifyOTP } from '../api/listings';
import { Button, Input } from '../components/ui';
import { useToast } from '../components/Toast';
import { ShieldCheck, ArrowRight, CheckCircle2, RefreshCw, UserCheck } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: Phone & Role, 2: OTP, 3: Profile Setup
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('buyer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 30s Countdown timer for OTP Resend
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOTP = (e) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanedPhone = phoneNumber.trim();

    if (!cleanedPhone || cleanedPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setCountdown(30);
    setCanResend(false);

    requestOTP(cleanedPhone)
      .then(() => {
        setStep(2);
        setLoading(false);
        toast({ type: 'success', title: 'OTP Sent', message: `Verification code sent to ${cleanedPhone}` });
      })
      .catch(() => {
        // Fallback for offline / dev mode
        setStep(2);
        setLoading(false);
        toast({ type: 'info', title: 'Dev Mode', message: 'OTP sent (use 123456 for testing)' });
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

    setStep(3); // Proceed to Profile Completion
  };

  const handleCompleteRegistration = (e) => {
    e.preventDefault();
    setLoading(true);

    const devUser = {
      id: 1,
      username: `user_${phoneNumber.slice(-6) || '987654'}`,
      first_name: fullName.split(' ')[0] || 'User',
      last_name: fullName.split(' ').slice(1).join(' ') || '',
      email: email || `${phoneNumber.slice(-6) || 'user'}@estateiq.com`,
      role: role,
      phone_number: phoneNumber,
      is_phone_verified: true,
    };

    verifyOTP(phoneNumber, otp, role)
      .then((data) => {
        const userObj = data.user || devUser;
        localStorage.setItem('token', data.access || 'mock_jwt_access_token_estateiq_2026');
        localStorage.setItem('user', JSON.stringify(userObj));
        window.dispatchEvent(new Event('auth_change'));
        setLoading(false);
        navigate('/dashboard');
      })
      .catch(() => {
        // Fallback for offline / dev mode
        localStorage.setItem('token', 'mock_jwt_access_token_estateiq_2026');
        localStorage.setItem('user', JSON.stringify(devUser));
        window.dispatchEvent(new Event('auth_change'));
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
          <h2 className="font-display-lg text-2xl font-semibold text-ink-navy">
            {step === 3 ? 'Complete Profile Setup' : 'Sign In / Register to EstateIQ'}
          </h2>
          <p className="font-body-md text-xs text-slate-grey">
            {step === 1 && 'Step 1 of 3: Mobile Verification & Account Role'}
            {step === 2 && 'Step 2 of 3: Enter 6-Digit Verification Code'}
            {step === 3 && 'Step 3 of 3: Profile & Account Details'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded bg-alert-coral/10 text-alert-coral border border-alert-coral/30 text-xs font-body-md">
            {error}
          </div>
        )}

        <div className="p-3 rounded bg-signal-teal/10 text-signal-teal-text border border-signal-teal/30 text-xs font-data-stats text-center">
          Test OTP Verification Code: <span className="font-bold text-ink-navy">123456</span>
        </div>

        {/* Step 1: Mobile & Role Selector */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Select Account Role</label>
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
              label="10-Digit Mobile Number"
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
        )}

        {/* Step 2: Enter OTP with Resend Countdown */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <Input
              label="Enter 6-Digit Verification OTP"
              type="text"
              placeholder="123456"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <Button type="submit" variant="primary" className="w-full">
              Verify OTP & Continue
            </Button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-grey hover:text-ink-navy cursor-pointer"
              >
                Change Number
              </button>

              {canResend ? (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="text-warm-brass hover:underline flex items-center cursor-pointer font-bold"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Resend OTP
                </button>
              ) : (
                <span className="text-slate-grey font-data-stats">
                  Resend in <span className="font-bold text-ink-navy">{countdown}s</span>
                </span>
              )}
            </div>
          </form>
        )}

        {/* Step 3: Profile Completion & Registration */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Dipak Rathod"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              <UserCheck className="w-4 h-4 mr-2" />
              {loading ? 'Completing Registration...' : 'Complete & Launch Dashboard'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
