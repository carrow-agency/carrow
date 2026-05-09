import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuthFunctions, useCurrentUser, useCurrentUserFromConvex } from '../lib/useConvex';

const inputClass =
  'w-full bg-brand-off-white border border-brand-border rounded-[12px] px-5 py-4 font-sans text-[15px] text-brand-black placeholder:text-brand-mid-grey focus:outline-none focus:border-brand-black transition-colors duration-200';

const labelClass =
  'block font-sans font-medium text-[13px] uppercase tracking-widest text-brand-mid-grey mb-2';

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= score ? colors[score] : 'bg-brand-border'}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            style={{ originX: 0 }}
          />
        ))}
      </div>
      <p className="font-sans text-[12px] text-brand-mid-grey">{labels[score]}</p>
    </div>
  );
}

const requirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Contains a letter', test: (p: string) => /[A-Za-z]/.test(p) },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/account';

  const { signUp } = useAuthFunctions();
  const { isAuthenticated, isLoading: isAuthLoading } = useCurrentUser();
  const currentUser = useCurrentUserFromConvex();
  const isLoading = isAuthLoading || currentUser === undefined;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated && currentUser) {
      const redirectPath = next === '/account' && currentUser.role === 'admin' ? '/admin' : next;
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, currentUser, navigate, next]);

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = 'Enter your full name (at least 2 characters).';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) errs.password = 'Password must contain letters and numbers.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const result = await signUp(email.trim().toLowerCase(), password, name.trim());
    if (!result.success) {
      setGlobalError(result.error || 'Unable to create account. Please try again.');
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
            Start growing today
          </p>
          <h2 className="font-serif font-bold text-[52px] leading-[1.1] text-brand-white mb-8">
            Join brands that take their growth seriously.
          </h2>
          <ul className="space-y-4">
            {[
              'Access your client dashboard',
              'Track your active plan and deliverables',
              'Direct line to your account manager',
            ].map((point, i) => (
              <li key={i} className="flex items-center gap-3 font-sans text-[15px] text-brand-mid-grey">
                <span className="w-5 h-5 rounded-full bg-brand-dark-grey flex items-center justify-center shrink-0">
                  <Check size={12} className="text-brand-white" />
                </span>
                {point}
              </li>
            ))}
          </ul>
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
        className="flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-24 py-14 overflow-y-auto"
      >
        {/* Mobile brand header */}
        <div className="lg:hidden mb-12">
          <Link to="/" className="font-serif font-bold text-[24px] text-brand-black">
            Carrow
          </Link>
        </div>

        <div className="w-full max-w-[440px]">
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-3">
            Create account
          </p>
          <h1 className="font-serif font-bold text-[40px] md:text-[48px] text-brand-black mb-2 leading-tight">
            Get started.
          </h1>
          <p className="font-sans text-[15px] text-brand-mid-grey mb-10">
            Already have an account?{' '}
            <Link
              to={`/login${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="text-brand-black font-medium underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 bg-red-50 border border-red-200 rounded-[10px]"
              >
                <p className="font-sans text-[14px] text-red-700" role="alert">{globalError}</p>
              </motion.div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="signup-name" className={labelClass}>Full Name</label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                placeholder="Jane Doe"
                autoComplete="name"
                className={`${inputClass} ${errors.name ? 'border-red-400' : ''}`}
                autoFocus
              />
              {errors.name && <p className="font-sans text-[13px] text-red-600 mt-1.5">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className={labelClass}>Email Address</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                placeholder="you@example.com"
                autoComplete="email"
                className={`${inputClass} ${errors.email ? 'border-red-400' : ''}`}
              />
              {errors.email && <p className="font-sans text-[13px] text-red-600 mt-1.5">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className={labelClass}>Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className={`${inputClass} pr-12 ${errors.password ? 'border-red-400' : ''}`}
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
              <PasswordStrength password={password} />
              {errors.password && <p className="font-sans text-[13px] text-red-600 mt-1.5">{errors.password}</p>}

              {/* Requirements */}
              {password && (
                <ul className="mt-3 space-y-1.5">
                  {requirements.map((r, i) => (
                    <li key={i} className={`flex items-center gap-2 font-sans text-[12px] transition-colors ${r.test(password) ? 'text-green-600' : 'text-brand-mid-grey'}`}>
                      <Check size={12} className={r.test(password) ? 'opacity-100' : 'opacity-30'} />
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" className={labelClass}>Confirm Password</label>
              <div className="relative">
                <input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })); }}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`${inputClass} pr-12 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-mid-grey hover:text-brand-black transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="font-sans text-[13px] text-red-600 mt-1.5">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-3 bg-brand-black text-brand-white rounded-full py-[18px] font-sans font-semibold text-[15px] hover:bg-brand-dark-grey transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-brand-white/40 border-t-brand-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-brand-border">
            <p className="font-sans text-[13px] text-brand-mid-grey">
              By creating an account you agree to our{' '}
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
