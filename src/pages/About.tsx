import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FadeIn from '../components/common/FadeIn';

function StatCounter({ end, suffix }: { end: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
  
  useEffect(() => {
    if (inView) {
      let startTime: number;
      const duration = 1500;
      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [inView, end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function About() {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-brand-white min-h-screen">
      <section className="py-16 md:py-[140px] px-6 md:px-12 max-w-[1280px] mx-auto text-center border-b border-brand-border">
        <FadeIn>
           <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-8">Who We Are</p>
           <h1 className="font-serif italic text-[24px] md:text-[80px] text-brand-black leading-tight max-w-[900px] mx-auto mb-8 md:mb-16">
             "We don't just build brands. We build movements that demand attention and drive culture forward."
           </h1>
           <p className="font-sans text-[18px] text-brand-mid-grey max-w-[600px] mx-auto">
             Carrow was founded on a simple premise: most marketing is invisible. We exist to make sure yours isn't. We are a collective of strategists, creatives, and data-obsessives.
           </p>
        </FadeIn>
      </section>

      {/* Stats Counter */}
      <section className="py-16 md:py-[140px] bg-brand-black px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-16">
             <FadeIn delay={0}>
               <div className="font-serif font-bold text-[48px] md:text-[96px] text-brand-white leading-none mb-4"><StatCounter end={150} suffix="+" /></div>
               <div className="font-sans font-semibold text-[13px] text-brand-mid-grey uppercase tracking-[0.15em]">Brands Transformed</div>
             </FadeIn>
             <FadeIn delay={0.1}>
               <div className="font-serif font-bold text-[48px] md:text-[96px] text-brand-white leading-none mb-4"><StatCounter end={98} suffix="%" /></div>
               <div className="font-sans font-semibold text-[13px] text-brand-mid-grey uppercase tracking-[0.15em]">Client Retention</div>
             </FadeIn>
             <FadeIn delay={0.2}>
               <div className="font-serif font-bold text-[48px] md:text-[96px] text-brand-white leading-none mb-4"><StatCounter end={10} suffix="M+" /></div>
               <div className="font-sans font-semibold text-[13px] text-brand-mid-grey uppercase tracking-[0.15em]">Audience Reached</div>
             </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-[140px] px-6 md:px-12 max-w-[1280px] mx-auto">
         <FadeIn>
           <h2 className="font-serif font-bold text-[28px] md:text-[48px] text-brand-black mb-16 text-center">Our Core Values.</h2>
         </FadeIn>
         <div className="grid md:grid-cols-2 gap-8">
            {[
              { t: 'Obsessive Craft', d: 'Good enough isn\'t in our vocabulary. Every pixel, every word, and every frame is carefully considered.' },
              { t: 'Radical Honesty', d: 'We don\'t sugarcoat. If a strategy won\'t work, we tell you. We partner with our clients, we don\'t just yes-man them.' },
              { t: 'Data-Backed Creative', d: 'Creativity without data is just art. We use rigorous analytics to inform our wildest concepts.' },
              { t: 'Relentless Iteration', d: 'The digital landscape changes daily. We adapt, optimize, and iterate faster than the competition.' }
            ].map((v, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="border border-brand-border rounded-[20px] p-6 md:p-[48px] h-full hover:shadow-[0_2px_20px_rgba(0,0,0,0.05)] transition-shadow">
                   <h3 className="font-serif font-bold text-[28px] text-brand-black mb-4">{v.t}</h3>
                   <p className="font-sans text-[16px] text-brand-mid-grey leading-[1.8]">{v.d}</p>
                </div>
              </FadeIn>
            ))}
         </div>
      </section>

      <section className="py-16 md:py-[140px] bg-brand-off-white px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto">
          <FadeIn>
             <h2 className="font-serif font-bold text-[28px] md:text-[48px] text-brand-black mb-16 text-center">The Leadership.</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { n: 'Jane Doe', r: 'Founder & Strategy Director' },
              { n: 'John Smith', r: 'Creative Director' },
              { n: 'Emma Watson', r: 'Head of Analytics' }
            ].map((t, i) => (
               <FadeIn key={i} delay={i * 0.1} className="text-center flex flex-col items-center">
                 <div className="w-[160px] h-[160px] rounded-full bg-brand-black mb-8 relative overflow-hidden flex items-center justify-center">
                   <div className="noise-overlay opacity-40"></div>
                 </div>
                 <h4 className="font-sans font-semibold text-[20px] text-brand-black mb-1">{t.n}</h4>
                 <p className="font-sans text-[15px] text-brand-mid-grey">{t.r}</p>
               </FadeIn>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
