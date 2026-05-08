import { useNavigate } from 'react-router-dom';
import FadeIn from '../common/FadeIn';

interface PlansPreviewProps {
  plans: { id: string; name: string; features: string[]; isPopular?: boolean; }[];
  whatsappNumber: string;
}

export default function PlansPreview({ plans, whatsappNumber }: PlansPreviewProps) {
  const navigate = useNavigate();

  return (
    <section id="plans" className="py-[140px] bg-brand-off-white px-6 md:px-12">
      <div className="max-w-[1280px] mx-auto">
        <FadeIn>
          <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-4 text-center">Plans</p>
          <h2 className="font-serif font-bold text-[32px] md:text-[56px] text-brand-black mb-4 text-center">Pick Your Plan. Own Your Market.</h2>
          <p className="font-sans text-[17px] text-brand-mid-grey text-center mb-16">No hidden fees. No lock-in contracts. Cancel anytime.</p>
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-8 items-center mb-12">
          {plans.map((plan, i) => {
            const isPro = plan.isPopular;
            return (
              <FadeIn key={plan.id} delay={i * 0.1}>
                <div className={`group rounded-[20px] p-[48px] border relative bg-brand-white border-brand-border hover:bg-brand-black transition-colors duration-300 ${isPro ? 'lg:-translate-y-4 shadow-sm' : ''}`}>
                  {plan.isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-black group-hover:bg-brand-white text-brand-white group-hover:text-brand-black transition-colors duration-300 font-sans font-semibold text-[11px] px-4 py-1.5 rounded-full whitespace-nowrap shadow-sm border border-brand-black">
                      MOST POPULAR
                    </span>
                  )}
                  <div className="font-sans font-bold text-[13px] uppercase tracking-[0.15em] mb-4 text-brand-mid-grey group-hover:text-brand-white/80 transition-colors duration-300">{plan.name}</div>
                  <div className="font-serif font-bold text-[48px] md:text-[56px] mb-2 text-brand-black group-hover:text-brand-white transition-colors duration-300">Contact Us</div>
                  <div className="font-sans text-[16px] mb-8 text-brand-mid-grey group-hover:text-brand-white/80 transition-colors duration-300">Tailored for your needs</div>
                  
                  <ul className="space-y-4 mb-10 text-brand-black group-hover:text-brand-white transition-colors duration-300">
                    {plan.features.map((f: string, fi: number) => (
                      <li key={fi} className="flex gap-3 text-[15px] font-sans">
                        <span className="opacity-50">·</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={() => navigate(`/plan/${plan.name.toLowerCase()}`)}
                    className="w-full py-4 rounded-full font-sans font-semibold text-[14px] text-center border bg-brand-black text-brand-white border-brand-black group-hover:bg-brand-white group-hover:text-brand-black transition-all duration-300"
                  >
                    View Plan Details
                  </button>
                </div>
              </FadeIn>
            );
          })}
        </div>
        <p className="font-sans text-[14px] text-brand-mid-grey text-center">Have questions about a plan? We'll walk you through it on <a href={`https://wa.me/${whatsappNumber}?text=Hi%2C%20I%20have%20questions%20about%20your%20plans.`} target="_blank" rel="noopener noreferrer" className="text-brand-black hover:underline cursor-pointer font-semibold">WhatsApp</a>.</p>
      </div>
    </section>
  );
}
