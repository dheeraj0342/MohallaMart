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
    <section id="home" className="relative py-24 sm:py-28 bg-background transition-colors">

      <div className="absolute top-0 left-0 w-full h-14 sm:h-16 overflow-hidden bg-primary text-primary-foreground">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="flex items-center gap-8 sm:gap-10 h-full whitespace-nowrap text-xs sm:text-sm font-semibold px-4 sm:px-6"
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

      <div className="mt-8 sm:mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Groceries in minutes, from local stores
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Hyperlocal delivery from trusted neighbourhood partners with real-time tracking and quality assurance.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                Start shopping
              </button>
              <button className="px-5 py-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                Explore stores
              </button>
            </div>
          </div>
        </div>
        <div className="relative w-full h-56 sm:h-64 overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="flex w-[200%]"
          >
            {[...bannerSlides, ...bannerSlides].map((slide, idx) => (
              <div key={`${slide.label}-${idx}`} className="relative w-full h-56 sm:h-64 shrink-0">
                <Image
                  src={slide.src}
                  alt={`Promo banner - ${slide.label}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur text-foreground border border-border">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium">{slide.label}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
