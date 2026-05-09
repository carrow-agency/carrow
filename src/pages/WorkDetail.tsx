import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { useWorks } from '../lib/useConvex';
import { DestinationCard } from '../components/ui/card';
import FadeIn from '../components/common/FadeIn';

interface Project {
  id?: string;
  title: string;
  category: string;
  url: string;
  client?: string;
}

export default function WorkDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  
  const { works } = useWorks() || { works: [] };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [companyId]);

  const defaultProjects: Project[] = [
    { title: 'Project One', category: 'Brand Identity', client: 'Aura Beauty', url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2370&auto=format&fit=crop" },
    { title: 'Project Two', category: 'Social Media', client: 'TechFlow Inc', url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2370&auto=format&fit=crop" },
    { title: 'Project Three', category: 'Campaigns', client: 'Glow Up Co', url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2699&auto=format&fit=crop" },
  ];

  const allWorks = works.length > 3 ? works : [...works, ...defaultProjects];

  // Find all works belonging to this company slug
  const companyWorks = allWorks.filter(w => {
    const slug = encodeURIComponent((w.client || w.title).toLowerCase().replace(/\s+/g, '-'));
    return slug === companyId;
  });

  const firstWork = companyWorks[0];
  const clientName = firstWork ? (firstWork.client || firstWork.title) : 'Unknown Brand';

  if (!companyWorks || companyWorks.length === 0) {
    return (
      <div className="bg-brand-white min-h-screen flex items-center justify-center flex-col">
        <h1 className="font-serif font-bold text-3xl mb-4">Brand not found</h1>
        <button onClick={() => navigate('/work')} className="text-brand-mid-grey underline">Back to Portfolio</button>
      </div>
    );
  }

  return (
    <div className="bg-brand-white min-h-screen">
      <section className="py-16 md:py-[120px] px-6 md:px-12 max-w-[1280px] mx-auto">
        <FadeIn>
           <button onClick={() => navigate('/work')} className="font-sans text-[14px] text-brand-mid-grey mb-8 flex items-center gap-2 hover:text-brand-black transition-colors">
              &larr; Back to all brands
           </button>
           <h1 className="font-serif font-bold text-[28px] md:text-[64px] text-brand-black mb-6">{clientName} Portfolio</h1>
           <p className="font-sans text-[18px] text-brand-mid-grey mb-16 max-w-[600px]">Creative assets, media, and branding completed for {clientName}.</p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companyWorks.map((p, i) => (
            <FadeIn key={p.id ?? i} delay={(i % 3) * 0.05} className="h-[400px]">
              <DestinationCard
                imageUrl={p.url || ''}
                category={p.category || 'Asset'}
                title={p.title}
                className="pointer-events-none"
                onClick={() => {}}
              />
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
