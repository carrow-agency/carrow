import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthFunctions, useCurrentUser, useCurrentUserFromConvex } from '../lib/useConvex';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const inputClass =
  'w-full bg-brand-off-white border border-brand-border rounded-[12px] px-5 py-4 font-sans text-[15px] text-brand-black placeholder:text-brand-mid-grey focus:outline-none focus:border-brand-black transition-colors duration-200';

const labelClass =
  'block font-sans font-medium text-[13px] uppercase tracking-widest text-brand-mid-grey mb-2';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/account';

  const { signIn, signOut, requestPasswordReset, resetPassword } = useAuthFunctions();
  const checkRateLimit = useMutation(api.rateLimit.checkRateLimit);
  const { isAuthenticated, isLoading: isAuthLoading } = useCurrentUser();
  const currentUser = useCurrentUserFromConvex();
  const isLoading = isAuthLoading || currentUser === undefined;
  const googleEnabled = import.meta.env.VITE_GOOGLE_ENABLED === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  type ForgotStep = 'idle' | 'request' | 'verify';
  const [forgotStep, setForgotStep] = useState<ForgotStep>('idle');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (!isLoading && isAuthenticated && currentUser) {
      const redirectPath = next === '/account' && currentUser.role === 'admin' ? '/admin' : next;
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, currentUser, navigate, next]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && currentUser === null) {
      signOut().then(() => {
        setError('Your account has been deleted or deactivated. Please sign up again.');
        setLoading(false);
      });
    }
  }, [isAuthenticated, isLoading, currentUser, signOut]);

  const validate = (): string | null => {
    if (!email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
    if (!password) return 'Password is required.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);

    try {
      await checkRateLimit({ identifier: email.trim().toLowerCase() });
    } catch (err: any) {
      setError(err.message || 'Too many attempts.');
      setLoading(false);
      return;
    }

    const result = await signIn(email.trim().toLowerCase(), password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials. Please try again.');
      setLoading(false);
      return;
    }
    // DO NOT navigate immediately. Wait for currentUser to load so we don't hit race conditions or ghost users.
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetError('Enter a valid email address.');
      return;
    }
    setResetLoading(true);
    const result = await requestPasswordReset(resetEmail.trim().toLowerCase());
    setResetLoading(false);
    if (!result.success) {
      setResetError(result.error || 'Failed to send reset email.');
      return;
    }
    setForgotStep('verify');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!resetCode.trim()) { setResetError('Enter the code from your email.'); return; }
    if (newPassword.length < 8) { setResetError('Password must be at least 8 characters.'); return; }
    setResetLoading(true);
    const result = await resetPassword(newPassword, resetCode.trim());
    setResetLoading(false);
    if (!result.success) {
      setResetError(result.error || 'Failed to reset password.');
      return;
    }
    setResetSuccess('Password reset! Sign in with your new password.');
    setForgotStep('idle');
    setResetCode('');
    setNewPassword('');
  };

  return (
    <div className="min-h-screen bg-brand-white flex">
      {/* Left — Brand Panel */}
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-between w-[45%] bg-brand-black px-16 py-14"
      >
        <Link to="/" className="font-serif font-bold text-[28px] text-brand-white tracking-tight">
          Carrow
        </Link>

        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-6">
            Built for serious brands
          </p>
          <h2 className="font-serif font-bold text-[52px] leading-[1.1] text-brand-white mb-8">
            Your brand deserves more than average.
          </h2>
          <p className="font-sans text-[16px] text-brand-mid-grey leading-[1.8] max-w-[380px]">
            Carrow works with ambitious brands to build digital presence that converts. Log in to manage your account, view your plan, and track your progress.
          </p>
        </div>

        <p className="font-sans text-[13px] text-brand-dark-grey">
          &copy; {new Date().getFullYear()} Carrow. All rights reserved.
        </p>
      </motion.div>

      {/* Right — Form Panel */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="relative flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-24 py-14 overflow-hidden"
      >
        {/* Mobile brand header */}
        <div className="lg:hidden mb-12">
          <Link to="/" className="font-serif font-bold text-[24px] text-brand-black">
            Carrow
          </Link>
        </div>

        <div className="w-full max-w-[440px]">
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-3">
            Welcome back
          </p>
          <h1 className="font-serif font-bold text-[40px] md:text-[48px] text-brand-black mb-2 leading-tight">
            Sign in.
          </h1>
          <p className="font-sans text-[15px] text-brand-mid-grey mb-10">
            Don&apos;t have an account?{' '}
            <Link
              to={`/signup${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="text-brand-black font-medium underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {(error || resetSuccess) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-4 py-3 border rounded-[10px] ${resetSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
              >
                <p className={`font-sans text-[14px] ${resetSuccess ? 'text-green-700' : 'text-red-700'}`} role="alert">{resetSuccess || error}</p>
              </motion.div>
            )}

            <div>
              <label htmlFor="login-email" className={labelClass}>Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClass}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="login-password" className={labelClass}>Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-mid-grey hover:text-brand-black transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setForgotStep('request'); setResetEmail(email); setResetError(''); setResetSuccess(''); }}
                className="font-sans text-[13px] text-brand-mid-grey hover:text-brand-black underline underline-offset-2 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-3 bg-brand-black text-brand-white rounded-full py-[18px] font-sans font-semibold text-[15px] hover:bg-brand-dark-grey transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-brand-white/40 border-t-brand-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {googleEnabled && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-brand-white text-brand-mid-grey font-sans text-[13px]">or continue with</span>
                </div>
              </div>

              <a
                href={`${import.meta.env.VITE_CONVEX_URL}/auth/google/authorize`}
                className="w-full flex items-center justify-center gap-3 bg-brand-white border border-brand-border text-brand-black rounded-full py-[18px] font-sans font-semibold text-[15px] hover:bg-brand-off-white transition-colors duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.63l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </a>
            </>
          )}

          {/* Forgot password overlay */}
          <AnimatePresence>
            {forgotStep !== 'idle' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="absolute inset-0 bg-brand-white flex flex-col justify-center px-6 md:px-16 lg:px-24 py-14"
              >
                <div className="w-full max-w-[440px]">
                  <button
                    onClick={() => { setForgotStep('idle'); setResetError(''); }}
                    className="flex items-center gap-2 text-brand-mid-grey hover:text-brand-black transition-colors text-sm mb-8"
                  >
                    <ArrowLeft size={15} /> Back to sign in
                  </button>

                  {forgotStep === 'request' && (
                    <>
                      <h2 className="font-serif font-bold text-[32px] text-brand-black mb-2">Reset password</h2>
                      <p className="font-sans text-[14px] text-brand-mid-grey mb-8">Enter your email and we'll send a reset code.</p>
                      <form onSubmit={handleRequestReset} className="space-y-5" noValidate>
                        {resetError && <p className="text-[13px] text-red-600 font-sans">{resetError}</p>}
                        <div>
                          <label htmlFor="reset-email" className={labelClass}>Email Address</label>
                          <input
                            id="reset-email"
                            type="email"
                            value={resetEmail}
                            onChange={e => setResetEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            className={inputClass}
                            autoFocus
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={resetLoading}
                          className="w-full flex items-center justify-center gap-3 bg-brand-black text-brand-white rounded-full py-[18px] font-sans font-semibold text-[15px] hover:bg-brand-dark-grey transition-colors duration-200 disabled:opacity-40"
                        >
                          {resetLoading ? <span className="inline-block w-4 h-4 border-2 border-brand-white/40 border-t-brand-white rounded-full animate-spin" /> : <>Send Code <ArrowRight size={16} /></>}
                        </button>
                      </form>
                    </>
                  )}

                  {forgotStep === 'verify' && (
                    <>
                      <h2 className="font-serif font-bold text-[32px] text-brand-black mb-2">Enter reset code</h2>
                      <p className="font-sans text-[14px] text-brand-mid-grey mb-8">Check your email for the reset code, then enter it below.</p>
                      <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
                        {resetError && <p className="text-[13px] text-red-600 font-sans">{resetError}</p>}
                        <div>
                          <label htmlFor="reset-code" className={labelClass}>Reset Code</label>
                          <input
                            id="reset-code"
                            type="text"
                            value={resetCode}
                            onChange={e => setResetCode(e.target.value)}
                            placeholder="Enter code from email"
                            autoComplete="one-time-code"
                            className={inputClass}
                            autoFocus
                          />
                        </div>
                        <div>
                          <label htmlFor="reset-new-password" className={labelClass}>New Password</label>
                          <div className="relative">
                            <input
                              id="reset-new-password"
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              placeholder="Create new password"
                              autoComplete="new-password"
                              className={`${inputClass} pr-12`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-mid-grey hover:text-brand-black transition-colors"
                              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={resetLoading}
                          className="w-full flex items-center justify-center gap-3 bg-brand-black text-brand-white rounded-full py-[18px] font-sans font-semibold text-[15px] hover:bg-brand-dark-grey transition-colors duration-200 disabled:opacity-40"
                        >
                          {resetLoading ? <span className="inline-block w-4 h-4 border-2 border-brand-white/40 border-t-brand-white rounded-full animate-spin" /> : <>Set New Password <ArrowRight size={16} /></>}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-8 border-t border-brand-border">
            <p className="font-sans text-[13px] text-brand-mid-grey">
              By signing in you agree to our{' '}
              <Link to="/terms-and-conditions" className="underline underline-offset-2 hover:text-brand-black transition-colors">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="underline underline-offset-2 hover:text-brand-black transition-colors">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
