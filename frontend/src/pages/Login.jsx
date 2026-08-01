import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginWithPassword, registerWithPassword, requestPasswordReset, confirmPasswordReset } from '../api/listings';
import { Button, Input } from '../components/ui';
import { useToast } from '../components/Toast';
import { ShieldCheck, Lock, Mail, User, ArrowRight, Check } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code & New Password

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  // Reset State
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    setError(null);
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    loginWithPassword(cleanedEmail, password)
      .then((data) => {
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth_change'));
        setLoading(false);
        toast({ type: 'success', title: 'Welcome Back', message: 'Signed in successfully' });
        navigate('/dashboard');
      })
      .catch((err) => {
        setLoading(false);
        const msg = err.response?.data?.error || 'Invalid email or password';
        setError(msg);
        toast({ type: 'error', title: 'Sign-In Failed', message: msg });
      });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError(null);
    const cleanedEmail = email.trim().toLowerCase();

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!consentChecked) {
      setError('Please accept the Privacy Policy to register');
      return;
    }

    setLoading(true);
    registerWithPassword(cleanedEmail, password, fullName, 'buyer', consentChecked)
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
        const msg = err.response?.data?.error || 'Registration failed. Email may already be registered.';
        setError(msg);
        toast({ type: 'error', title: 'Registration Error', message: msg });
      });
  };

  const handleResetRequest = (e) => {
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

  const handleResetConfirm = (e) => {
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
        setMode('login');
        setResetStep(1);
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
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded bg-primary-container text-warm-brass mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-display-lg text-2xl font-semibold text-ink-navy">
            {mode === 'login' && 'Sign In'}
            {mode === 'register' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="font-body-md text-xs text-slate-grey">
            {mode === 'login' && 'Access your EstateIQ account'}
            {mode === 'register' && 'Join EstateIQ for real estate listings & analytics'}
            {mode === 'forgot' && 'Reset your account password via email code'}
          </p>
        </div>

        {/* Tab Switcher (Sign In vs Create Account) */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-surface-container text-xs font-label-caps uppercase">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 cursor-pointer font-semibold ${
                mode === 'login'
                  ? 'border-warm-brass text-ink-navy'
                  : 'border-transparent text-slate-grey hover:text-ink-navy'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 cursor-pointer font-semibold ${
                mode === 'register'
                  ? 'border-warm-brass text-ink-navy'
                  : 'border-transparent text-slate-grey hover:text-ink-navy'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded bg-alert-coral/10 text-alert-coral border border-alert-coral/30 text-xs font-body-md">
            {error}
          </div>
        )}

        {/* MODE 1: SIMPLE SIGN IN */}
        {mode === 'login' && (
          <form onSubmit={handleSignIn} className="space-y-4">
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

            <div className="text-right">
              <button
                type="button"
                onClick={() => { setMode('forgot'); setResetStep(1); setError(null); }}
                className="text-xs text-warm-brass hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {/* MODE 2: SIMPLE REGISTRATION */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
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

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-start space-x-2 pt-1">
              <input
                type="checkbox"
                id="consent_checkbox_simple"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 rounded border-outline/40 text-warm-brass focus:ring-warm-brass cursor-pointer"
              />
              <label htmlFor="consent_checkbox_simple" className="text-xs text-slate-grey leading-tight cursor-pointer">
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
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {/* MODE 3: SIMPLE FORGOT PASSWORD RESET */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            {resetStep === 1 ? (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <p className="text-xs text-slate-grey">
                  Enter your registered email address to receive a 6-digit reset code.
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
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-grey hover:text-ink-navy cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetConfirm} className="space-y-4">
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
