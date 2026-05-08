import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthModal } from './components/modals/AuthModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import { useEffect, Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './lib/store';
import { useCurrentUser, useCurrentUserFromConvex } from './lib/useConvex';

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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AdminWrapper() {
  const auth = useCurrentUser();
  const currentUser = useCurrentUserFromConvex();

  if (auth.isLoading) {
    return <Loading />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!currentUser) {
    return <Loading />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/account" replace />;
  }

  return <Admin />;
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
