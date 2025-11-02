"use client";

import { Plus, Minus, ShoppingCart, Trash2, ArrowLeft, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CartPage() {
  // Mock cart data for demonstration
  const [cart, setCart] = useState<CartItem[]>([
    { id: "1", name: "Fresh Tomatoes", price: 45.00, quantity: 2 },
    { id: "2", name: "Organic Bananas", price: 30.00, quantity: 1 },
    { id: "3", name: "Green Apples", price: 120.00, quantity: 3 },
  ]);

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleQuantityChange = (
    id: string,
    currentQuantity: number,
    change: number,
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    } else {
      removeFromCart(id);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f9fafb] to-[#ffffff] dark:from-[#0d1117] dark:to-[#181c1f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[#85786a] dark:text-[#a2a6b2] hover:text-primary-brand dark:hover:text-primary-brand transition-colors mb-4 font-semibold"
          >
            <ArrowLeft className="h-5 w-5" />
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-[#f9f6f2] mb-2">
                Shopping Cart
              </h1>
              {cart.length > 0 && (
                <p className="text-[#85786a] dark:text-[#a2a6b2]">
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
                </p>
              )}
            </div>
            {cart.length > 1 && (
              <button
                onClick={clearCart}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="rounded-full bg-linear-to-br from-[#e6f4ec] to-[#d0ecd9] dark:from-[#1f2f25] dark:to-[#27ae60]/20 p-12 mb-8 shadow-xl"
            >
              <ShoppingCart className="h-24 w-24 text-primary-brand dark:text-[#37c978]" strokeWidth={1.5} />
            </motion.div>
            <h2 className="text-3xl font-bold text-[#212121] dark:text-[#f9f6f2] mb-4">
              Your cart is empty
            </h2>
            <p className="text-[#85786a] dark:text-[#a2a6b2] max-w-md mb-8">
              Start adding fresh groceries and daily essentials to your cart
            </p>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-primary-brand hover:bg-[#1f8f4e] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                🛒 Browse Products
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          /* Cart Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map((item, index) => (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative bg-white dark:bg-[#1f2f25] rounded-2xl p-6 border-2 border-[#e0e0e0] dark:border-[#2d333b] hover:border-primary-brand dark:hover:border-primary-brand shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="shrink-0 w-28 h-28 rounded-xl bg-linear-to-br from-[#e6f4ec] to-[#d0ecd9] dark:from-[#1f2f25] dark:to-[#27ae60]/20 flex items-center justify-center text-4xl shadow-inner">
                        🥬
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-[#212121] dark:text-[#f9f6f2] text-xl leading-tight mb-2">
                              {item.name}
                            </h3>
                            <p className="text-[#85786a] dark:text-[#a2a6b2] text-sm">
                              Price per unit: ₹{item.price.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="rounded-lg p-2 text-red-500 hover:text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110 active:scale-95"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="h-5 w-5" strokeWidth={2.5} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-[#f5f5f5] dark:bg-[#0d1117] rounded-xl border-2 border-[#e0e0e0] dark:border-[#2d333b] overflow-hidden shadow-sm">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                              className="p-3 hover:bg-primary-brand/10 dark:hover:bg-primary-brand/20 transition-colors active:scale-95"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-5 w-5 text-[#85786a] dark:text-[#a2a6b2]" strokeWidth={3} />
                            </button>
                            <span className="font-bold text-[#212121] dark:text-[#f9f6f2] min-w-16 text-center text-lg">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                              className="p-3 hover:bg-primary-brand/10 dark:hover:bg-primary-brand/20 transition-colors active:scale-95"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-5 w-5 text-[#85786a] dark:text-[#a2a6b2]" strokeWidth={3} />
                            </button>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm text-[#85786a] dark:text-[#a2a6b2] line-through mb-1">
                              ₹{(item.price * item.quantity * 1.2).toFixed(2)}
                            </p>
                            <p className="text-2xl font-bold text-primary-brand dark:text-primary-brand">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary Sticky Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24 bg-white dark:bg-[#1f2f25] rounded-2xl border-2 border-[#e0e0e0] dark:border-[#2d333b] shadow-lg overflow-hidden"
              >
                {/* Summary Header */}
                <div className="bg-linear-to-r from-primary-brand to-[#1f8f4e] text-white px-6 py-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Package className="h-6 w-6" />
                    Order Summary
                  </h2>
                </div>

                {/* Summary Content */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-[#85786a] dark:text-[#a2a6b2]">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span className="font-semibold text-[#212121] dark:text-[#f9f6f2]">
                      ₹{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[#85786a] dark:text-[#a2a6b2]">
                    <span className="flex items-center gap-2">
                      Delivery Fee
                      <span className="text-xs bg-primary-brand/10 text-primary-brand px-2 py-0.5 rounded-full font-semibold">
                        SAVED ₹40
                      </span>
                    </span>
                    <span className="text-primary-brand dark:text-primary-brand font-bold">FREE</span>
                  </div>

                  <div className="flex justify-between items-center text-[#85786a] dark:text-[#a2a6b2]">
                    <span>Discount</span>
                    <span className="text-primary-brand dark:text-primary-brand font-semibold">
                      - ₹{(getTotalPrice() * 0.1).toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t-2 border-[#e0e0e0] dark:border-[#2d333b] pt-4 mt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-bold text-[#212121] dark:text-[#f9f6f2]">Total Amount</span>
                      <span className="text-3xl font-bold text-primary-brand dark:text-primary-brand">
                        ₹{(getTotalPrice() * 0.9).toFixed(2)}
                      </span>
                    </div>

                    {/* Checkout Button */}
                    <Link href="/checkout">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-linear-to-r from-primary-brand to-[#1f8f4e] hover:from-[#1f8f4e] hover:to-primary-brand text-white py-4 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="h-5 w-5" strokeWidth={2.5} />
                        Proceed to Checkout
                      </motion.button>
                    </Link>

                    <Link href="/">
                      <button className="w-full mt-3 text-[#85786a] dark:text-[#a2a6b2] hover:text-primary-brand dark:hover:text-primary-brand py-3 text-sm font-semibold transition-all rounded-xl hover:bg-[#f5f5f5] dark:hover:bg-[#0d1117] border border-transparent hover:border-[#e0e0e0] dark:hover:border-[#2d333b]">
                        ← Continue Shopping
                      </button>
                    </Link>
                  </div>

                  {/* Trust Badges */}
                  <div className="border-t border-[#e0e0e0] dark:border-[#2d333b] pt-4 mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#85786a] dark:text-[#a2a6b2]">
                      <span className="text-primary-brand">✓</span>
                      Free delivery on orders above ₹199
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#85786a] dark:text-[#a2a6b2]">
                      <span className="text-primary-brand">✓</span>
                      Easy returns within 7 days
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#85786a] dark:text-[#a2a6b2]">
                      <span className="text-primary-brand">✓</span>
                      Secure checkout
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
