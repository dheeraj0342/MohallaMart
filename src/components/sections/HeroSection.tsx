"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { images } from "@/lib/images"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [bannerImages, setBannerImages] = useState<string[]>([
    images.banners.desktopBanner,
    images.banners.desktopBanner2,
    images.banners.desktopBanner3,
  ])

  useEffect(() => {
    const updateBanners = () => {
      const width = window.innerWidth
      if (width < 640) {
        setBannerImages([
          images.banners.mobileBanner,
          images.banners.mobileBanner2,
          images.banners.mobileBanner3,
        ])
      } else if (width < 1024) {
        setBannerImages([
          images.banners.tabletBanner,
          images.banners.tabletBanner2,
          images.banners.tabletBanner3,
        ])
      } else {
        setBannerImages([
          images.banners.desktopBanner,
          images.banners.desktopBanner2,
          images.banners.desktopBanner3,
        ])
      }
    }

    updateBanners()
    window.addEventListener("resize", updateBanners)
    return () => window.removeEventListener("resize", updateBanners)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section id="home" className="w-full bg-background pt-2 pb-6">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {/* Left Banner */}
          <div className="relative w-full h-[140px] sm:h-[220px] lg:h-[300px] overflow-hidden rounded-xl sm:rounded-2xl shadow-sm bg-muted group">
            <Image
              src={bannerImages[currentSlide % bannerImages.length]}
              alt="Promo Banner 1"
              fill
              className="object-cover hover:scale-[1.02] transition-transform duration-700"
              priority
            />
            {/* Subtle overlay to ensure visibility */}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
          </div>

          {/* Right Banner */}
          <div className="relative w-full h-[140px] sm:h-[220px] lg:h-[300px] overflow-hidden rounded-xl sm:rounded-2xl shadow-sm bg-muted group">
            <Image
              src={bannerImages[(currentSlide + 1) % bannerImages.length]}
              alt="Promo Banner 2"
              fill
              className="object-cover hover:scale-[1.02] transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
          </div>
        </div>

        {/* Indicators */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full h-1.5 ${
                currentSlide === index
                  ? "w-8 bg-primary"
                  : "w-4 bg-muted-foreground/20 hover:bg-muted-foreground/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
