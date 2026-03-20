// AFU Portal - Shopping Cart Store
// Zustand store with localStorage persistence for the farm marketplace shopping cart

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export interface SupplierProduct {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  description: string;
  category: 'seeds' | 'fertilizer' | 'pesticides' | 'equipment' | 'irrigation' | 'technology' | 'packaging' | 'storage' | 'tools';
  price: number;
  memberPrice: number;
  currency: string;
  unit: string;
  image: string;
  availability: 'in-stock' | 'limited' | 'pre-order' | 'out-of-stock';
  rating: number;
  reviewCount: number;
  soldCount: number;
  tags: string[];
  featured: boolean;
  minOrder: number;
}

export interface CartItem {
  product: SupplierProduct;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: SupplierProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getMemberTotal: () => number;
  getSavings: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: SupplierProduct, quantity: number = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );

          if (existingIndex >= 0) {
            // Increment quantity if item already exists in cart
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + quantity,
            };
            return { items: updatedItems };
          }

          // Add new item to cart
          return { items: [...state.items, { product, quantity }] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is zero or negative
            return {
              items: state.items.filter((item) => item.product.id !== productId),
            };
          }

          const updatedItems = state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );
          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getMemberTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.product.memberPrice * item.quantity,
          0
        );
      },

      getSavings: () => {
        const { getTotal, getMemberTotal } = get();
        return getTotal() - getMemberTotal();
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'afu-cart-storage',
    }
  )
);
