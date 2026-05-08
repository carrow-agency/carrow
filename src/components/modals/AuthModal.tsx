import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../lib/store';
import { useAuthFunctions } from '../../lib/useConvex';


export function AuthModal() {
  const navigate = useNavigate();
  const { setAuthOpen, cart } = useAppStore();
  const { signIn, signUp } = useAuthFunctions();
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!loginEmail.trim()) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }
    if (!validateEmail(loginEmail)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      setLoading(false);
      return;
    }

    const result = await signIn(loginEmail, loginPassword);
    if (!result.success) {
      setError(result.error || 'Invalid credentials. Please try again.');
      setLoading(false);
      return;
    }

    setAuthOpen(false);
    if (cart && cart.length > 0) {
      navigate('/checkout');
    } else {
      navigate('/account');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!signupName.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }
    if (signupName.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      setLoading(false);
      return;
    }
    if (!signupEmail.trim()) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }
    if (!validateEmail(signupEmail)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!signupPassword) {
      setError('Please enter a password.');
      setLoading(false);
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    if (!/[A-Za-z]/.test(signupPassword) || !/[0-9]/.test(signupPassword)) {
      setError('Password must contain both letters and numbers.');
      setLoading(false);
      return;
    }

    const result = await signUp(signupEmail, signupPassword, signupName);
    if (!result.success) {
      setError(result.error || 'Unable to create account. Please try again.');
      setLoading(false);
      return;
    }

    setAuthOpen(false);
    if (cart && cart.length > 0) {
      navigate('/checkout');
    } else {
      navigate('/account');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-black/60 backdrop-blur-[2px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }} 
        className="bg-brand-white rounded-[24px] overflow-hidden w-full max-w-md relative shadow-2xl"
      >
<button 
          onClick={() => setAuthOpen(false)} 
          className="absolute top-4 right-4 p-2 bg-[#F7F7F7] hover:bg-[#EBEBEB] rounded-full transition-colors z-10 text-brand-black"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        <div className="p-8">
           <div className="flex border-b border-brand-border mb-8" role="tablist">
             <button 
               onClick={() => setAuthTab('signin')} 
               className={`pb-4 flex-1 font-sans font-semibold text-[16px] border-b-[2px] transition-colors ${authTab === 'signin' ? 'border-brand-black text-brand-black' : 'border-transparent text-brand-mid-grey'}`}
               role="tab"
               aria-selected={authTab === 'signin'}
               aria-controls="signin-panel"
             >
               Sign In
             </button>
             <button 
               onClick={() => setAuthTab('signup')} 
               className={`pb-4 flex-1 font-sans font-semibold text-[16px] border-b-[2px] transition-colors ${authTab === 'signup' ? 'border-brand-black text-brand-black' : 'border-transparent text-brand-mid-grey'}`}
               role="tab"
               aria-selected={authTab === 'signup'}
               aria-controls="signup-panel"
             >
               Create Account
             </button>
           </div>
{authTab === 'signin' ? (
              <>
                <form onSubmit={handleSignIn} className="space-y-4" role="tabpanel" id="signin-panel" aria-label="Sign in form">
                  {error && <p className="text-sm text-red-600 font-sans" role="alert">{error}</p>}
                  <div className="space-y-2">
                    <label htmlFor="login-email" className="sr-only">Email address</label>
                    <input 
                      id="login-email"
                      type="email" 
                      value={loginEmail} 
                      onChange={(e) => setLoginEmail(e.target.value)} 
                      required 
                      placeholder="your@email.com" 
                      className="w-full bg-[#f9f9f9] border border-brand-border rounded-[12px] px-5 py-3.5 font-sans focus:outline-none focus:border-brand-black transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="login-password" className="sr-only">Password</label>
                    <input 
                      id="login-password"
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required 
                      placeholder="Password" 
                      className="w-full bg-[#f9f9f9] border border-brand-border rounded-[12px] px-5 py-3.5 font-sans focus:outline-none focus:border-brand-black transition-colors" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-brand-black text-brand-white rounded-full py-4 font-sans font-semibold text-[16px] mt-4 hover:bg-brand-dark-grey transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
               </form>
             </>
            ) : (
              <>
                <form onSubmit={handleSignUp} className="space-y-4" role="tabpanel" id="signup-panel" aria-label="Create account form">
                  {error && <p className="text-sm text-red-600 font-sans" role="alert">{error}</p>}
                  <div className="space-y-2">
                    <label htmlFor="signup-name" className="sr-only">Full Name</label>
                    <input 
                      id="signup-name"
                      type="text" 
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required 
                      placeholder="Full Name" 
                      className="w-full bg-[#f9f9f9] border border-brand-border rounded-[12px] px-5 py-3.5 font-sans focus:outline-none focus:border-brand-black transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-email" className="sr-only">Email Address</label>
                    <input 
                      id="signup-email"
                      type="email" 
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required 
                      placeholder="Email Address" 
                      className="w-full bg-[#f9f9f9] border border-brand-border rounded-[12px] px-5 py-3.5 font-sans focus:outline-none focus:border-brand-black transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="sr-only">Password</label>
                    <input 
                      id="signup-password"
                      type="password" 
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required 
                      placeholder="Password (min 6 characters)" 
                      className="w-full bg-[#f9f9f9] border border-brand-border rounded-[12px] px-5 py-3.5 font-sans focus:outline-none focus:border-brand-black transition-colors" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-brand-black text-brand-white rounded-full py-4 font-sans font-semibold text-[16px] mt-4 hover:bg-brand-dark-grey transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
               </form>
             </>
            )}
        </div>
      </motion.div>
    </div>
  );
}
