import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import FadeIn from '../common/FadeIn';

import { EXPERTISE_DATA } from '../../config/content';

export default function Expertise() {
  const [activeExpertise, setActiveExpertise] = useState(0);
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-[180px] bg-brand-white px-6 md:px-12 max-w-[1400px] mx-auto overflow-hidden">
      <FadeIn>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 md:mb-24 gap-8">
          <div>
            <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-6 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-brand-mid-grey"></span>
              Our Expertise
            </p>
            <h2 className="font-serif font-bold text-[28px] md:text-[64px] lg:text-[72px] text-brand-black leading-[1.05] tracking-tight max-w-[700px]">
              We Engineer Attention.
            </h2>
          </div>
          <p className="font-sans text-[16px] md:text-[18px] text-brand-mid-grey leading-[1.8] max-w-[400px] mb-4">
            We offer specialized capabilities that seamlessly integrate to become the ultimate growth engine for modern brands.
          </p>
        </div>
      </FadeIn>
      
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
        <div className="lg:w-1/2 flex flex-col lg:pt-8 w-full border-t border-brand-border">
          {EXPERTISE_DATA.map((exp, i) => (
            <div 
              key={i}
              className="group border-b border-brand-border py-8 md:py-12 cursor-pointer relative"
              onMouseEnter={() => setActiveExpertise(i)}
              onClick={() => navigate('/services')}
            >
              <div className="flex items-start gap-6 md:gap-8 relative z-10 pr-12">
                <span className="font-serif font-semibold text-[18px] md:text-[24px] text-brand-mid-grey group-hover:text-brand-black transition-colors duration-300 mt-2">
                  {exp.num}
                </span>
                <div className="w-full">
                  <h3 className="font-serif font-bold text-[24px] md:text-[48px] text-brand-black transition-transform duration-500 origin-left group-hover:scale-105">
                    {exp.title}
                  </h3>
                  <div className="overflow-hidden lg:hidden mt-6">
                    {activeExpertise === i && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         className="font-sans text-[16px] text-brand-mid-grey leading-[1.7] mb-6"
                       >
                         {exp.desc}
                       </motion.div>
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute right-4 md:right-8 top-12 md:top-16 -translate-y-1/2 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                <ArrowRight size={32} className="text-brand-black" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="hidden lg:block lg:w-1/2 relative h-full">
          <div className="sticky top-32 rounded-[32px] overflow-hidden bg-[#F7F7F7] h-[640px] flex flex-col justify-end w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeExpertise}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 w-full h-full"
              >
                <img src={EXPERTISE_DATA[activeExpertise]?.img} alt={EXPERTISE_DATA[activeExpertise]?.title ?? ''} className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent"></div>
                
                <div className="absolute inset-0 p-12 flex flex-col justify-end">
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="font-sans text-[18px] text-brand-white/90 leading-[1.8] max-w-[450px]"
                  >
                    {EXPERTISE_DATA[activeExpertise]?.desc}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
