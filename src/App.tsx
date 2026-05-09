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
  <div className="min-h-screen bg-brand-white flex flex-col pt-[100px] px-6 md:px-12 max-w-[1280px] mx-auto w-full animate-pulse">
    {/* Skeleton Header */}
    <div className="flex justify-between items-center mb-16">
      <div className="w-32 h-8 bg-brand-mid-grey/20 rounded-md"></div>
      <div className="w-24 h-8 bg-brand-mid-grey/20 rounded-full"></div>
    </div>
    
    {/* Skeleton Hero Section */}
    <div className="w-3/4 md:w-1/2 h-16 bg-brand-mid-grey/20 rounded-md mb-6"></div>
    <div className="w-1/2 md:w-1/3 h-6 bg-brand-mid-grey/20 rounded-md mb-12"></div>
    
    {/* Skeleton Content Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="w-full h-64 bg-brand-mid-grey/20 rounded-2xl"></div>
      <div className="w-full h-64 bg-brand-mid-grey/20 rounded-2xl"></div>
      <div className="w-full h-64 bg-brand-mid-grey/20 rounded-2xl"></div>
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
