import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import React from 'react';
import { usePlans, useWorks } from '../lib/useConvex';

// Components
import FadeIn from '../components/common/FadeIn';
import Hero from '../components/home/Hero';
import Marquee from '../components/home/Marquee';
import Expertise from '../components/home/Expertise';
import Process from '../components/home/Process';
import PlansPreview from '../components/home/PlansPreview';
import FAQ from '../components/home/FAQ';
import ExpandOnHover from '../components/ui/expand-cards';
import { Button } from '../components/ui/button';

export default function Home() {
  const navigate = useNavigate();
  const store = useAppStore();
  const plans = usePlans() ?? [];
  const { works } = useWorks() || { works: [] };
  const clientsFromDb = Array.from(new Set(works.map(w => w.client).filter(Boolean)));
  const marqueeClients = clientsFromDb.length > 0 ? clientsFromDb : ['Emis', 'Rumis', 'Shawok', 'Croustile', 'Smash Foundation'];
  const whatsappNumber = store.settings?.general?.whatsapp || store.whatsappNumber;

  const navigateToHash = (hash: string) => {
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-brand-white overflow-x-hidden w-full max-w-[100vw]">
      <Hero navigateToHash={navigateToHash} />
      
      <div className="h-px w-full bg-brand-border"></div>
      
      <Marquee />

      <Expertise />

      <Process />

      {/* Our Work - Masonry/Carousel */}
      <section id="work" className="py-16 md:py-[140px] bg-brand-white px-6 md:px-12 max-w-[1280px] mx-auto">
        <FadeIn>
          <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-4">Our Work</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-4 md:gap-6">
            <h2 className="font-serif font-bold text-[28px] md:text-[56px] text-brand-black">Work That Speaks for Itself.</h2>
            <p className="font-sans text-[15px] md:text-[17px] text-brand-mid-grey md:mb-4">A selection of brands we've helped grow.</p>
          </div>
        </FadeIn>

        <div className="mb-16">
          <ExpandOnHover />
        </div>
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/work')} className="font-sans font-semibold text-[15px] text-brand-black hover:opacity-70 transition-opacity flex items-center justify-center mx-auto gap-2">
            View All Work <ArrowRight size={16}/>
          </Button>
        </div>
      </section>

      {/* Brands Section */}
      <section id="brands" className="py-16 md:py-[140px] bg-brand-off-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 text-center">
<FadeIn>
              <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-4">Our Clients</p>
              <h2 className="font-serif font-bold text-[32px] md:text-[56px] text-brand-black mb-16">Brands Who Trust Us.</h2>
            </FadeIn>
            
            <div className="flex flex-col md:flex-row justify-center items-center md:-space-x-8 mb-[100px]">
              {['Rumis', 'Shawok', 'Croustile'].map((brand, i) => (
                <span key={i} className="font-serif font-bold text-[48px] md:text-[140px] tracking-tighter mix-blend-multiply text-brand-black opacity-[0.08] hover:opacity-100 transition-opacity duration-300 select-none cursor-pointer whitespace-nowrap">{brand}</span>
              ))}
            </div>
         </div>

         <div className="h-[80px] mb-[100px] flex items-center relative mask-image-[linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
           <motion.div 
             animate={{ x: [0, -1000] }} 
             transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
             className="flex whitespace-nowrap gap-16 px-8"
           >
             {Array(10).fill(marqueeClients).flat().map((b, i) => (
                <span key={i} className="font-sans font-bold text-[18px] text-brand-black">{b as string}</span>
             ))}
           </motion.div>
        </div>
      </section>

      {/* Why Us / Differentiators */}
      <section className="py-16 md:py-[140px] bg-brand-white px-6 md:px-12 max-w-[1280px] mx-auto">
        <FadeIn>
          <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-4">Why Us</p>
          <h2 className="font-serif font-bold text-[28px] md:text-[64px] text-brand-black mb-8 md:mb-16 leading-[1.05] tracking-tight max-w-[800px]">What Makes Carrow Different.</h2>
        </FadeIn>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: "We Don't Copy. We Create.", d: "Original brand languages built from scratch, not recycled formulas.", img: "/images/original_brands.webp" },
            { t: "Data Without the Jargon.", d: "Every decision is insight-driven. Every result is measurable.", img: "/images/data_jargon.webp" },
            { t: "Your Brand Is Our Brand.", d: "We work as your in-house creative team, not an outside vendor.", img: "/images/inhouse_creative.webp" },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="group relative bg-brand-black rounded-[24px] overflow-hidden min-h-[400px] flex flex-col justify-end p-8">
                <div className="absolute inset-0">
                   <img src={item.img} loading="lazy" decoding="async" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" alt={item.t} />
                   <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-transparent"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-6 bg-white/10 backdrop-blur-sm flex-shrink-0">
                     <span className="font-serif font-bold text-brand-white">0{i+1}</span>
                  </div>
                  <h3 className="font-serif font-bold text-[28px] md:text-[32px] text-brand-white mb-4">{item.t}</h3>
                  <p className="font-sans text-[16px] text-brand-white/80 leading-[1.8]">{item.d}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <PlansPreview plans={plans} whatsappNumber={whatsappNumber} />
      
      <FAQ />

      {/* Final Call to Action */}
      <section className="py-16 md:py-[160px] bg-brand-black text-brand-white px-6 md:px-12 text-center relative overflow-hidden">
        <div className="noise-overlay"></div>
        <div className="max-w-[800px] mx-auto relative z-10">
          <FadeIn>
            <h2 className="font-serif font-bold text-[32px] md:text-[72px] leading-tight mb-6">Your Brand Deserves to Be Remembered.</h2>
            <p className="font-sans text-[17px] text-brand-mid-grey mb-12">Join the brands that chose bold.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => navigateToHash('#plans')} className="bg-brand-white text-brand-black rounded-full px-[48px] py-[18px] font-sans font-semibold text-[16px] hover:bg-transparent hover:text-brand-white hover:border-brand-white border border-transparent transition-all duration-300 ease-out active:scale-[0.98]">Get Started</button>
              <button onClick={() => navigate('/work')} className="bg-transparent text-brand-white rounded-full px-[48px] py-[18px] font-sans font-semibold text-[16px] border border-brand-white hover:bg-brand-white hover:text-brand-black transition-all duration-300 ease-out active:scale-[0.98]">See Our Work</button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
