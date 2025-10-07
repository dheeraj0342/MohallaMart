import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface User {
  name: string
  email: string
  phone?: string
}

interface Location {
  city: string
  area: string
  pincode?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface StoreState {
  // Cart State
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number

  // User State
  user: User | null
  setUser: (user: User | null) => void
  isLoggedIn: () => boolean

  // Location State
  location: Location | null
  setLocation: (location: Location) => void

  // Search State
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart State
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find((i) => i.id === item.id)
          if (existingItem) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            }
          }
          return { cart: [...state.cart, item] }
        }),
      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        })),
      clearCart: () => set({ cart: [] }),
      getTotalItems: () => {
        const state = get()
        return state.cart.reduce((total, item) => total + item.quantity, 0)
      },
      getTotalPrice: () => {
        const state = get()
        return state.cart.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      // User State
      user: null,
      setUser: (user) => set({ user }),
      isLoggedIn: () => get().user !== null,

      // Location State
      location: null,
      setLocation: (location) => set({ location }),

      // Search State
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'mohallamart-storage',
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        location: state.location,
      }),
    }
  )
)
