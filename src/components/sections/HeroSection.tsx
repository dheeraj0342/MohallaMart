"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Clock, MapPin, Star } from "lucide-react";
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
    <section id="home" className="relative py-16 transition-colors">
      <div className="absolute inset-0 bg-linear-to-br from-green-50 via-white to-orange-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left */}
          <motion.div
            className="space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 bg-primary-100 text-primary-brand px-3 py-1 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              Trusted by your neighborhood
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-neutral-100 leading-tight">
              Fresh groceries delivered
              <span className="block text-primary-brand">in under 10 minutes</span>
            </h1>

            <p className="text-base text-neutral-600 dark:text-neutral-300 max-w-xl">
              Get fresh fruits, vegetables, dairy, and daily essentials from
              nearby stores — fast, reliable, and at the best local prices.
            </p>

            {/* CTA buttons (no search input on hero) */}
            <div className="flex justify-center lg:justify-start mt-6 space-x-3">
              <button
                onClick={handleStartShopping}
                className="inline-flex items-center gap-2 bg-primary-brand hover:bg-primary-hover text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                <ShoppingCart className="w-4 h-4" /> Start Shopping
              </button>

              <button
                className="inline-flex items-center gap-2 bg-white dark:bg-transparent border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-4 py-3 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Browse Categories
              </button>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-neutral-600 dark:text-neutral-300 mt-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-brand" /> <span>10 min delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-brand" /> <span>500+ stores nearby</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary-brand" /> <span>4.8 rating</span>
              </div>
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full max-w-md rounded-3xl p-8 bg-linear-to-br from-primary-brand to-primary-hover dark:from-neutral-800 dark:to-neutral-700 text-white dark:text-neutral-100 shadow-2xl transition-colors">
              <div className="text-center">
                <div className="text-6xl">🛒</div>
                <h3 className="text-2xl font-bold mt-4">15,000+ Products</h3>
                <p className="text-primary-100 dark:text-neutral-300 mt-2">From fresh produce to daily essentials</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  { e: "🥬", t: "Veggies" },
                  { e: "🥛", t: "Dairy" },
                  { e: "🍞", t: "Bakery" },
                  { e: "🍌", t: "Fruits" },
                  { e: "🥚", t: "Eggs" },
                  { e: "🍗", t: "Meat" },
                ].map((p, i) => (
                  <div key={i} className="bg-white bg-opacity-10 dark:bg-neutral-900/60 rounded-lg p-3 text-center transition-colors">
                    <div className="text-2xl">{p.e}</div>
                    <div className="text-xs mt-1">{p.t}</div>
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
