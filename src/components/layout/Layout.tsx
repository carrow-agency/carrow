import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import React from 'react';

import { useAppStore } from '../../lib/store';
import { useCurrentUserFromConvex } from '../../lib/useConvex';
import { ShoppingBag, X, Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Footer from './Footer';

function Navbar() {
  
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthOpen, cart } = useAppStore();
  const auth = useCurrentUserFromConvex();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLinkActive = (path: string) => location.pathname === path;

  const navigateToHash = (hash: string) => {
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-full'} ${scrolled ? 'bg-brand-white border-b border-brand-border h-[72px]' : 'bg-transparent h-[72px]'} flex flex-col justify-center`}>
        <div className="max-w-[1280px] w-full mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link to="/" className="font-serif font-bold text-2xl text-brand-black">Carrow</Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {['Work', 'Services', 'Process', 'Brands', 'Plans', 'FAQ'].map(item => {
              const isHash = ['Process', 'Brands', 'Plans', 'FAQ'].includes(item);
              const path = isHash ? '/#' + item.toLowerCase() : '/' + item.toLowerCase();
              return (
                <button 
                  key={item} 
                  onClick={() => isHash ? navigateToHash('#' + item.toLowerCase()) : navigate(path)}
                  className={`text-sm font-medium transition-colors border-b hover:text-brand-black hover:border-brand-black pb-0.5 ${
                    isLinkActive(path) ? 'text-brand-black border-brand-black' : 'text-brand-dark-grey border-transparent'
                  }`}
                  aria-current={isLinkActive(path) ? 'page' : undefined}
                >
                  {item}
                </button>
              )
            })}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {!auth || auth === undefined ? (
              <button onClick={() => setAuthOpen(true)} className="text-sm font-medium text-brand-dark-grey hover:text-brand-black">Login</button>
            ) : (
              <div className="flex items-center gap-6">
                <Link to={auth.role === 'admin' ? '/admin' : '/account'} className="text-sm font-medium text-brand-dark-grey hover:text-brand-black cursor-pointer">
                  {auth.role === 'admin' ? 'Admin Panel' : 'My Account'}
                </Link>
                <button className="relative" onClick={() => navigate('/checkout')}>
                  <ShoppingBag size={20} className="text-brand-black" />
                  {cart.length ? (
                    <span className="absolute -top-1 -right-2 bg-brand-black text-brand-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {cart.length}
                    </span>
                  ) : null}
                </button>
              </div>
            )}
            <button onClick={() => navigateToHash('#plans')} className="bg-brand-black text-brand-white text-[14px] font-semibold rounded-full px-6 py-2.5 transition-colors border border-brand-black hover:bg-brand-white hover:text-brand-black tracking-[0.05em]">
              Get Started
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            {auth && auth !== undefined && (
               <button className="relative" onClick={() => navigate('/checkout')}>
                 <ShoppingBag size={20} className="text-brand-black" />
                 {cart.length ? (
                   <span className="absolute -top-1 -right-2 bg-brand-black text-brand-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                     {cart.length}
                   </span>
                 ) : null}
               </button>
            )}
            <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" aria-expanded={mobileMenuOpen}>
              <Menu size={24} className="text-brand-black" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-black z-[100] flex flex-col justify-center items-center"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="absolute top-6 right-6 text-brand-white">
              <X size={32} />
            </button>
            <div className="flex flex-col items-center space-y-6 text-brand-white">
              {['Home', 'Work', 'Services', 'Process', 'Brands', 'Plans', 'FAQ'].map(item => {
                const isHash = ['Process', 'Brands', 'Plans', 'FAQ'].includes(item);
                const path = item === 'Home' ? '/' : isHash ? '/#' + item.toLowerCase() : '/' + item.toLowerCase();
                return (
                  <button 
                    key={item} 
                    onClick={() => { setMobileMenuOpen(false); isHash ? navigateToHash('#' + item.toLowerCase()) : navigate(path); }}
                    className="font-serif text-4xl"
                  >
                    {item}
                  </button>
                )
              })}
              <div className="pt-8 flex flex-col items-center space-y-4">
                {!auth || auth === undefined ? (
                  <button 
                    onClick={() => { setMobileMenuOpen(false); setAuthOpen(true); }} 
                    className="bg-brand-white text-brand-black px-8 py-3 rounded-full font-sans font-semibold text-lg"
                  >
                    Login
                  </button>
                ) : (
                  <Link 
                    to={auth.role === 'admin' ? '/admin' : '/account'} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="bg-brand-white text-brand-black px-8 py-3 rounded-full font-sans font-semibold text-lg"
                  >
                    {auth.role === 'admin' ? 'Admin Panel' : 'My Account'}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return <div className="min-h-screen bg-gray-50"><Outlet /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[72px]"><Outlet /></main>
      <Footer />
    </div>
  );
}
