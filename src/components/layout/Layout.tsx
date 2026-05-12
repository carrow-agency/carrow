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
  const { cart } = useAppStore();
  const auth = useCurrentUserFromConvex();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrolled(currentScrollY > 20);
          
          if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            setNavVisible(false);
          } else {
            setNavVisible(true);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLinkActive = (path: string) => location.pathname === path;

  const navigateToHash = (hash: string) => {
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        const headerOffset = 100;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  };

  const navItems = [
    { name: 'Home', path: '/', type: 'link' },
    { name: 'Work', path: '/work', type: 'link' },
    { name: 'Services', path: '/services', type: 'link' },
    { name: 'Clients', path: '#brands', type: 'hash' },
    { name: 'Plans', path: '#plans', type: 'hash' },
    { name: 'About', path: '/brands', type: 'link' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-full'} ${scrolled ? 'bg-brand-white border-b border-brand-border h-[72px]' : 'bg-brand-black h-[72px]'} flex flex-col justify-center`}>
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-12 flex justify-between items-center">
          <Link to="/" className={`font-serif font-bold text-2xl transition-colors ${scrolled ? 'text-brand-black' : 'text-brand-white'}`}>Carrow</Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <button 
                key={item.name} 
                onClick={() => item.type === 'hash' ? navigateToHash(item.path) : navigate(item.path)}
                className={`text-sm font-medium transition-colors border-b pb-0.5 ${
                  isLinkActive(item.path)
                    ? scrolled ? 'text-brand-black border-brand-black' : 'text-brand-white border-brand-white'
                    : scrolled
                      ? 'text-brand-dark-grey border-transparent hover:text-brand-black hover:border-brand-black'
                      : 'text-brand-white/50 border-transparent hover:text-brand-white hover:border-brand-white'
                }`}
                aria-current={isLinkActive(item.path) ? 'page' : undefined}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {!auth || auth === undefined ? (
              <Link to="/login" className={`text-sm font-medium transition-colors ${scrolled ? 'text-brand-dark-grey hover:text-brand-black' : 'text-brand-white/50 hover:text-brand-white'}`}>Login</Link>
            ) : (
              <div className="flex items-center gap-6">
                <Link to={auth.role === 'admin' ? '/admin' : '/account'} className={`text-sm font-medium cursor-pointer transition-colors ${scrolled ? 'text-brand-dark-grey hover:text-brand-black' : 'text-brand-white/50 hover:text-brand-white'}`}>
                  {auth.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </Link>
                <button className="relative" onClick={() => navigate('/checkout')}>
                  <ShoppingBag size={20} className={scrolled ? 'text-brand-black' : 'text-brand-white'} />
                  {cart.length ? (
                    <span className={`absolute -top-1 -right-2 ${scrolled ? 'bg-brand-black text-brand-white' : 'bg-brand-white text-brand-black'} text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold`}>
                      {cart.length}
                    </span>
                  ) : null}
                </button>
              </div>
            )}
            <button onClick={() => navigateToHash('#plans')} className={`text-[14px] font-semibold rounded-full px-6 py-2.5 transition-all duration-300 ease-out active:scale-[0.98] border tracking-[0.05em] ${scrolled ? 'bg-brand-white text-brand-black border-brand-black hover:bg-transparent hover:text-brand-black' : 'bg-brand-black text-brand-white border-brand-black hover:bg-brand-white hover:text-brand-black'}`}>
              Get Started
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            {auth && auth !== undefined && (
               <button className="relative" onClick={() => navigate('/checkout')}>
                 <ShoppingBag size={20} className={scrolled ? 'text-brand-black' : 'text-brand-white'} />
                 {cart.length ? (
                   <span className={`absolute -top-1 -right-2 ${scrolled ? 'bg-brand-black text-brand-white' : 'bg-brand-white text-brand-black'} text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold`}>
                     {cart.length}
                   </span>
                 ) : null}
               </button>
            )}
            <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" aria-expanded={mobileMenuOpen}>
              <Menu size={24} className={scrolled ? 'text-brand-black' : 'text-brand-white'} />
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
              {[{ name: 'Home', path: '/', type: 'link' }, ...navItems].map(item => (
                <button 
                  key={item.name} 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (item.type === "hash") {
                      navigateToHash(item.path);
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className="font-serif text-4xl"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-8 flex flex-col items-center space-y-4">
                {!auth || auth === undefined ? (
                  <button 
                    onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} 
                    className="bg-brand-white text-brand-black px-8 py-3 rounded-full font-sans font-semibold text-lg transition-all duration-300 ease-out active:scale-[0.98]"
                  >
                    Login
                  </button>
                ) : (
                  <Link 
                    to={auth.role === 'admin' ? '/admin' : '/account'} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="bg-brand-white text-brand-black px-8 py-3 rounded-full font-sans font-semibold text-lg transition-all duration-300 ease-out active:scale-[0.98]"
                  >
                    {auth.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
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
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full max-w-[100vw]">
      <Navbar />
      <main className="flex-grow pt-[72px]"><Outlet /></main>
      <Footer />
    </div>
  );
}
