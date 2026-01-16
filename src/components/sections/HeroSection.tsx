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
      setCurrentSlide((prev) => (prev + 1) % 2) // Only 2 slides
    }, 5000)

    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    if (typeof window === "undefined") return

    const updateImage = () => {
      const width = window.innerWidth
      const isSlide1 = currentSlide === 0
      
      if (width < 640) {
        setCurrentImage(isSlide1 ? images.banners.mobileBanner : images.banners.mobileBanner2)
      } else if (width < 1024) {
        setCurrentImage(isSlide1 ? images.banners.tabletBanner : images.banners.tabletBanner2)
      } else {
        setCurrentImage(isSlide1 ? images.banners.desktopBanner : images.banners.desktopBanner2)
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
      <div className="relative w-full">
        <div className="relative w-full h-[220px] sm:h-[320px] lg:h-[420px] overflow-hidden rounded-none sm:rounded-b-2xl">
          {bannerImages.map((image, index) => {
            return (
              <motion.div
                key={image}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: image === currentImage ? 1 : 0,
                  scale: image === currentImage ? 1 : 1.02,
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={image}
                  alt={`Hero banner ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
                  quality={90}
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </motion.div>
            )
          })}
          
          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2">
            {[0, 1].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === index
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
