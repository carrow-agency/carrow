import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import React from 'react';
import FadeIn from '../common/FadeIn';

const ProcessPhase: React.FC<{ step: any, i: number, processProgress: any }> = ({ step, i, processProgress }) => {
  const opacity = useTransform(processProgress, 
    [i * 0.25 - 0.1, i * 0.25 + 0.05], 
    [0.2, 1]
  );
  const x = useTransform(processProgress, 
    [i * 0.25 - 0.1, i * 0.25 + 0.05], 
    [20, 0]
  );
  
  return (
    <motion.div 
      style={{ opacity, x }} 
      className="group relative pb-20 last:pb-0"
    >
      <div className="absolute inset-0 mx-0 md:mx-0 -my-8 bg-brand-white/[0.02] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div 
        id={`phase-${i}`}
        className="relative z-10 transition-transform duration-500 group-hover:translate-x-2 md:group-hover:translate-x-4 cursor-pointer"
        onClick={() => {
          document.getElementById(`phase-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      >
        <div className="font-sans font-medium text-[13px] text-brand-mid-grey tracking-widest uppercase mb-4 flex items-center gap-4">
          Phase {step.n}
        </div>
        <h3 className="font-serif font-bold text-[24px] md:text-[40px] text-brand-white mb-4 transition-colors duration-300">{step.t}</h3>
        <p className="font-sans text-[16px] md:text-[18px] text-[#A3A3A3] leading-[1.8] max-w-[500px]">{step.d}</p>
      </div>
    </motion.div>
  );
}

export default function Process() {
  const processRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: processRef,
    offset: ["start center", "end center"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const processSteps = [
    { n: '01', t: 'Discovery & Audit', d: 'We tear down your current positioning, analyze market gaps, and identify exact points of leverage before strategy begins.' },
    { n: '02', t: 'Strategic Blueprint', d: 'We formulate a bold, multi-channel roadmap. Clear KPIs, distinct brand voice, and a content architecture built to convert.' },
    { n: '03', t: 'Creative Execution', d: 'Our design and copy teams build the assets—striking, scroll-stopping, and perfectly aligned with the strategic blueprint.' },
    { n: '04', t: 'Deployment & Scale', d: 'We launch, measure relentlessly, and iterate. We kill what doesn\'t work and pour fuel on what does.' },
  ];

  return (
    <section id="process" className="py-16 md:py-[160px] bg-brand-black px-6 md:px-12 relative overflow-hidden" ref={processRef}>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-brand-dark-grey"></div>
      <div className="max-w-[1280px] mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
          <div className="lg:w-1/3">
            <FadeIn className="lg:sticky lg:top-32">
               <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-[#A3A3A3] mb-6 flex items-center gap-4">
                 <span className="w-8 h-[1px] bg-[#A3A3A3]"></span>
                 Our Methodology
               </p>
               <h2 className="font-serif font-bold text-[32px] md:text-[64px] text-brand-white leading-[1.1] tracking-tight mb-8">
                 Engineered<br />for Impact.
               </h2>
               <p className="font-sans text-[16px] text-brand-mid-grey leading-[1.8] max-w-[400px]">
                 We don't guess. We deploy a rigorous, proven architecture to ensure every brand we touch scales predictably and powerfully.
               </p>
               
               <div 
                 className="mt-12 h-[300px] md:h-[400px] overflow-hidden relative"
                 style={{ 
                   WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', 
                   maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' 
                 }}
               >
                 <motion.div 
                   className="flex flex-col gap-4"
                   animate={{ y: ["0%", "-50%"] }}
                   transition={{ ease: "linear", duration: 15, repeat: Infinity }}
                 >
                   {[1, 2].map((groupIndex) => (
                     <React.Fragment key={groupIndex}>
                       <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#333] flex items-center gap-4 hover:border-[#555] transition-colors">
                         <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden">
                           <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=100&h=100" className="w-full h-full object-cover" alt="Data" />
                         </div>
                         <div>
                           <div className="text-brand-white font-medium text-[15px] mb-0.5">Data Driven ROI</div>
                           <div className="text-[#888] text-[13px]">Advanced Analytics</div>
                         </div>
                       </div>
                       
                       <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#333] flex items-center gap-4 hover:border-[#555] transition-colors">
                         <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden">
                           <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=100&h=100" className="w-full h-full object-cover" alt="Growth" />
                         </div>
                         <div>
                           <div className="text-brand-white font-medium text-[15px] mb-0.5">Omnichannel Growth</div>
                           <div className="text-[#888] text-[13px]">Paid & Organic Scaling</div>
                         </div>
                       </div>
                     </React.Fragment>
                   ))}
                 </motion.div>
               </div>
            </FadeIn>
          </div>
          
          <div className="lg:w-2/3 pt-8 lg:pt-0">
             <div className="space-y-0 relative ml-6 md:ml-12 lg:ml-0 pl-10 md:pl-20 py-8">
               <motion.div 
                 className="absolute left-[0px] md:-left-[0.5px] top-0 w-[2px] bg-brand-white origin-top z-10"
                 style={{ height: lineHeight }}
               >
                 <div className="absolute left-1/2 -translate-x-1/2 top-full -translate-y-1/2 w-[11px] h-[11px] bg-brand-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
               </motion.div>

              {processSteps.map((step, i) => (
                <ProcessPhase key={i} step={step} i={i} processProgress={smoothProgress} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
