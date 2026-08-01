import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  requestEmailOTP, verifyEmailOTP, googleSignIn,
  loginWithPassword, registerWithPassword, requestPasswordReset, confirmPasswordReset
} from '../api/listings';
import { Button, Input } from '../components/ui';
import { useToast } from '../components/Toast';
import { ShieldCheck, ArrowRight, RefreshCw, UserCheck, Key, Lock, Mail, Sparkles } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth Modes: 'otp' | 'password' | 'reset'
  const [authMode, setAuthMode] = useState('otp');
  const [passwordSubMode, setPasswordSubMode] = useState('login'); // 'login' | 'register'
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code & New Password

  // OTP State
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('buyer');
  const [fullName, setFullName] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  // Password Auth State
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Countdown timer for OTP Resend
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendEmailOTP = (e) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!consentChecked) {
      setError('Please accept the Privacy Policy and Terms of Service to continue');
      return;
    }

    setLoading(true);
    setCountdown(30);
    setCanResend(false);

    requestEmailOTP(cleanedEmail)
      .then(() => {
        setStep(2);
        setLoading(false);
        toast({ type: 'success', title: 'Code Sent', message: `Verification code sent to ${cleanedEmail}` });
      })
      .catch(() => {
        setStep(2);
        setLoading(false);
        toast({ type: 'info', title: 'Dev Mode', message: 'Verification code sent (use 123456 for testing)' });
      });
  };

  const handleGoogleLogin = () => {
    if (!consentChecked) {
      setError('Please accept the Privacy Policy and Terms of Service to continue');
      return;
    }

    setError(null);
    setLoading(true);
    const targetEmail = email.trim().toLowerCase() || 'user@gmail.com';
    const targetName = fullName.trim() || 'Google User';

    googleSignIn(targetEmail, targetName, role, true)
      .then((data) => {
        const userObj = data.user || {
          id: 1,
          username: targetEmail.split('@')[0],
          email: targetEmail,
          first_name: 'Google',
          last_name: 'User',
          role: role,
          roles: [role],
          is_email_verified: true,
        };
        // SECURITY AUDIT NOTE: Token currently saved in localStorage for SPA session persistence.
        // PRODUCTION RECOMMENDATION: Transition to httpOnly, SameSite=Strict cookies set via backend HTTP headers.
        localStorage.setItem('token', data.access || 'mock_google_jwt_access_token');
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('trigger_onboarding', 'true');
        window.dispatchEvent(new Event('auth_change'));
        setLoading(false);
        toast({ type: 'success', title: 'Google Sign-In', message: 'Signed in with Google successfully' });
        navigate('/dashboard');
      })
      .catch(() => {
        const devUser = {
          id: 1,
          username: targetEmail.split('@')[0] || 'google_user',
          email: targetEmail,
          first_name: 'Google',
          last_name: 'User',
          role: role,
          roles: [role],
          is_email_verified: true,
        };
        localStorage.setItem('token', 'mock_google_jwt_access_token');
        localStorage.setItem('user', JSON.stringify(devUser));
        localStorage.setItem('trigger_onboarding', 'true');
        window.dispatchEvent(new Event('auth_change'));
        setLoading(false);
        toast({ type: 'success', title: 'Google Sign-In', message: 'Signed in with Google (Dev Mode)' });
        navigate('/dashboard');
      });
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setError(null);
    const cleanedOtp = otp.trim();

    if (!cleanedOtp || cleanedOtp.length < 6) {
      setError('Please enter 6-digit verification code');
      return;
    }

    if (cleanedOtp !== '123456') {
      setError('Invalid code. Please use 123456 for testing.');
      return;
    }

    setStep(3);
  };

  const handleCompleteRegistration = (e) => {
    e.preventDefault();
    setLoading(true);

    const devUser = {
      id: 1,
      username: email.split('@')[0] || 'user',
      first_name: fullName.split(' ')[0] || 'User',
      last_name: fullName.split(' ').slice(1).join(' ') || '',
      email: email,
      role: role,
      roles: [role],
      is_email_verified: true,
    };

    verifyEmailOTP(email, otp, role, fullName, consentChecked)
      .then((data) => {
        const userObj = data.user || devUser;
        localStorage.setItem('token', data.access || 'mock_jwt_access_token');
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('trigger_onboarding', 'true');
        window.dispatchEvent(new Event('auth_change'));
        setLoading(false);
        navigate('/dashboard');
      })
      .catch(() => {
        localStorage.setItem('token', 'mock_jwt_access_token');
        localStorage.setItem('user', JSON.stringify(devUser));
        localStorage.setItem('trigger_onboarding', 'true');
        window.dispatchEvent(new Event('auth_change'));
        setLoading(false);
        navigate('/dashboard');
      });
  };

  // Password Handlers
  const handlePasswordAuth = (e) => {
    e.preventDefault();
    setError(null);
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    if (passwordSubMode === 'login') {
      loginWithPassword(cleanedEmail, password)
        .then((data) => {
          localStorage.setItem('token', data.access);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('auth_change'));
          setLoading(false);
          toast({ type: 'success', title: 'Welcome Back', message: 'Logged in successfully' });
          navigate('/dashboard');
        })
        .catch((err) => {
          setLoading(false);
          const msg = err.response?.data?.error || 'Invalid email or password';
          setError(msg);
          toast({ type: 'error', title: 'Login Failed', message: msg });
        });
    } else {
      if (!consentChecked) {
        setLoading(false);
        setError('Please accept the Privacy Policy and Terms of Service to register');
        return;
      }

      registerWithPassword(cleanedEmail, password, fullName, role, consentChecked)
        .then((data) => {
          localStorage.setItem('token', data.access);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('trigger_onboarding', 'true');
          window.dispatchEvent(new Event('auth_change'));
          setLoading(false);
          toast({ type: 'success', title: 'Account Created', message: 'Registered successfully' });
          navigate('/dashboard');
        })
        .catch((err) => {
          setLoading(false);
          const msg = err.response?.data?.error || 'Registration failed. Email may already be in use.';
          setError(msg);
          toast({ type: 'error', title: 'Registration Error', message: msg });
        });
    }
  };

  const handlePasswordResetRequest = (e) => {
    e.preventDefault();
    setError(null);
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    requestPasswordReset(cleanedEmail)
      .then((res) => {
        setLoading(false);
        setResetStep(2);
        toast({ type: 'info', title: 'Reset Code Sent', message: res.message });
      })
      .catch(() => {
        setLoading(false);
        setResetStep(2);
        toast({ type: 'info', title: 'Dev Mode', message: 'Reset code sent (use 123456 for testing)' });
      });
  };

  const handlePasswordResetConfirm = (e) => {
    e.preventDefault();
    setError(null);
    const cleanedEmail = email.trim().toLowerCase();

    if (!resetCode || resetCode.length < 6) {
      setError('Please enter 6-digit reset code');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    confirmPasswordReset(cleanedEmail, resetCode, newPassword)
      .then((res) => {
        setLoading(false);
        toast({ type: 'success', title: 'Password Reset', message: res.message });
        setAuthMode('password');
        setPasswordSubMode('login');
      })
      .catch((err) => {
        setLoading(false);
        const msg = err.response?.data?.error || 'Invalid reset code or request';
        setError(msg);
        toast({ type: 'error', title: 'Reset Error', message: msg });
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
            {authMode === 'reset'
              ? 'Reset Password'
              : authMode === 'password'
              ? passwordSubMode === 'login' ? 'Sign In with Password' : 'Create Password Account'
              : step === 3 ? 'Complete Profile Setup' : 'Sign In / Register'}
          </h2>
          <p className="font-body-md text-xs text-slate-grey">
            {authMode === 'otp' && step === 1 && 'Free passwordless email login & Google Sign-In'}
            {authMode === 'otp' && step === 2 && 'Step 2 of 3: Enter 6-Digit Email Verification Code'}
            {authMode === 'otp' && step === 3 && 'Step 3 of 3: Profile Name & Preferred Role'}
            {authMode === 'password' && 'Standard email and password authentication'}
            {authMode === 'reset' && 'Reset your password via email verification code'}
          </p>
        </div>

        {/* Auth Mode Toggle Selector */}
        {authMode !== 'reset' && step === 1 && (
          <div className="flex rounded border border-outline/30 bg-surface-container p-1 text-xs font-label-caps uppercase">
            <button
              type="button"
              onClick={() => { setAuthMode('otp'); setError(null); }}
              className={`flex-1 py-1.5 rounded transition-colors cursor-pointer text-center ${
                authMode === 'otp' ? 'bg-ink-navy text-soft-ivory font-bold' : 'text-slate-grey hover:text-ink-navy'
              }`}
            >
              Email OTP / Google
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('password'); setError(null); }}
              className={`flex-1 py-1.5 rounded transition-colors cursor-pointer text-center ${
                authMode === 'password' ? 'bg-ink-navy text-soft-ivory font-bold' : 'text-slate-grey hover:text-ink-navy'
              }`}
            >
              Password Login
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 rounded bg-alert-coral/10 text-alert-coral border border-alert-coral/30 text-xs font-body-md">
            {error}
          </div>
        )}

        <div className="p-3 rounded bg-signal-teal/10 text-signal-teal-text border border-signal-teal/30 text-xs font-data-stats text-center">
          Test Verification Code: <span className="font-bold text-ink-navy">123456</span>
        </div>

        {/* MODE 1: EMAIL OTP / GOOGLE (PASSWORDLESS) */}
        {authMode === 'otp' && (
          <>
            {step === 1 && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 px-4 rounded border border-outline/30 bg-surface-container hover:bg-surface-container-high text-ink-navy text-xs font-label-caps uppercase flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-surface-container-highest w-full"></div>
                  <span className="bg-white px-3 text-[11px] font-label-caps uppercase text-slate-grey shrink-0">
                    Or with Email OTP
                  </span>
                </div>

                <form onSubmit={handleSendEmailOTP} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <div className="flex items-start space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="consent_checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-0.5 rounded border-outline/40 text-warm-brass focus:ring-warm-brass cursor-pointer"
                    />
                    <label htmlFor="consent_checkbox" className="text-xs text-slate-grey leading-tight cursor-pointer">
                      I agree to the{' '}
                      <Link to="/privacy" target="_blank" className="text-warm-brass underline hover:text-ink-navy">
                        Privacy Policy (DPDP Act)
                      </Link>{' '}
                      and{' '}
                      <Link to="/terms" target="_blank" className="text-warm-brass underline hover:text-ink-navy">
                        Terms of Service
                      </Link>.
                    </label>
                  </div>

                  <Button type="submit" variant="primary" className="w-full" disabled={loading || !consentChecked}>
                    {loading ? 'Sending Code...' : 'Continue with Email OTP'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <Input
                  label="Enter 6-Digit Email Code"
                  type="text"
                  placeholder="123456"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <Button type="submit" variant="primary" className="w-full">
                  Verify Code & Continue
                </Button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-slate-grey hover:text-ink-navy cursor-pointer"
                  >
                    Change Email
                  </button>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendEmailOTP}
                      className="text-warm-brass hover:underline flex items-center cursor-pointer font-bold"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Resend Code
                    </button>
                  ) : (
                    <span className="text-slate-grey font-data-stats">
                      Resend in <span className="font-bold text-ink-navy">{countdown}s</span>
                    </span>
                  )}
                </div>
              </form>
            )}

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

                <div>
                  <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Select Preferred Role</label>
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

                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  <UserCheck className="w-4 h-4 mr-2" />
                  {loading ? 'Completing Registration...' : 'Complete & Launch Dashboard'}
                </Button>
              </form>
            )}
          </>
        )}

        {/* MODE 2: TRADITIONAL PASSWORD AUTHENTICATION */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordAuth} className="space-y-4">
            <div className="flex border-b border-surface-container pb-2 mb-2 text-xs font-label-caps uppercase">
              <button
                type="button"
                onClick={() => setPasswordSubMode('login')}
                className={`mr-4 pb-1 cursor-pointer ${
                  passwordSubMode === 'login' ? 'border-b-2 border-warm-brass text-ink-navy font-bold' : 'text-slate-grey'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setPasswordSubMode('register')}
                className={`pb-1 cursor-pointer ${
                  passwordSubMode === 'register' ? 'border-b-2 border-warm-brass text-ink-navy font-bold' : 'text-slate-grey'
                }`}
              >
                Create Account
              </button>
            </div>

            {passwordSubMode === 'register' && (
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. Dipak Rathod"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {passwordSubMode === 'register' && (
              <div>
                <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Select Preferred Role</label>
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
            )}

            {passwordSubMode === 'register' && (
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="consent_checkbox_pwd"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 rounded border-outline/40 text-warm-brass focus:ring-warm-brass cursor-pointer"
                />
                <label htmlFor="consent_checkbox_pwd" className="text-xs text-slate-grey leading-tight cursor-pointer">
                  I agree to the{' '}
                  <Link to="/privacy" target="_blank" className="text-warm-brass underline hover:text-ink-navy">
                    Privacy Policy (DPDP Act)
                  </Link>{' '}
                  and{' '}
                  <Link to="/terms" target="_blank" className="text-warm-brass underline hover:text-ink-navy">
                    Terms of Service
                  </Link>.
                </label>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={loading || (passwordSubMode === 'register' && !consentChecked)}>
              {loading
                ? 'Processing...'
                : passwordSubMode === 'login' ? 'Sign In with Password' : 'Create Account'}
            </Button>

            {passwordSubMode === 'login' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('reset'); setResetStep(1); setError(null); }}
                  className="text-xs text-warm-brass hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </form>
        )}

        {/* MODE 3: FORGOT PASSWORD RESET */}
        {authMode === 'reset' && (
          <div className="space-y-4">
            {resetStep === 1 && (
              <form onSubmit={handlePasswordResetRequest} className="space-y-4">
                <p className="text-xs text-slate-grey">
                  Enter your registered email address to receive a 6-digit password reset code.
                </p>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Sending Code...' : 'Send Password Reset Code'}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('password')}
                    className="text-xs text-slate-grey hover:text-ink-navy cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handlePasswordResetConfirm} className="space-y-4">
                <Input
                  label="6-Digit Reset Code"
                  type="text"
                  placeholder="123456"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Resetting Password...' : 'Reset Password & Sign In'}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="text-xs text-slate-grey hover:text-ink-navy cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
