import { useNavigate } from 'react-router-dom';
import AnimatedTextCycle from '../ui/animated-text-cycle';
import { Button } from '../ui/button';

interface HeroProps {
  navigateToHash: (hash: string) => void;
}

export default function Hero({ navigateToHash }: HeroProps) {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-brand-white flex flex-col justify-center items-center text-center pt-[72px] px-6 md:px-12">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center py-20">
        <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-6">Creative Agency · Est. 2024</p>
        <h1 className="font-serif font-bold text-[36px] sm:text-[48px] md:text-[80px] lg:text-[112px] leading-[0.95] text-brand-black mb-8">
          <span className="block">We Build</span>
          <span className="block">Brands That</span>
          <span className="block">Stand Out.</span>
        </h1>
        <div className="font-sans text-[16px] sm:text-[18px] md:text-[24px] text-brand-dark-grey leading-[1.6] max-w-[560px] mb-12">
          Your <AnimatedTextCycle 
              words={[
                  "brands",
                  "presence",
                  "growth",
                  "visibility",
                  "content",
                  "strategy",
                  "campaigns",
                  "stories"
              ]}
              interval={2000}
              className={"text-brand-black font-semibold"} 
          /> deserves better tools.
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button variant="outline" size="lg" onClick={() => navigate('/work')} className="rounded-full px-8 py-6 font-sans font-semibold text-[14px] bg-brand-white text-brand-black border-brand-black hover:bg-brand-black hover:text-brand-white transition-colors w-full sm:w-auto">See Our Work</Button>
          <Button size="lg" onClick={() => navigateToHash('#plans')} className="rounded-full px-8 py-6 font-sans font-semibold text-[14px] bg-brand-black text-brand-white hover:bg-transparent hover:text-brand-black border hover:border-brand-black transition-colors w-full sm:w-auto">Start Your Brand</Button>
        </div>
        <div className="font-sans text-[11px] sm:text-[12px] text-brand-mid-grey tracking-wide">
          150+ Brands &nbsp;·&nbsp; 98% Retention &nbsp;·&nbsp; 10M+ Reach
        </div>
      </div>
    </section>
  );
}
