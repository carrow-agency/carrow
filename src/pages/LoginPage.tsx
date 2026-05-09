import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthFunctions, useCurrentUser } from '../lib/useConvex';

const inputClass =
  'w-full bg-brand-off-white border border-brand-border rounded-[12px] px-5 py-4 font-sans text-[15px] text-brand-black placeholder:text-brand-mid-grey focus:outline-none focus:border-brand-black transition-colors duration-200';

const labelClass =
  'block font-sans font-medium text-[13px] uppercase tracking-widest text-brand-mid-grey mb-2';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/account';

  const { signIn } = useAuthFunctions();
  const { isAuthenticated, isLoading } = useCurrentUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(next, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, next]);

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
    const result = await signIn(email.trim().toLowerCase(), password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials. Please try again.');
      setLoading(false);
      return;
    }
    navigate(next, { replace: true });
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
        className="flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-24 py-14"
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
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 bg-red-50 border border-red-200 rounded-[10px]"
              >
                <p className="font-sans text-[14px] text-red-700" role="alert">{error}</p>
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
