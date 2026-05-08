import React, { useState } from 'react';

import { useAppStore } from '../lib/store';
import { useCurrentUserFromConvex, usePlans as useConvexPlans, useCreateOrder, useSettings } from '../lib/useConvex';
import { useNavigate, Navigate } from 'react-router-dom';
import { Trash2, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Checkout() {
  
  const { whatsappNumber, setAuthOpen, cart, removeFromCart, clearCart } = useAppStore();
  const currentUser = useCurrentUserFromConvex();
  const plans = useConvexPlans() ?? [];
  const createOrder = useCreateOrder();
  const settings = useSettings();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    business: '',
    phone: '',
    city: '',
  });

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-sans text-brand-mid-grey">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    setAuthOpen(true);
    return <Navigate to="/" replace />;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length || !currentUser) return;

    try {
      for (const item of cart) {
        const requestedPlan = plans.find(p => p.name === item.planName);
        if (requestedPlan && requestedPlan.id) {
          await createOrder({
            planId: requestedPlan.id as any,
          });
        }
      }
      
      const planNames = cart.map(c => c.planName).join(', ');
      const waNumber = settings?.general?.whatsapp || whatsappNumber;
      const text = `Hello Carrow! 👋\n\nI'm ready to begin with the following plan(s):\n\nPlan(s): ${planNames}\n\nHere are my details:\nName: ${formData.name}\nBusiness Name: ${formData.business}\nPhone: ${formData.phone}\nCity: ${formData.city}\n\nPlease guide me on the next steps.\n\nThank you!`;
      const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
      
      clearCart();
      window.open(waLink, '_blank');
      navigate('/account');
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1280px] mx-auto min-h-screen">
      <div className="mb-12">
        <h1 className="font-serif font-bold text-[40px] md:text-[56px] text-brand-black mb-4">Checkout.</h1>
        <p className="font-sans text-[18px] text-brand-mid-grey">Complete your request to initiate onboarding.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          <div className="bg-brand-white border border-brand-border rounded-[24px] p-8 md:p-12">
            <h2 className="font-serif font-bold text-[28px] text-brand-black mb-8">Business Details</h2>
            
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans font-semibold text-[13px] text-brand-mid-grey uppercase tracking-widest mb-2">Your Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#f9f9f9] border border-brand-border rounded-[12px] px-4 py-4 font-sans text-[15px] focus:outline-none focus:border-brand-black transition-colors" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-[13px] text-brand-mid-grey uppercase tracking-widest mb-2">Brand Name</label>
                  <input required value={formData.business} onChange={e => setFormData({...formData, business: e.target.value})} className="w-full bg-[#f9f9f9] border border-brand-border rounded-[12px] px-4 py-4 font-sans text-[15px] focus:outline-none focus:border-brand-black transition-colors" placeholder="Acme Corp" />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans font-semibold text-[13px] text-brand-mid-grey uppercase tracking-widest mb-2">Phone</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#f9f9f9] border border-brand-border rounded-[12px] px-4 py-4 font-sans text-[15px] focus:outline-none focus:border-brand-black transition-colors" placeholder="+1..." />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-[13px] text-brand-mid-grey uppercase tracking-widest mb-2">City</label>
                  <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-[#f9f9f9] border border-brand-border rounded-[12px] px-4 py-4 font-sans text-[15px] focus:outline-none focus:border-brand-black transition-colors" placeholder="NY" />
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-brand-border">
                <div className="flex items-start gap-4 mb-4 p-4 bg-blue-50 rounded-[12px] border border-blue-100">
                  <ShieldCheck size={24} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-sans font-semibold text-[15px] text-blue-900 mb-1">No payment required today</h4>
                    <p className="font-sans text-[14px] text-blue-800/80 leading-relaxed">
                      We will contact you on WhatsApp to finalize details before your invoice is generated.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-[#F7F7F7] border border-brand-border rounded-[24px] p-8 sticky top-32">
            <h3 className="font-serif font-bold text-[24px] text-brand-black mb-6">Order Summary</h3>
            
            {cart && cart.length > 0 ? (
              <div className="space-y-6">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-6 border-b border-brand-border">
                    <div>
                      <h4 className="font-sans font-bold text-[16px] text-brand-black">{item.planName}</h4>
                      <p className="font-sans text-[14px] text-brand-mid-grey mt-1">Monthly</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-sans font-semibold text-[16px] text-brand-black mb-2">{item.price}</span>
                      <button onClick={() => removeFromCart(item.planName)} className="text-red-500 hover:text-red-700 transition-colors p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Button type="submit" form="checkout-form" className="w-full py-6 rounded-full font-sans font-bold text-[16px] bg-brand-black text-brand-white">
                    Confirm Review
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="font-sans text-[15px] text-brand-mid-grey mb-6">Your cart is empty.</p>
                <Button onClick={() => navigate('/#plans')} variant="outline" className="rounded-full bg-brand-white">Explore Plans</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
