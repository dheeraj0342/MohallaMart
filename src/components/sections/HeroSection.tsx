"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { images } from "@/lib/images"

// Banner images array - will be selected based on screen size
const bannerImages = [
  images.banners.desktopBanner,
  images.banners.desktopBanner2,
  images.banners.tabletBanner,
  images.banners.tabletBanner2,
  images.banners.mobileBanner,
  images.banners.mobileBanner2,
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentImage, setCurrentImage] = useState<string>(images.banners.desktopBanner)

  // Auto-rotate slides every 5 seconds (5000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Select appropriate image based on screen size
  useEffect(() => {
    if (typeof window === "undefined") return

    const updateImage = () => {
      const width = window.innerWidth
      if (width < 640) {
        // Mobile - rotate between mobile banners
        setCurrentImage(
          currentSlide % 2 === 0
            ? images.banners.mobileBanner
            : images.banners.mobileBanner2
        )
      } else if (width < 1024) {
        // Tablet - rotate between tablet banners
        setCurrentImage(
          currentSlide % 2 === 0
            ? images.banners.tabletBanner
            : images.banners.tabletBanner2
        )
      } else {
        // Desktop - rotate between desktop banners
        setCurrentImage(
          currentSlide % 2 === 0
            ? images.banners.desktopBanner
            : images.banners.desktopBanner2
        )
      }
    }

    updateImage()
    window.addEventListener("resize", updateImage)
    return () => window.removeEventListener("resize", updateImage)
  }, [currentSlide])

  return (
    <section
      id="home"
      className="relative w-full overflow-hidden bg-background"
    >
      {/* Hero Banner - Responsive Heights */}
      <div className="relative w-full">
        {/* Mobile: 250px, Tablet: 350px, Desktop: 450px */}
        <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[450px] overflow-hidden" style={{ minHeight: "250px" }}>
          {bannerImages.map((image, index) => {
            return (
              <motion.div
                key={image}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: image === currentImage ? 1 : 0,
                  scale: image === currentImage ? 1 : 1.05,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 w-full h-full"
                style={{ height: "100%" }}
              >
                <Image
                  src={image}
                  alt={`Hero banner ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%"
                  }}
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
                  quality={90}
                />
                {/* Optional overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </motion.div>
            )
          })}
        </div>

        {/* Slide Indicators - Show for all devices */}
        <div className="flex justify-center gap-2 mt-4 absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          {[0, 1].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${currentSlide % 2 === index
                ? "w-8 bg-white/90"
                : "w-2 bg-white/40"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
