import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowLeft, Check, Plus, Star } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import React from 'react';

import { useAppStore } from '../lib/store';
import { useCurrentUserFromConvex, usePlans as useConvexPlans, useSettings } from '../lib/useConvex';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

function FadeIn({ children, delay = 0, className = '' }: FadeInProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }} transition={{ duration: 0.6, ease: 'easeOut', delay }} className={className}>
      {children}
    </motion.div>
  );
}

interface PlanFeature {
  t: string;
  d: string;
}

interface PlanFaq {
  q: string;
  a: string;
}

export default function PlanDetail() {
  const { planId } = useParams();
  const navigate = useNavigate();
  
  const [added, setAdded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [planId]);

  const { whatsappNumber, addToCart } = useAppStore();
  const currentUser = useCurrentUserFromConvex();
  const plans = useConvexPlans() ?? [];
  const settings = useSettings();
  
  // Find plan from Convex (case insensitive)
  const convexPlan = plans.find(p => p.name.toLowerCase() === (planId || 'basic').toLowerCase()) || plans[0];

  const planReviews = useQuery(api.planReviews.getApprovedForPlan, convexPlan?.id ? { planId: convexPlan.id } : "skip");
  const submitReview = useMutation(api.planReviews.submitReview);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const plan = {
    ...convexPlan,
    tagline: convexPlan?.tagline || 'Tailored for your needs',
    price: convexPlan?.price || 'Contact Us',
    desc: 'Pricing customized based on your brand goals.',
    features: (convexPlan?.features ?? []).map((f: string) => ({ t: f, d: 'Included in this plan.' })),
    faqs: [
      { q: 'What is included?', a: 'Everything listed entirely covered by our team.' },
      { q: 'Can I upgrade later?', a: 'Yes, you can upgrade your plan at any time.' },
      { q: 'Is there a setup fee?', a: 'No, there are no hidden fees. Just your flat monthly rate.' }
    ]
  };

  const waNumber = settings?.general?.whatsapp || whatsappNumber;

  const isPro = plan.isPopular;

  const handleAddToCart = () => {
    addToCart({ planName: plan?.name ?? 'Unknown Plan', price: plan?.price ?? 'Contact Us', addedAt: Date.now(), userId: currentUser?.id ?? null });

    if (!currentUser) {
      navigate('/signup?next=/checkout');
      return;
    }

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      navigate('/checkout');
    }, 900);
  };

  const handleWhatsApp = () => {
    const text = `Hi Carrow! I'm interested in the ${plan.name} Plan. Can you tell me more?`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-brand-white min-h-screen">
      {/* Hero */}
      <section className="py-16 md:py-[120px] px-6 md:px-12 max-w-[1280px] mx-auto text-center border-b border-brand-border">
        <FadeIn>
          <button onClick={() => navigate('/#plans')} className="font-sans font-medium text-[14px] text-brand-mid-grey flex items-center justify-center mx-auto mb-8 hover:text-brand-black transition-all duration-300 ease-out active:scale-[0.98] gap-2">
            <ArrowLeft size={16} /> Plans
          </button>
          
          <div className={`inline-block px-4 py-1.5 rounded-full font-sans font-bold text-[11px] uppercase tracking-widest mb-6 ${isPro ? 'bg-brand-black text-brand-white' : 'border border-brand-border text-brand-black'}`}>
            {plan.name} Plan
          </div>
          
          <h1 className="font-serif font-bold text-[28px] md:text-[72px] text-brand-black leading-tight mb-4">{plan.name} Plan</h1>
          <p className="font-sans text-[18px] text-brand-mid-grey mb-12">{plan.tagline}</p>
          
          <div className="font-serif font-bold text-[36px] md:text-[56px] text-brand-black mb-2">{plan.price}</div>
          <p className="font-sans text-[15px] text-brand-mid-grey mb-12">{plan.desc}</p>
          
          <button 
            onClick={handleAddToCart}
            className={`rounded-full px-[56px] py-[18px] font-sans font-semibold text-[16px] transition-all duration-300 ease-out active:scale-[0.98] w-full md:w-auto ${
              added ? 'bg-green-600 border-green-600 text-white' : 'bg-brand-black border-brand-black text-brand-white hover:bg-transparent hover:text-brand-black'
            } border`}
          >
            {added ? '✓ Added to Cart' : 'Add to Cart'}
          </button>
          <p className="font-sans text-[13px] text-brand-mid-grey mt-6">No contracts. Cancel anytime.</p>
        </FadeIn>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-[140px] px-6 md:px-12 max-w-[1280px] mx-auto border-b border-brand-border">
        <FadeIn>
           <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-4">What's Included</p>
           <h2 className="font-serif font-bold text-[24px] md:text-[56px] text-brand-black mb-16">Everything in the {plan.name} Plan.</h2>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-8">
          {plan.features.map((f: PlanFeature, i: number) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="border border-brand-border rounded-[20px] p-[32px] h-full flex flex-col items-start hover:shadow-[0_2px_20px_rgba(0,0,0,0.05)] transition-shadow">
                <div className="w-[40px] h-[40px] rounded-full bg-brand-black text-brand-white flex items-center justify-center mb-6">
                  <Check size={20} />
                </div>
                <h3 className="font-sans font-semibold text-[17px] text-brand-black mb-2">{f.t}</h3>
                <p className="font-sans text-[15px] text-brand-mid-grey leading-[1.7]">{f.d}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 md:py-[120px] px-6 md:px-12 max-w-[1280px] mx-auto bg-brand-off-white my-12 rounded-[32px]">
        <FadeIn>
            <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-4 text-center">Hear What Others Have To Say</p>
            <h2 className="font-serif font-bold text-[32px] md:text-[56px] text-brand-black mb-16 text-center">What Brands Say About {plan.name}.</h2>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-8">
          {planReviews === undefined ? (
            <div className="col-span-3 text-center py-12 text-brand-mid-grey font-sans">Loading reviews...</div>
          ) : planReviews.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-brand-mid-grey font-sans">No reviews yet for this plan. Be the first to leave one!</div>
          ) : (
            planReviews.map((rev: any, i: number) => (
               <FadeIn key={rev._id} delay={i * 0.1}>
                 <div className="bg-brand-white rounded-[24px] p-8 shadow-sm border border-brand-border h-full flex flex-col justify-between">
                   <div>
                     <div className="flex gap-1 mb-6 text-brand-black">
                       {[...Array(rev.rating)].map((_, j) => <span key={j}>★</span>)}
                     </div>
                     <p className="font-sans text-[16px] text-brand-dark-grey leading-[1.7] mb-8">"{rev.reviewText}"</p>
                   </div>
                   <div>
                     <div className="font-sans font-bold text-[15px] text-brand-black">{rev.userName}</div>
                     <div className="font-sans text-[13px] text-brand-mid-grey">Verified Client</div>
                   </div>
                 </div>
               </FadeIn>
            ))
          )}
        </div>

        {/* Leave a suggestion box */}
        <div className="mt-16 max-w-[600px] mx-auto">
          <FadeIn>
            <div className="bg-brand-white rounded-[20px] p-8 shadow-sm border border-brand-border">
              <h3 className="font-serif font-bold text-[22px] text-brand-black mb-2 text-center">Leave a Review</h3>
              <p className="font-sans text-[14px] text-brand-mid-grey mb-6 text-center">Share your experience with the {plan.name} plan.</p>
              
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} out of 5 stars`}
                    className={`focus:outline-none transition-colors ${rating >= star ? 'text-brand-black' : 'text-gray-300'}`}
                  >
                    <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>

              {reviewSubmitted ? (
                <div className="text-center py-8">
                  <div className="text-green-600 text-4xl mb-4">✓</div>
                  <p className="font-sans text-lg text-brand-black font-semibold">Thank you for your review!</p>
                  <p className="font-sans text-sm text-brand-mid-grey mt-2">Your review is pending approval.</p>
                </div>
              ) : !currentUser ? (
                <div className="text-center py-8">
                  <p className="font-sans text-[15px] text-brand-mid-grey mb-4">You must be logged in to leave a review.</p>
                  <button onClick={() => navigate('/login')} className="bg-brand-black text-brand-white rounded-full px-6 py-2.5 font-sans font-semibold text-[13px] hover:bg-brand-dark-grey transition-all">Log In</button>
                </div>
              ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (rating === 0) {
                  setReviewError("Please select a rating");
                  return;
                }
                if (reviewText.trim().length < 10) {
                  setReviewError("Please write at least 10 characters");
                  return;
                }
                try {
                  setIsSubmittingReview(true);
                  setReviewError("");
                  await submitReview({ planId: convexPlan!.id, planName: plan.name || "Unknown Plan", rating, reviewText });
                  setReviewSubmitted(true);
                  setRating(0);
                  setReviewText("");
                  toast.success("Review submitted for approval!");
                } catch (err: any) {
                  setReviewError(err.message || "Failed to submit review");
                } finally {
                  setIsSubmittingReview(false);
                }
              }}>
                <div className="mb-4">
                  <textarea 
                    placeholder="Tell us what you think..." 
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full bg-brand-off-white border border-brand-border rounded-[12px] p-4 font-sans text-[14px] text-brand-black focus:outline-none focus:border-brand-black transition-colors min-h-[100px] resize-none"
                    required
                    disabled={isSubmittingReview}
                  ></textarea>
                  {reviewError && <p className="text-red-500 text-sm mt-2">{reviewError}</p>}
                </div>
                <div className="flex justify-end">
                  <button disabled={isSubmittingReview} type="submit" className="bg-brand-black text-brand-white rounded-full px-6 py-3 font-sans font-semibold text-[13px] hover:bg-brand-dark-grey transition-all duration-300 ease-out active:scale-[0.98] w-full sm:w-auto disabled:opacity-50">
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How This Plan Works */}
      <section className="py-16 md:py-[100px] bg-brand-black px-6 md:px-12">
        <div className="max-w-[800px] mx-auto relative pl-8 md:pl-16">
          {/* Vertical Line */}
          <div className="absolute left-[7px] md:left-[31px] top-6 bottom-6 w-px bg-brand-dark-grey"></div>
          
          <FadeIn>
            <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-4 text-center md:text-left">How It Works</p>
            <h2 className="font-serif font-bold text-[24px] md:text-[52px] text-brand-white mb-16 text-center md:text-left">Your Journey with Carrow.</h2>
          </FadeIn>

          <div className="space-y-16">
            {[
              { n: '01', t: 'Create Your Account', d: 'Sign up free. No credit card needed.' },
              { n: '02', t: 'Choose Your Plan', d: 'Pick Basic, Pro, or Enterprise and checkout.' },
              { n: '03', t: 'We Begin on WhatsApp', d: 'We connect instantly to onboard your brand.' }
            ].map((step, i) => (
               <FadeIn key={i} delay={i * 0.1} className="relative">
                  {/* The dot is centered over the vertical line (which is at left: 7px on mobile, 31px on md). 
                      Dot width is 20px, so left offset is -3px on mobile, -41px on md relative to the pl-8/pl-16 text wrapper? 
                      Actually, wrapper has pl-8 (32px) on mobile, so left-[7px] line means the line is 25px to the left of the text.
                      To center a 20px dot on the line, we place it at absolute left: -25px - 10px = -35px.
                      Instead, let's just make the left value match the line precisely. */}
                  <div className="absolute top-1.5 w-[20px] h-[20px] rounded-full bg-brand-black border-[4px] border-brand-white z-10 hidden md:block" style={{ left: '-41px' }}></div>
                  <div className="md:hidden absolute top-1.5 w-[20px] h-[20px] rounded-full bg-brand-black border-[4px] border-brand-white z-10" style={{ left: '-25px' }}></div>
                  <div className="font-sans font-semibold text-[12px] uppercase text-brand-white mb-2">{step.n}</div>
                  <h3 className="font-serif font-semibold text-[28px] text-brand-white mb-2">{step.t}</h3>
                  <p className="font-sans text-[16px] text-brand-mid-grey leading-[1.8]">{step.d}</p>
               </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Plan FAQ */}
      <section className="py-16 md:py-[100px] bg-brand-white px-6 md:px-12">
        <div className="max-w-[800px] mx-auto">
          <FadeIn>
             <p className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-4 text-center">Plan FAQ</p>
             <h2 className="font-serif font-bold text-[24px] md:text-[56px] text-brand-black mb-16 text-center">Everything About This Plan.</h2>
          </FadeIn>
          
          <div className="space-y-0 text-left">
            {plan.faqs.map((f: PlanFaq, i: number) => (
              <FadeIn key={i} delay={i * 0.05} className="border-b border-brand-border">
                <div 
                  onMouseEnter={() => setOpenFaq(i)}
                  onMouseLeave={() => setOpenFaq(null)}
                  className="w-full group"
                >
                  <div className="w-full py-[28px] flex justify-between items-center bg-transparent cursor-pointer rounded-xl">
                    <span className="font-sans font-semibold text-[18px] text-brand-black text-left">{f.q}</span>
                    <div className={`transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] text-brand-black ${openFaq === i ? 'rotate-45' : 'rotate-0'}`}>
                      <Plus size={24} />
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="font-sans text-[16px] text-brand-mid-grey leading-[1.8] pb-[28px] pt-2">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Add to Cart CTA */}
      <section className="py-16 md:py-[100px] bg-brand-black text-brand-white px-6 md:px-12 text-center">
        <div className="max-w-[800px] mx-auto">
          <FadeIn>
            <h2 className="font-serif font-bold text-[28px] md:text-[56px] leading-tight mb-4">Ready to Start with {plan.name}?</h2>
            <p className="font-sans text-[17px] text-brand-mid-grey mb-12">No contracts. No hidden fees. Just results.</p>
            <button 
              onClick={handleAddToCart}
              className={`bg-brand-white text-brand-black rounded-full px-[64px] py-[20px] font-sans font-bold text-[16px] hover:bg-opacity-90 transition-all duration-300 ease-out active:scale-[0.98] mb-8 ${added ? 'bg-green-500 text-white' : ''}`}
            >
               {added ? '✓ Added to Cart' : `Add to Cart — ${plan.name}`}
            </button>
            <div>
               <button onClick={handleWhatsApp} className="font-sans text-[15px] text-brand-white hover:opacity-70 transition-opacity underline focus:outline-none">
                 Or talk to us first →
               </button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
