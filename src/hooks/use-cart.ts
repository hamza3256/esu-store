import { Product } from "@/payload-types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Define CartItem type to track product and quantity
export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  discount: number;  // New state for discount
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (discount: number) => void;  // New method to apply discount
  cartTotal: () => number;
  getItemCount: (productId: string) => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0, // Initialize discount

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            const newQuantity = Math.min(
              existingItem.quantity + quantity,
              product.inventory
            );
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              { product, quantity: Math.min(quantity, product.inventory) },
            ],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.product.id !== id),
            };
          }
          return {
            items: state.items.map((item) =>
              item.product.id === id ? { ...item, quantity } : item
            ),
          };
        }),

      clearCart: () => set({ items: [], discount: 0 }),

      // Method to apply promo code and store the discount
      applyPromoCode: (discount: number) => {
        set({ discount });
      },

      // Calculate the total based on product price or discountedPrice and apply the discount
      cartTotal: () =>
        get().items.reduce((total, item) => {
          const price = item.product.discountedPrice ?? item.product.price;
          const discountedTotal = total + price * item.quantity;
          // Apply the discount
          return get().discount > 0
            ? discountedTotal * ((100 - get().discount) / 100)
            : discountedTotal;
        }, 0),

      getItemCount: (id) => {
        const item = get().items.find((item) => item.product.id === id);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
