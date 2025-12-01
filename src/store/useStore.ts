import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Id } from "../../convex/_generated/dataModel";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  productId?: Id<"products">;
  variant?: string;
  grade?: string;
  notes?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

interface Location {
  city: string;
  area: string;
  pincode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface StoreState {
  // Cart State
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncCartWithConvex: (userId: string) => Promise<void>;

  // User State
  user: User | null;
  supabaseUser: SupabaseUser | null;
  setUser: (user: User | null) => void;
  setSupabaseUser: (user: SupabaseUser | null) => void;
  isLoggedIn: () => boolean;
  signOut: () => void;
  syncUserWithConvex: (user: User) => Promise<void>;

  // Location State
  location: Location | null;
  setLocation: (location: Location) => void;
  syncLocationWithConvex: (userId: string, location: Location) => Promise<void>;

  // Search State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setSearchOpen: (isOpen: boolean) => void;

  // Convex State
  isConvexConnected: boolean;
  setConvexConnected: (connected: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart State
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),
      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        })),
      clearCart: () => set({ cart: [] }),
      getTotalItems: () => {
        const state = get();
        return state.cart.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        const state = get();
        return state.cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      // User State
      user: null,
      supabaseUser: null,
      setUser: (user) => set({ user }),
      setSupabaseUser: (user) => set({ supabaseUser: user }),
      isLoggedIn: () => get().user !== null || get().supabaseUser !== null,
      signOut: () => set({ user: null, supabaseUser: null }),

      // Location State
      location: null,
      setLocation: (location) => set({ location }),

      // Search State
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      isSearchOpen: false,
      setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),

      // Convex State
      isConvexConnected: false,
      setConvexConnected: (connected) => set({ isConvexConnected: connected }),

      // Convex Integration Methods
      syncCartWithConvex: async (userId) => {
        // This will be implemented with actual Convex calls
        console.log("Syncing cart with Convex for user:", userId);
      },

      syncUserWithConvex: async (user) => {
        // This will be implemented with actual Convex calls
        console.log("Syncing user with Convex:", user);
      },

      syncLocationWithConvex: async (userId, location) => {
        // This will be implemented with actual Convex calls
        console.log("Syncing location with Convex:", userId, location);
      },
    }),
    {
      name: "mohallamart-storage",
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        supabaseUser: state.supabaseUser,
        location: state.location,
      }),
    },
  ),
);
