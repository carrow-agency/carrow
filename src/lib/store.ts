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

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  planId: string | null;
  planStatus: 'none' | 'pending' | 'active';
  phone?: string;
  registered?: string;
}

export interface WorkImage {
  id: string;
  url: string;
  title: string;
  category: string;
  client?: string;
  published?: boolean;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  plan: string;
  date: string;
  status: 'Pending' | 'Active' | 'Cancelled';
}

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
  plans: PlanData[];
  works: WorkImage[];
  settings: AppSettings;
  users: UserAccount[];
  currentUser: UserAccount | null;
  orders: Order[];
  cart: { planName: string; price: string; addedAt: number; userId: string | null; }[];
  
  setWhatsappNumber: (val: string) => void;
  updatePlan: (id: string, data: Partial<PlanData>) => void;
  setPopularPlan: (id: string) => void;
  updateWorkImage: (id: string, data: Partial<WorkImage>) => void;
  addWorkImage: (data: WorkImage) => void;
  removeWorkImage: (id: string) => void;
  setSettings: (settings: AppSettings) => void;
  setPlans: (plans: PlanData[]) => void;
  setWorks: (works: WorkImage[]) => void;
  setUsers: (users: UserAccount[]) => void;
  setOrders: (orders: Order[]) => void;
  
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  requestPlan: (planId: string) => void;
  addToCart: (item: { planName: string; price: string; addedAt: number; userId: string | null }) => void;
  removeFromCart: (planName: string) => void;
  clearCart: () => void;
  
  activateUserPlan: (userId: string, active: boolean) => void;
  setCurrentUser: (user: UserAccount | null) => void;
}

const defaultPlans: PlanData[] = [
  { id: '1', name: 'Basic', features: ['Brand audit', '2 platforms', '8 content pieces', 'WhatsApp support'], visibility: true, tagline: 'For starters', price: 'Contact Us' },
  { id: '2', name: 'Pro', features: ['Everything in Basic', '4 platforms', '20 content pieces', 'Paid ads'], isPopular: true, visibility: true, tagline: 'For growing brands', price: 'Contact Us' },
  { id: '3', name: 'Enterprise', features: ['Everything in Pro', 'Unlimited platforms', '50+ content pieces', 'Dedicated manager'], visibility: true, tagline: 'Full dominance', price: 'Contact Us' },
];

const defaultWorks: WorkImage[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', title: 'Aura Skincare', category: 'Brand Identity', published: true },
  { id: '2', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71', title: 'TechFlow', category: 'Web Design', published: true },
  { id: '3', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0', title: 'Glow Up', category: 'Social Media', published: true },
];

const defaultSettings: AppSettings = {
  general: { siteName: 'Carrow', tagline: 'We Build Brands That Stand Out', email: 'hello@carrow.com', whatsapp: '+919999999999' },
  home: { h1: 'Digital Marketing Studio.', h2: 'Scaling ambitious brands.', cta1: 'View Services', cta2: 'Our Work' }
};

const hashSync = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      whatsappNumber: '1234567890',
      plans: defaultPlans,
      works: defaultWorks,
      settings: defaultSettings,
      orders: [],
      users: [],
      currentUser: null,
      isAuthOpen: false,
      setAuthOpen: (val) => set({ isAuthOpen: val }),
      cart: [],
      
      setWhatsappNumber: (val) => set({ whatsappNumber: val }),
      updatePlan: (id, data) => set((state) => ({ plans: state.plans.map(p => p.id === id ? { ...p, ...data } : p) })),
      setPopularPlan: (id) => set((state) => ({ plans: state.plans.map(p => ({ ...p, isPopular: p.id === id })) })),
      updateWorkImage: (id, data) => set((state) => ({ works: state.works.map(w => w.id === id ? { ...w, ...data } : w) })),
      addWorkImage: (data) => set((state) => ({ works: [...state.works, data] })),
      removeWorkImage: (id) => set((state) => ({ works: state.works.filter(w => w.id !== id) })),
      setSettings: (settings) => set({ settings }),
      setPlans: (plans) => set({ plans }),
      setWorks: (works) => set({ works }),
      setUsers: (users) => set({ users }),
      setOrders: (orders) => set({ orders }),

      login: (email: string, password: string) => {
        const hashedInput = hashSync(password + 'carrow-salt-2024');
        const user = get().users.find(u => u.email === email);
        if (!user) {
          return { success: false, error: 'No account found with this email.' };
        }
        if (user.passwordHash !== hashedInput) {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }
        set({ currentUser: user });
        return { success: true };
      },
      
      signup: (name: string, email: string, password: string) => {
        const existingUser = get().users.find(u => u.email === email);
        if (existingUser) {
          return { success: false, error: 'An account with this email already exists.' };
        }
        const hashedPassword = hashSync(password + 'carrow-salt-2024');
        const newUser: UserAccount = {
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          name,
          email,
          passwordHash: hashedPassword,
          role: 'user',
          planId: null,
          planStatus: 'none',
          registered: new Date().toISOString().split('T')[0]
        };
        set(state => ({ users: [...state.users, newUser], currentUser: newUser }));
        return { success: true };
      },
      
      logout: () => set({ currentUser: null, cart: [] }),

      addToCart: (item) => set((state) => {
        const currentUserId = state.currentUser?.id ?? null;
        const userCart = state.cart.filter(c => c.userId === currentUserId);
        const itemExists = userCart.some(c => c.planName === item.planName);
        if (itemExists) return state;
        
        const newItem = { ...item, userId: currentUserId };
        const otherUserCarts = state.cart.filter(c => c.userId !== currentUserId);
        return { cart: [...otherUserCarts, newItem] };
      }),
      removeFromCart: (planName) => set((state) => ({ cart: state.cart.filter(c => c.planName !== planName) })),
      clearCart: () => set({ cart: [] }),
      
      requestPlan: (planId) => set((state) => {
        if (!state.currentUser) return state;
        const plan = state.plans.find(p => p.id === planId);
        if (!plan) return state;

        const updatedUser: UserAccount = { ...state.currentUser, planId, planStatus: 'pending' };
        const newOrder: Order = {
          id: `#CR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`,
          clientId: updatedUser.id,
          clientName: updatedUser.name,
          clientEmail: updatedUser.email,
          plan: plan.name,
          date: new Date().toISOString().split('T')[0] ?? '2025-01-01',
          status: 'Pending'
        };

        return {
          currentUser: updatedUser,
          users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u),
          orders: [newOrder, ...state.orders]
        };
      }),
      
      activateUserPlan: (userId, active) => set((state) => {
        const users = state.users.map(u => u.id === userId ? { ...u, planStatus: (active ? 'active' : 'none') as 'none' | 'pending' | 'active' } : u);
        const orders = state.orders.map(o => o.clientId === userId && o.status === 'Pending' ? { ...o, status: (active ? 'Active' : 'Pending') as 'Pending' | 'Active' | 'Cancelled' } : o);
        const currentUser = state.currentUser?.id === userId ? users.find(u => u.id === userId) || null : state.currentUser;
        return { users, orders, currentUser };
      }),
      
      setCurrentUser: (user) => set({ currentUser: user }),
    }),
    {
      name: 'carrow-storage',
    }
  )
);
