"use client";

import { motion } from "framer-motion";
import { ShoppingCart, MapPin, Star, Store, BadgeCheck, Truck } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function HeroSection() {
  const addToCart = useStore((s) => s.addToCart);

  const handleStartShopping = () => {
    addToCart({
      id: "welcome-offer-" + Date.now(),
      name: "Fresh Organic Bananas (1kg)",
      price: 89,
      quantity: 1,
    });
  };

  return (
    <section id="home" className="relative py-20 transition-colors">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-white to-yellow-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Section */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-7 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 dark:bg-neutral-800 dark:text-neutral-200 px-4 py-1.5 rounded-full font-medium text-sm shadow-sm">
              <BadgeCheck className="w-4 h-4" />
              Most trusted delivery service
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-gray-900 dark:text-neutral-100">
              Order groceries online
              <span className="block text-green-600 dark:text-green-400">delivered in minutes</span>
            </h1>

            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto lg:mx-0">
              Fresh fruits, vegetables, essentials, and more — delivered lightning fast right from trusted neighborhood stores.
            </p>

            <div className="flex justify-center lg:justify-start gap-4 mt-6">
              <button
                onClick={handleStartShopping}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition"
              >
                <ShoppingCart className="w-4 h-4" /> Start Shopping
              </button>

              <button
                className="inline-flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-5 py-3 rounded-xl text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <Store className="w-4 h-4" /> Browse Categories
              </button>
            </div>

            {/* Highlight Stats */}
            <div className="flex flex-wrap gap-6 text-sm text-neutral-600 dark:text-neutral-300 mt-5 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-600" /> <span>Instant delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" /> <span>500+ stores</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-green-600" /> <span>4.9 rating</span>
              </div>
            </div>
          </motion.div>

          {/* Right Section */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md rounded-3xl p-10 bg-gradient-to-br from-green-600 to-green-500 dark:from-neutral-800 dark:to-neutral-700 text-white shadow-2xl">
              <div className="text-center">
                <ShoppingCart className="w-16 h-16 mx-auto" />
                <h3 className="text-3xl font-bold mt-4">15,000+ Products</h3>
                <p className="text-green-100 dark:text-neutral-300 mt-2">Everything you need for daily life</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                {[ 
                  { icon: "🥬", label: "Veggies" },
                  { icon: "🥛", label: "Dairy" },
                  { icon: "🍞", label: "Bakery" },
                  { icon: "🍎", label: "Fruits" },
                  { icon: "🥚", label: "Eggs" },
                  { icon: "🍗", label: "Meat" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/10 dark:bg-neutral-900/50 rounded-xl p-4 text-center">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="text-xs mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
