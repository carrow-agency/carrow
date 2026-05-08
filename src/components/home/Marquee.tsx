import { motion } from 'framer-motion';

export default function Marquee() {
  const marqueeText = "Brand Strategy · Social Media Marketing · Content Creation · Campaign Direction · Visual Identity · Influencer Marketing · Photography & Film · ";
  
  return (
    <div className="h-[56px] bg-brand-black flex items-center overflow-hidden w-full relative">
      <motion.div 
        animate={{ x: [0, -1920] }} 
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap"
      >
        <div className="font-sans font-semibold text-[12px] uppercase tracking-[0.25em] text-brand-white flex items-center gap-4 px-4">
          {[1, 2, 3, 4].map((rep) => (
            <span key={rep} className="flex-shrink-0">
              {marqueeText}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
