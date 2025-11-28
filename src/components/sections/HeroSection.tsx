"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShoppingCart, Store, BadgeCheck, Truck } from "lucide-react";
const bannerSlides = [
  {
    src: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1600&q=80",
    label: "Farm Fresh",
    priority: true,
  },
  {
    src: "https://images.unsplash.com/photo-1505253216365-40c9d88c3c49?auto=format&fit=crop&w=1600&q=80",
    label: "10-min Express",
    priority: true,
  },
  {
    src: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1600&q=80",
    label: "Everyday Essentials",
    priority: true,
  },
  {
    src: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1600&q=80",
    label: "Dairy & Bakery",
    priority: true,
  },
  {
    src: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1600&q=80",
    label: "Home & Essentials",
    priority: true,
  },
];

export default function HeroSection() {

  return (
    <section id="home" className="relative py-20 transition-colors">
      <div className="absolute inset-0 bg-linear-to-br from-green-100 via-white to-yellow-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 -z-10" />

      <div className="absolute top-0 left-0 w-full h-16 overflow-hidden bg-green-600/90 text-white">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="flex items-center gap-10 h-full whitespace-nowrap text-sm font-semibold px-6"
        >
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4" /> 10-minute delivery promise
          </span>
          <span className="flex items-center gap-2">
            <Store className="w-4 h-4" /> 500+ trusted neighbourhood stores
          </span>
          <span className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> 15,000+ essentials in stock
          </span>
          <span className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" /> Rated 4.9/5 by customers
          </span>
        </motion.div>
      </div>

      <div className="mt-0">
        <div className="relative w-full h-56 overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="flex w-[200%]"
          >
            {[...bannerSlides, ...bannerSlides].map((slide, idx) => (
              <div key={`${slide.label}-${idx}`} className="relative w-full h-56 shrink-0">
                <Image
                  src={slide.src}
                  alt={`Promo banner - ${slide.label}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={idx === 0}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
