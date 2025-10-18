'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  preparationTime: number;
  customization?: {
    dietaryRestrictions: string[];
    portionSize: 'small' | 'regular' | 'large';
    modifications: string[];
    specialInstructions: string;
    cookingPreferences: string[];
  };
}

interface CartContextType {
  cartItems: CartItem[];
  isLoaded: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getEstimatedDelivery: () => Date;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('berghaus-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('berghaus-cart');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever cartItems change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('berghaus-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => 
        cartItem._id === item._id && 
        JSON.stringify(cartItem.customization) === JSON.stringify(item.customization)
      );
      
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem._id === item._id && JSON.stringify(cartItem.customization) === JSON.stringify(item.customization)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getEstimatedDelivery = () => {
    if (cartItems.length === 0) return new Date();
    
    const maxPrepTime = Math.max(...cartItems.map(item => item.preparationTime));
    const bufferTime = 15; // 15 minutes buffer
    return new Date(Date.now() + (maxPrepTime + bufferTime) * 60000);
  };

  const value: CartContextType = {
    cartItems,
    isLoaded,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getEstimatedDelivery
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
