import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { useCurrentUserFromConvex, usePlans as useConvexPlans, useCreateOrder, useSettings } from '../lib/useConvex';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const inputClass =
  'w-full bg-brand-off-white border border-brand-border rounded-[12px] px-5 py-4 font-sans text-[15px] text-brand-black placeholder:text-brand-mid-grey focus:outline-none focus:border-brand-black transition-colors duration-200';

const labelClass =
  'block font-sans font-medium text-[12px] uppercase tracking-widest text-brand-mid-grey mb-2';

export default function Checkout() {
  const { whatsappNumber, cart, removeFromCart, clearCart } = useAppStore();
  const currentUser = useCurrentUserFromConvex();
  const plans = useConvexPlans() ?? [];
  const createOrder = useCreateOrder();
  const settings = useSettings();
  const navigate = useNavigate();

  // Using a single initial state or derived state instead of setting it in useEffect.
  // We can just fallback to currentUser.name in the input itself or initialize properly.
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    business: '',
    phone: '',
    city: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  // Update formData when currentUser loads only if name is empty
  useEffect(() => {
    if (currentUser?.name && !formData.name) {
      setFormData(prev => ({ ...prev, name: currentUser.name || '' }));
    }
  }, [currentUser?.name, formData.name]);

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-white">
        <span className="inline-block w-6 h-6 border-2 border-brand-border border-t-brand-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login?next=/checkout" replace />;
  }

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required.';
    if (!formData.business.trim()) errs.business = 'Brand name is required.';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
    if (!formData.city.trim()) errs.city = 'City is required.';
    return errs;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    if (!cart.length) return;

    setSubmitting(true);
    try {
      for (const item of cart) {
        const requestedPlan = plans.find(p => p.name === item.planName);
        if (requestedPlan?.id) {
          await createOrder({ 
            planId: requestedPlan.id as any,
            business: formData.business,
            phone: formData.phone,
            city: formData.city,
          });
        }
      }

      const planNames = cart.map(c => c.planName).join(', ');
      const waNumber = settings?.general?.whatsapp || whatsappNumber;
      const text = `Hello Carrow!\n\nI would like to proceed with the following plan:\n\nPlan: ${planNames}\n\nMy details:\nName: ${formData.name}\nBrand: ${formData.business}\nPhone: ${formData.phone}\nCity: ${formData.city}\n\nPlease advise on next steps.`;
      const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

      clearCart();
      window.open(waLink, '_blank');
      navigate('/account');
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalItems = cart.length;

  return (
    <div className="min-h-screen bg-brand-white pt-28 pb-24 px-6 md:px-12">
      <div className="max-w-[1160px] mx-auto">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-16"
        >
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-brand-mid-grey mb-3">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
          <h1 className="font-serif font-bold text-[40px] md:text-[64px] text-brand-black leading-none">
            Checkout.
          </h1>
        </motion.div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="border border-brand-border rounded-[24px] p-16 text-center max-w-[600px] mx-auto"
          >
            <div className="w-16 h-16 bg-brand-off-white rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={28} className="text-brand-mid-grey" />
            </div>
            <h2 className="font-serif font-bold text-[28px] text-brand-black mb-3">Your cart is empty</h2>
            <p className="font-sans text-[15px] text-brand-mid-grey mb-8 leading-relaxed">
              Browse our plans and add one to continue.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-brand-black text-brand-white rounded-full px-8 py-4 font-sans font-semibold text-[14px] hover:bg-brand-dark-grey transition-colors"
            >
              View Plans <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* Left — Form */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1"
            >
              <div className="border border-brand-border rounded-[24px] p-8 md:p-12">
                <h2 className="font-serif font-bold text-[28px] text-brand-black mb-8">
                  Your Details
                </h2>

                <form id="checkout-form" onSubmit={handleCheckout} noValidate className="space-y-6">
                  {submitError && (
                    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-[10px]">
                      <p className="font-sans text-[14px] text-red-700">{submitError}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="co-name" className={labelClass}>Your Name</label>
                      <input
                        id="co-name"
                        type="text"
                        value={formData.name}
                        onChange={e => { setFormData({ ...formData, name: e.target.value }); setFieldErrors(p => ({ ...p, name: '' })); }}
                        placeholder="Jane Doe"
                        autoComplete="name"
                        className={`${inputClass} ${fieldErrors.name ? 'border-red-400' : ''}`}
                      />
                      {fieldErrors.name && <p className="font-sans text-[13px] text-red-600 mt-1.5">{fieldErrors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="co-business" className={labelClass}>Brand Name</label>
                      <input
                        id="co-business"
                        type="text"
                        value={formData.business}
                        onChange={e => { setFormData({ ...formData, business: e.target.value }); setFieldErrors(p => ({ ...p, business: '' })); }}
                        placeholder="Acme Inc."
                        autoComplete="organization"
                        className={`${inputClass} ${fieldErrors.business ? 'border-red-400' : ''}`}
                      />
                      {fieldErrors.business && <p className="font-sans text-[13px] text-red-600 mt-1.5">{fieldErrors.business}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="co-phone" className={labelClass}>Phone Number</label>
                      <input
                        id="co-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={e => { setFormData({ ...formData, phone: e.target.value }); setFieldErrors(p => ({ ...p, phone: '' })); }}
                        placeholder="+1 234 567 8900"
                        autoComplete="tel"
                        className={`${inputClass} ${fieldErrors.phone ? 'border-red-400' : ''}`}
                      />
                      {fieldErrors.phone && <p className="font-sans text-[13px] text-red-600 mt-1.5">{fieldErrors.phone}</p>}
                    </div>
                    <div>
                      <label htmlFor="co-city" className={labelClass}>City</label>
                      <input
                        id="co-city"
                        type="text"
                        value={formData.city}
                        onChange={e => { setFormData({ ...formData, city: e.target.value }); setFieldErrors(p => ({ ...p, city: '' })); }}
                        placeholder="New York"
                        autoComplete="address-level2"
                        className={`${inputClass} ${fieldErrors.city ? 'border-red-400' : ''}`}
                      />
                      {fieldErrors.city && <p className="font-sans text-[13px] text-red-600 mt-1.5">{fieldErrors.city}</p>}
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="mt-2 border-t border-brand-border pt-8">
                    <div className="flex items-start gap-4 bg-brand-off-white rounded-[16px] px-6 py-5">
                      <MessageCircle size={20} className="text-brand-black shrink-0 mt-0.5" />
                      <div>
                        <p className="font-sans font-semibold text-[14px] text-brand-black mb-1">
                          No payment required today
                        </p>
                        <p className="font-sans text-[13px] text-brand-mid-grey leading-relaxed">
                          After submitting, our team will reach out on WhatsApp to walk you through onboarding before any invoice is issued.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Right — Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full lg:w-[380px]"
            >
              <div className="border border-brand-border rounded-[24px] p-8 sticky top-28">
                <h3 className="font-serif font-bold text-[22px] text-brand-black mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  {cart.map((item, idx) => (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-between items-center pb-4 border-b border-brand-border"
                    >
                      <div>
                        <p className="font-sans font-semibold text-[15px] text-brand-black">{item.planName}</p>
                        <p className="font-sans text-[13px] text-brand-mid-grey mt-0.5">Monthly plan</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-sans font-semibold text-[15px] text-brand-black">{item.price}</span>
                        <button
                          onClick={() => removeFromCart(item.planName)}
                          className="text-brand-mid-grey hover:text-red-500 transition-colors p-1"
                          aria-label={`Remove ${item.planName} from cart`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-brand-black text-brand-white rounded-full py-[18px] font-sans font-semibold text-[15px] hover:bg-brand-dark-grey transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-brand-white/40 border-t-brand-white rounded-full animate-spin" />
                  ) : (
                    <>Confirm &amp; Continue <ArrowRight size={16} /></>
                  )}
                </button>

                <p className="font-sans text-[12px] text-brand-mid-grey text-center mt-4">
                  You will be contacted on WhatsApp to finalize.
                </p>
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}
