"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ShoppingCart, Store, BadgeCheck, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"

const gradientImage = (from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'>
      <defs>
        <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='${from}' />
          <stop offset='100%' stop-color='${to}' />
        </linearGradient>
      </defs>
      <rect width='1600' height='900' rx='40' fill='url(#grad)' />
    </svg>
  `)}`

const bannerSlides = [
  {
    src: gradientImage("#f7c4d4", "#fef0c7"),
    label: "Farm Fresh",
  },
  {
    src: gradientImage("#c3f0ca", "#8ee4ff"),
    label: "10-min Express",
  },
  {
    src: gradientImage("#ffe4c8", "#ffd1dc"),
    label: "Everyday Essentials",
  },
  {
    src: gradientImage("#d4dcff", "#fff6eb"),
    label: "Dairy & Bakery",
  },
  {
    src: gradientImage("#fbe6ff", "#d8f4ff"),
    label: "Home & Essentials",
  },
]

const marqueeItems = [
  { icon: Truck, text: "10-minute delivery promise" },
  { icon: Store, text: "500+ trusted neighbourhood stores" },
  { icon: ShoppingCart, text: "15,000+ essentials in stock" },
  { icon: BadgeCheck, text: "Rated 4.9/5 by customers" },
]

export default function HeroSection() {
  return (
    <section id="home" className="relative pt-20 pb-12 bg-background">
      {/* Marquee Banner */}
      <div className="absolute top-0 left-0 w-full h-12 overflow-hidden bg-primary">
        <motion.div
          initial={{ x: "0%" }}
          animate={{ x: "-50%" }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 20, ease: "linear" }}
          className="flex items-center gap-12 h-full whitespace-nowrap text-sm font-medium text-primary-foreground px-6"
        >
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <item.icon className="w-4 h-4" />
              {item.text}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Hero Content */}
      <div className="mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
              Groceries in minutes, from local stores
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Hyperlocal delivery from trusted neighbourhood partners with real-time tracking and quality assurance.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button size="lg" className="font-semibold">
                Start shopping
              </Button>
              <Button size="lg" variant="outline" className="font-semibold bg-transparent">
                Explore stores
              </Button>
            </div>
          </div>
        </div>

        {/* Media Carousel */}
        <div className="relative w-full h-56 sm:h-72 overflow-hidden mt-8">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 25, ease: "linear" }}
            className="flex w-[200%]"
          >
            {[...bannerSlides, ...bannerSlides].map((slide, idx) => (
              <div key={`${slide.label}-${idx}`} className="relative w-full h-56 sm:h-72 shrink-0">
                {slide.src?.endsWith(".mp4") ? (
                  <video
                    src={slide.src}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    src={slide.src || "/placeholder.svg"}
                    alt={`Promo banner - ${slide.label}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={idx < 2}
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm text-card-foreground border border-border">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{slide.label}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
