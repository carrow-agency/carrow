import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  const navigateToHash = (hash: string) => {
    if (window.location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-brand-black text-brand-white pt-[80px] pb-[40px]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-12 mb-[80px]">
          <div className="md:col-span-5 lg:col-span-6">
            <h2 className="font-serif font-bold text-[28px] text-brand-white mb-2">Carrow</h2>
            <p className="font-sans italic text-[15px] text-brand-mid-grey mb-8">We build brands that stand out.</p>
            <div className="flex gap-4">
              {[Instagram, Youtube, MessageCircle].map((Icon, idx) => (
                <button key={idx} className="w-10 h-10 border border-brand-dark-grey rounded-full flex items-center justify-center transition-colors hover:border-brand-white hover:text-brand-white text-brand-mid-grey">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-7 lg:col-span-6 grid grid-cols-3 gap-8">
            <div>
              <h4 className="font-sans font-semibold text-[12px] uppercase tracking-[0.2em] text-brand-mid-grey mb-6">Company</h4>
              <ul className="space-y-4">
                {['Work', 'Services', 'Process'].map(item => (
                  <li key={item}>
                    <button onClick={() => item === 'Process' ? navigateToHash('#process') : navigate(`/${item.toLowerCase()}`)} className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-sans font-semibold text-[12px] uppercase tracking-[0.2em] text-brand-mid-grey mb-6">Plans</h4>
              <ul className="space-y-4">
                {['Basic', 'Pro', 'Enterprise'].map(item => (
                  <li key={item}>
                    <Link to={`/plan/${item.toLowerCase()}`} className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-sans font-semibold text-[12px] uppercase tracking-[0.2em] text-brand-mid-grey mb-6">Connect</h4>
              <ul className="space-y-4">
                <li><button onClick={() => navigateToHash('#faq')} className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">FAQ</button></li>
                <li><button className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">Login</button></li>
                <li><button className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">Sign Up</button></li>
                <li><a href="#" className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">WhatsApp</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-dark-grey pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[13px] text-brand-mid-grey">© {new Date().getFullYear()} Carrow. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="font-sans text-[13px] text-brand-mid-grey hover:text-brand-white transition-colors">Privacy Policy</Link>
            <span className="text-brand-dark-grey">·</span>
            <Link to="/terms-and-conditions" className="font-sans text-[13px] text-brand-mid-grey hover:text-brand-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
