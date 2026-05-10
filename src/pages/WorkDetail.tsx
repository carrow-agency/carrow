import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorks, useWorkMediaBatch } from '../lib/useConvex';
import FadeIn from '../components/common/FadeIn';

export default function WorkDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const { works } = useWorks() || { works: [] };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [companyId]);

  // All works matching this brand slug
  const companyWorks = useMemo(
    () =>
      works.filter((w) => {
        const slug = encodeURIComponent(
          (w.client || w.title).toLowerCase().replace(/\s+/g, '-')
        );
        return slug === companyId;
      }),
    [works, companyId]
  );

  const firstWork = companyWorks[0];
  const clientName = firstWork ? firstWork.client || firstWork.title : 'Unknown Brand';

  // Fetch extra media for all works belonging to this brand
  const workIds = useMemo(() => companyWorks.map((w) => w.id).filter(Boolean) as string[], [companyWorks]);
  const workMediaMap = useWorkMediaBatch(workIds);

  // Build flat list: cover image + all workMedia, deduped
  const allMedia = useMemo(() => {
    const items: { id: string; url: string; title: string; category: string }[] = [];
    for (const w of companyWorks) {
      // Cover image
      if (w.url) {
        items.push({ id: `cover-${w.id}`, url: w.url, title: w.title, category: w.category });
      }
      // Additional media
      const extras = workMediaMap?.[w.id] ?? [];
      for (const m of extras) {
        if (m.url) {
          items.push({
            id: m._id,
            url: m.url,
            title: m.caption || w.title,
            category: w.category,
          });
        }
      }
    }
    return items;
  }, [companyWorks, workMediaMap]);

  if (companyWorks.length === 0) {
    return (
      <div className="bg-brand-white min-h-screen flex items-center justify-center flex-col">
        <h1 className="font-serif font-bold text-3xl mb-4">Brand not found</h1>
        <button onClick={() => navigate('/work')} className="text-brand-mid-grey underline">
          Back to Portfolio
        </button>
      </div>
    );
  }

  return (
    <div className="bg-brand-white min-h-screen">
      <section className="py-16 md:py-[120px] px-6 md:px-12 max-w-[1280px] mx-auto">
        <FadeIn>
          <button
            onClick={() => navigate('/work')}
            className="font-sans text-[14px] text-brand-mid-grey mb-8 flex items-center gap-2 hover:text-brand-black transition-colors"
          >
            ← Back to all brands
          </button>
          <h1 className="font-serif font-bold text-[28px] md:text-[64px] text-brand-black mb-6">
            {clientName} Portfolio
          </h1>
          <p className="font-sans text-[18px] text-brand-mid-grey mb-16 max-w-[600px]">
            Creative assets, media, and branding completed for {clientName}.
          </p>
        </FadeIn>

        {allMedia.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-brand-mid-grey">No media uploaded yet.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {allMedia.map((item, i) => (
              <FadeIn key={item.id} delay={(i % 3) * 0.04} className="break-inside-avoid">
                <div className="rounded-2xl overflow-hidden bg-[#f2f2f2] group">
                  {item.url.match(/\.(mp4|webm|mov)$/i) ? (
                    <video
                      src={item.url}
                      className="w-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  )}
                  {item.title && item.title !== clientName && (
                    <div className="px-4 py-3">
                      <p className="text-xs font-medium text-brand-mid-grey">{item.title}</p>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
