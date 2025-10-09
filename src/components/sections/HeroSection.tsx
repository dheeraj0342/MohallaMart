'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Clock, MapPin, Star } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function HeroSection() {
  const addToCart = useStore((state) => state.addToCart)

  const handleStartShopping = () => {
    addToCart({
      id: 'welcome-offer-' + Date.now(),
      name: 'Fresh Organic Bananas (1kg)',
      price: 89,
      quantity: 1,
    })
  }

  return (
    <section id="home" className="relative bg-gradient-to-br from-green-50 via-white to-orange-50 py-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 text-green-500">🥕</div>
        <div className="absolute top-32 right-20 w-16 h-16 text-orange-500">🍎</div>
        <div className="absolute bottom-20 left-32 w-18 h-18 text-red-500">🍅</div>
        <div className="absolute bottom-40 right-10 w-14 h-14 text-yellow-500">🌽</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Star className="w-4 h-4 mr-2 fill-current" />
              #1 Grocery Delivery in Your Area
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Fresh Groceries 
              <span className="block text-primary-brand">Delivered in</span>
              <span className="text-orange-500">10 Minutes</span>
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl mb-8 text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Get fresh fruits, vegetables, dairy & daily essentials delivered to your doorstep. 
              Quality guaranteed with best prices in your neighborhood.
            </motion.p>

            {/* Stats */}
            <motion.div 
              className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-semibold">10 min delivery</span>
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 text-orange-600 mr-2" />
                <span className="font-semibold">500+ stores nearby</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Star className="w-5 h-5 text-yellow-500 mr-2 fill-current" />
                <span className="font-semibold">4.8 rating</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(46, 125, 50, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartShopping}
                className="bg-primary-brand text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 flex items-center justify-center shadow-lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Start Shopping Now
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-primary-brand text-primary-brand px-8 py-4 rounded-xl font-semibold hover:bg-primary-brand hover:text-white transition-all duration-300"
              >
                Browse Categories
              </motion.button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              className="mt-8 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              💚 100% Quality Guarantee • 🚚 Free delivery above ₹199 • 💰 Best price promise
            </motion.div>
          </motion.div>

          {/* Right Content - Image/Visual */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Main Visual Container */}
            <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-3xl p-8 shadow-2xl">
              {/* Floating Elements */}
              <motion.div 
                className="absolute -top-4 -right-4 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                10 MIN
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-4 -left-4 bg-yellow-400 text-gray-800 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              >
                FRESH
              </motion.div>

              {/* Central Content */}
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-2xl font-bold mb-2">15,000+ Products</h3>
                <p className="text-green-100">From fresh produce to daily essentials</p>
              </div>

              {/* Product Icons */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {['🥬', '🥛', '🍞', '🧅', '🥚', '🍌'].map((emoji, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white bg-opacity-20 rounded-lg p-3 text-center text-2xl backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
