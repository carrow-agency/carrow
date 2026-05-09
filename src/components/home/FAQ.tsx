import { useState } from 'react';
import { Plus } from 'lucide-react';
import FadeIn from '../common/FadeIn';

const faqs = [
  { q: 'What services does Carrow offer?', a: 'We offer brand strategy, social media marketing, content creation, campaign direction, and influencer marketing — everything a growing brand needs.' },
  { q: 'How does the plan selection and checkout work?', a: "Browse our plans, click View Plan Details, add to cart, create an account, and during checkout you'll be connected to our team on WhatsApp to finalize everything." },
  { q: 'Do I need an account to browse the website?', a: 'No — all public pages are fully accessible. An account is only needed when you add a plan to your cart and checkout.' },
  { q: 'How quickly can we get started after signing up?', a: 'Within 24 hours of your WhatsApp connection, we begin the discovery phase. Most brands are fully onboarded in 3–5 days.' },
  { q: 'Will I get a dedicated account manager?', a: 'Pro and Enterprise clients get a dedicated account manager. Basic clients get full WhatsApp support with our team.' },
];

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 md:py-[140px] bg-brand-white px-6 md:px-12">
      <div className="max-w-[800px] mx-auto">
        <FadeIn>
          <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-4 text-center">FAQ</p>
          <h2 className="font-serif font-bold text-[24px] md:text-[56px] text-brand-black mb-16 text-center">Questions. Answered.</h2>
        </FadeIn>
        
        <div className="space-y-0 text-left">
          {faqs.map((f, i) => (
            <FadeIn key={i} delay={i * 0.05} className="border-b border-brand-border">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full py-[28px] flex justify-between items-center bg-transparent group">
                <span className="font-sans font-semibold text-[18px] text-brand-black text-left">{f.q}</span>
                <div className={`transform transition-transform duration-300 text-brand-black ${openFaq === i ? 'rotate-45' : 'rotate-0'}`}>
                  <Plus size={24} />
                </div>
              </button>
              <div style={{ height: openFaq === i ? 'auto' : 0 }} className="overflow-hidden transition-all duration-300 ease-in-out">
                <p className="font-sans text-[16px] text-brand-mid-grey leading-[1.8] pb-[28px] pt-2">{f.a}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
