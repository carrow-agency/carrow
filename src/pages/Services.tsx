import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FadeIn from '../components/common/FadeIn';
import { SERVICES_DATA } from '../config/content';
interface Service {
  title: string;
  desc: string;
  bullets: string[];
  image: string;
}

export default function Services() {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = SERVICES_DATA;

  return (
    <div className="bg-brand-white min-h-screen">
      <section className="py-12 md:py-[120px] px-6 md:px-12 max-w-[1280px] mx-auto text-center border-b border-brand-border">
        <FadeIn>
           <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-4">What We Do</p>
           <h1 className="font-serif font-bold text-[28px] md:text-[72px] text-brand-black mb-6">Expertise Driven By Results.</h1>
           <p className="font-sans text-[18px] text-brand-mid-grey mb-8 max-w-[600px] mx-auto">We don't do everything. We do what we are best at, and we do it better than anyone else.</p>
        </FadeIn>
      </section>

      <section className="py-16 md:py-[140px] px-6 md:px-12 max-w-[1280px] mx-auto space-y-16 md:space-y-[140px]">
         {services.map((svc, i) => {
           const isEven = i % 2 === 0;
           return (
             <div key={i} className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16`}>
                <div className="w-full md:w-1/2">
                   <FadeIn delay={0.1}>
                     <div className="w-full aspect-[4/3] rounded-[20px] relative overflow-hidden group bg-brand-off-white">
                        <img 
                          src={svc.image} 
                          alt={svc.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/5 transition-colors duration-500"></div>
                     </div>
                   </FadeIn>
                </div>
                <div className="w-full md:w-1/2">
                   <FadeIn delay={0.2}>
                     <p className="font-sans font-semibold text-[12px] uppercase text-brand-mid-grey tracking-widest mb-4">0{i+1}</p>
                     <h2 className="font-serif font-bold text-[24px] md:text-[40px] text-brand-black mb-6">{svc.title}</h2>
                     <p className="font-sans text-[16px] text-brand-mid-grey leading-[1.8] mb-8">{svc.desc}</p>
                     <ul className="space-y-4">
                       {svc.bullets.map((b, bi) => (
                         <li key={bi} className="flex gap-4 items-center">
                           <span className="w-[6px] h-[6px] rounded-full bg-brand-black"></span>
                           <span className="font-sans font-medium text-[15px] text-brand-black">{b}</span>
                         </li>
                       ))}
                     </ul>
                   </FadeIn>
                </div>
             </div>
           );
         })}
      </section>

      <section className="py-16 md:py-[140px] bg-brand-off-white text-center">
        <FadeIn>
          <h2 className="font-serif font-bold text-[28px] md:text-[48px] text-brand-black mb-8">Ready to transform your brand?</h2>
          <button onClick={() => navigate('/#plans')} className="bg-brand-black text-brand-white rounded-full px-[48px] py-[18px] font-sans font-bold text-[16px] hover:bg-transparent hover:text-brand-black border border-brand-black transition-all duration-300 ease-out active:scale-[0.98]">See Our Plans</button>
        </FadeIn>
      </section>
    </div>
  );
}
