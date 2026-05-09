import { useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { useWorks } from '../lib/useConvex';
import { DestinationCard } from '../components/ui/card';
import FadeIn from '../components/common/FadeIn';

interface Project {
  id?: string;
  _id?: string;
  title: string;
  category: string;
  url: string;
  client?: string;
}

export default function OurWork() {
  const navigate = useNavigate();
  const works = useWorks() ?? [];
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const defaultProjects: Project[] = [
    { title: 'Project One', category: 'Brand Identity', client: 'Aura Beauty', url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2370&auto=format&fit=crop" },
    { title: 'Project Two', category: 'Social Media', client: 'TechFlow Inc', url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2370&auto=format&fit=crop" },
    { title: 'Project Three', category: 'Campaigns', client: 'Glow Up Co', url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2699&auto=format&fit=crop" },
  ];

  const allWorks = works.length > 3 ? works : [...works, ...defaultProjects];

  // Group by client/company
  const companiesMap = allWorks.reduce((acc, work) => {
    const clientName = work.client || work.title; // fallback to title if no client
    if (!clientName) return acc;
    if (!acc[clientName]) {
      acc[clientName] = work;
    }
    return acc;
  }, {} as Record<string, Project>);

  const companies = Object.values(companiesMap);

  return (
    <div className="bg-brand-white min-h-screen">
      <section className="py-16 md:py-[120px] px-6 md:px-12 max-w-[1280px] mx-auto">
        <FadeIn>
           <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-4 text-center">Our Portfolio</p>
           <h1 className="font-serif font-bold text-[28px] md:text-[72px] text-brand-black mb-6 text-center">Brands We've Built.</h1>
           <p className="font-sans text-[18px] text-brand-mid-grey mb-16 text-center max-w-[600px] mx-auto">A curated selection of companies we've helped grow. Click to see the specific works.</p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map((p, i) => {
            const companySlug = encodeURIComponent((p.client || p.title).toLowerCase().replace(/\s+/g, '-'));
            return (
              <FadeIn key={companySlug || i} delay={(i % 3) * 0.05} className="h-[400px]">
                <DestinationCard
                  imageUrl={p.url || ''}
                  category="Brand Partner"
                  title={p.client || p.title}
                  className="cursor-pointer"
                  onClick={() => navigate(`/work/${companySlug}`)}
                />
              </FadeIn>
            );
          })}
        </div>
      </section>
      
      <section className="py-16 md:py-[120px] bg-brand-black text-brand-white text-center">
        <h2 className="font-serif font-bold text-[28px] md:text-[48px] mb-8">Want your brand here?</h2>
        <button onClick={() => navigate('/#plans')} className="bg-brand-white text-brand-black rounded-full px-[48px] py-[18px] font-sans font-bold text-[16px] hover:bg-opacity-90 transition-colors">Start Your Project</button>
      </section>
    </div>
  );
}
