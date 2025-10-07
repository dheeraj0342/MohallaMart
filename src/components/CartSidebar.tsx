'use client'

import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useStore()

  const handleQuantityChange = (id: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity)
    } else {
      removeFromCart(id)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary-brand text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center">
                <ShoppingCart className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-bold">Your Cart</h2>
                <span className="ml-2 bg-white text-primary-brand px-2 py-0.5 rounded-full text-sm font-semibold">
                  {getTotalItems()}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-neutral-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                  <ShoppingCart className="h-24 w-24 text-neutral-300 mb-4" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm mt-2">Add items to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="bg-neutral-50 rounded-lg p-4 border border-neutral-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                          <p className="text-primary-brand font-medium mt-1">₹{item.price}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 bg-white rounded-lg border border-neutral-300">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            className="p-2 hover:bg-neutral-100 rounded-l-lg transition-colors"
                          >
                            <Minus className="h-4 w-4 text-neutral-600" />
                          </button>
                          <span className="font-semibold text-neutral-900 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            className="p-2 hover:bg-neutral-100 rounded-r-lg transition-colors"
                          >
                            <Plus className="h-4 w-4 text-neutral-600" />
                          </button>
                        </div>
                        <div className="font-semibold text-neutral-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {cart.length > 1 && (
                    <button
                      onClick={clearCart}
                      className="w-full text-red-600 hover:text-red-700 py-2 text-sm font-medium transition-colors"
                    >
                      Clear All Items
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-200 p-6 bg-neutral-50">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Delivery Fee</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-neutral-900">
                    <span>Total</span>
                    <span>₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                
                <button className="w-full bg-primary-brand text-white py-3 rounded-lg font-semibold hover:bg-primary-brand-hover transition-colors">
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full mt-2 text-neutral-600 hover:text-neutral-800 py-2 text-sm font-medium transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
