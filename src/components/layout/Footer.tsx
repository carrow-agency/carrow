import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';
import { useSettings } from '../../lib/useConvex';
import { useAppStore } from '../../lib/store';

export default function Footer() {
  const navigate = useNavigate();
  const settings = useSettings();
  const { whatsappNumber } = useAppStore();

  const waNumber = settings?.general?.whatsapp || whatsappNumber;

  // Navigate to home page hash — ScrollToHash in App.tsx handles the scroll
  const goToHash = (hash: string) => {
    navigate('/' + hash);
  };

  return (
    <footer className="bg-brand-black text-brand-white pt-[80px] pb-[40px]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-12 mb-[80px]">
          <div className="md:col-span-5 lg:col-span-6">
            <h2 className="font-serif font-bold text-[28px] text-brand-white mb-2">Carrow</h2>
            <p className="font-sans italic text-[15px] text-brand-mid-grey mb-8">We build brands that stand out.</p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 border border-brand-dark-grey rounded-full flex items-center justify-center transition-colors hover:border-brand-white hover:text-brand-white text-brand-mid-grey"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 border border-brand-dark-grey rounded-full flex items-center justify-center transition-colors hover:border-brand-white hover:text-brand-white text-brand-mid-grey"
              >
                <Youtube size={18} />
              </a>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 border border-brand-dark-grey rounded-full flex items-center justify-center transition-colors hover:border-brand-white hover:text-brand-white text-brand-mid-grey"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          <div className="md:col-span-7 lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-sans font-semibold text-[12px] uppercase tracking-[0.2em] text-brand-mid-grey mb-6">Company</h4>
              <ul className="space-y-4">
                <li><Link to="/work" className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">Work</Link></li>
                <li><Link to="/services" className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">Services</Link></li>
                <li><button onClick={() => goToHash('#process')} className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">Process</button></li>
                <li><button onClick={() => goToHash('#brands')} className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">Clients</button></li>
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
                <li>
                  <button onClick={() => goToHash('#plans')} className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">
                    All Plans
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans font-semibold text-[12px] uppercase tracking-[0.2em] text-brand-mid-grey mb-6">Connect</h4>
              <ul className="space-y-4">
                <li>
                  <button onClick={() => goToHash('#faq')} className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">
                    FAQ
                  </button>
                </li>
                <li>
                  <Link to="/login" className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-[15px] text-brand-mid-grey hover:text-brand-white transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-dark-grey pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[13px] text-brand-mid-grey">&copy; {new Date().getFullYear()} Carrow. All rights reserved.</p>
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
