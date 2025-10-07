'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function HeroSection() {
  const addToCart = useStore((state) => state.addToCart)

  const handleAddSampleItem = () => {
    addToCart({
      id: 'sample-' + Date.now(),
      name: 'Quick Commerce Guide',
      price: 199,
      quantity: 1,
    })
  }

  return (
    <section id="home" className="bg-gradient-to-r from-primary-brand to-primary-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Welcome to <span className="text-yellow-300">MohallaMart</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8 text-green-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Your trusted neighborhood marketplace for quick and reliable delivery
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddSampleItem}
              className="bg-white text-primary-brand px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              Explore Features <ArrowRight className="ml-2 h-4 w-4" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-brand transition-colors"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
