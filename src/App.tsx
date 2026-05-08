import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AuthModal } from './components/modals/AuthModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import React, { useEffect, Suspense, lazy, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './lib/store';
import { useCurrentUser, useUsers, useCurrentUserFromConvex } from './lib/useConvex';

const Home = lazy(() => import('./pages/Home'));
const PlanDetail = lazy(() => import('./pages/PlanDetail'));
const OurWork = lazy(() => import('./pages/OurWork'));
const WorkDetail = lazy(() => import('./pages/WorkDetail'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Account = lazy(() => import('./pages/Account'));
const Admin = lazy(() => import('./pages/Admin'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AdminWrapper() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('192.168') ||
                      window.location.hostname.includes('.local');
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const adminPw = import.meta.env.VITE_ADMIN_PASSWORD || 'admin@123';
    if (password === adminPw) {
      setAuthenticated(true);
      localStorage.setItem('carrow_admin_auth', 'true');
    } else {
      setError('Invalid password');
    }
  }, [password]);
  
  React.useEffect(() => {
    const stored = localStorage.getItem('carrow_admin_auth');
    if (stored === 'true') {
      setAuthenticated(true);
    }
  }, []);
  
  if (!isLocalhost) {
    return <Navigate to="/" replace />;
  }
  
  if (authenticated) {
    return <Admin />;
  }
  
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-8 w-full max-w-md">
        <h2 className="font-serif text-2xl text-white mb-2">Admin Access</h2>
        <p className="text-[#666] text-sm mb-6">Enter password to access admin panel</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isLocalhost ? "Any password (localhost)" : "Enter admin password"}
            className="w-full bg-[#1F1F1F] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-white/30 mb-4"
          />
          <button
            type="submit"
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Access Panel
          </button>
        </form>
      </div>
    </div>
  );
}

const Loading = () => (
  <div className="min-h-screen bg-brand-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-brand-border border-t-brand-black rounded-full animate-spin"></div>
      <p className="font-sans text-brand-mid-grey">Loading...</p>
    </div>
  </div>
);

export default function App() {
  const isAuthOpen = useAppStore((state) => state.isAuthOpen);
  
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/account" element={<Account />} />
            <Route path="/admin/*" element={<AdminWrapper />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/plan/:planId" element={<PlanDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/work" element={<OurWork />} />
              <Route path="/work/:companyId" element={<WorkDetail />} />
              <Route path="/services" element={<Services />} />
              <Route path="/brands" element={<About />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<Terms />} />
            </Route>
          </Routes>
        </Suspense>
        
        <AnimatePresence>
          {isAuthOpen && <AuthModal />}
        </AnimatePresence>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
