import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PlanData {
  id: string;
  name: string;
  price?: string;
  features: string[];
  isPopular?: boolean;
  visibility?: boolean;
  tagline?: string;
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  planId: string | null;
  planStatus: 'none' | 'pending' | 'active' | 'cancelled';
  phone?: string;
  registered?: string;
}

export type UserAccount = ClientUser;

interface AppSettings {
  general: { siteName: string; tagline: string; email: string; whatsapp: string; };
  home: { h1: string; h2: string; cta1: string; cta2: string; };
  seoTitle?: string;
  seoDescription?: string;
}

interface AppState {
  isAuthOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  whatsappNumber: string;
  settings: AppSettings;
  cart: { planName: string; price: string; addedAt: number; userId: string | null; }[];
  
  setWhatsappNumber: (val: string) => void;
  setSettings: (settings: AppSettings) => void;
  
  addToCart: (item: { planName: string; price: string; addedAt: number; userId: string | null }) => void;
  removeFromCart: (planName: string) => void;
  clearCart: () => void;
}

const defaultSettings: AppSettings = {
  general: { siteName: 'Carrow', tagline: 'We Build Brands That Stand Out', email: 'hello@carrow.com', whatsapp: '+919999999999' },
  home: { h1: 'Digital Marketing Studio.', h2: 'Scaling ambitious brands.', cta1: 'View Services', cta2: 'Our Work' }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      whatsappNumber: '1234567890',
      settings: defaultSettings,
      isAuthOpen: false,
      setAuthOpen: (val) => set({ isAuthOpen: val }),
      cart: [],
      
      setWhatsappNumber: (val) => set({ whatsappNumber: val }),
      setSettings: (settings) => set({ settings }),

      addToCart: (item) => set((state) => {
        // Find existing cart (ignore user context for now, simple local cart)
        const itemExists = state.cart.some(c => c.planName === item.planName);
        if (itemExists) return state;
        
        return { cart: [...state.cart, item] };
      }),
      removeFromCart: (planName) => set((state) => ({ cart: state.cart.filter(c => c.planName !== planName) })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'carrow-storage',
    }
  )
);
