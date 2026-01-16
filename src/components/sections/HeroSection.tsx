"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { images } from "@/lib/images"

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2)
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
    <section id="home" className="relative w-auto overflow-hidden bg-background pt-0">
      <div className="relative w-full h-[260px] sm:h-[360px] lg:h-[500px] overflow-hidden sm:rounded-b-3xl shadow-sm bg-muted">
        {bannerImages.map((image, index) => (
          <motion.div
            key={image}
            initial={{ opacity: 0 }}
            animate={{
              opacity: image === currentImage ? 1 : 0,
              zIndex: image === currentImage ? 1 : 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={image}
              alt={`Hero banner slide ${(index % 2) + 1}`}
              fill
              className="object-cover object-center"
              priority={index === 0}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </motion.div>
        ))}
        
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2.5">
          {[0, 1].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                currentSlide === index
                  ? "w-6 h-2 bg-white shadow-lg"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80 active:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
