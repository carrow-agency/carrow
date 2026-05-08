import React, { createContext, useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';

interface AppContextType {
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  cart: { planName: string; price: string; addedAt: number; userId: string | null; }[];
  addToCart: (item: { planName: string; price: string; addedAt: number; userId: string | null }) => void;
  removeFromCart: (planName: string) => void;
  clearCart: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const store = useAppStore();

  return (
    <AppContext.Provider value={{ 
      isAuthOpen, 
      setIsAuthOpen,
      cart: store.cart,
      addToCart: store.addToCart,
      removeFromCart: store.removeFromCart,
      clearCart: store.clearCart
    }}>
      {children}
    </AppContext.Provider>
  );
};
