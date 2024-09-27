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
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  getItemCount: (productId: string) => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            // Ensure we don't add more than available inventory
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

          // Otherwise, add the new item (but not exceeding inventory)
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
            // Remove item if quantity is 0 or less
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

      clearCart: () => set({ items: [] }),

      // Calculate the total based on product price or discountedPrice
      cartTotal: () =>
        get().items.reduce((total, item) => {
          const price = item.product.discountedPrice ?? item.product.price;
          return total + price * item.quantity;
        }, 0),

      // Get the quantity of a specific item by its productId
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
