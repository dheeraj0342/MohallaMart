"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Store, RefreshCw } from "lucide-react"
import Image from "next/image"

interface StoreData {
  id: string
  name: string
  logo?: string
  distance: number
  rating: number
}

// Mock store data - replace with actual API call
const mockStores: StoreData[] = [
  { id: "1", name: "Fresh Mart", distance: 0.3, rating: 4.8 },
  { id: "2", name: "Green Grocers", distance: 0.5, rating: 4.6 },
  { id: "3", name: "Daily Needs", distance: 0.7, rating: 4.9 },
  { id: "4", name: "Quick Stop", distance: 0.9, rating: 4.5 },
  { id: "5", name: "Corner Store", distance: 1.1, rating: 4.7 },
  { id: "6", name: "Metro Mart", distance: 1.3, rating: 4.4 },
]

export default function NearbyStoresSection() {
  const [stores, setStores] = useState<StoreData[]>(mockStores)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Auto-refresh every 5 seconds
  useEffect(() => {
    setMounted(true)
    setLastUpdated(new Date())
    const interval = setInterval(() => {
      setIsRefreshing(true)
      setTimeout(() => {
        setStores((prev) => [...prev].sort(() => Math.random() - 0.5))
        setLastUpdated(new Date())
        setIsRefreshing(false)
      }, 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Stores Near You</h2>
            <motion.div animate={{ rotate: isRefreshing ? 360 : 0 }} transition={{ duration: 0.5 }}>
              <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "text-primary" : ""}`} />
            </motion.div>
          </div>
          <p className="text-sm text-muted-foreground">
            Auto-refreshing every 5s | Last: <span suppressHydrationWarning>{
              mounted && lastUpdated
                ? new Intl.DateTimeFormat("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  }).format(lastUpdated)
                : "--:--:--"
            }</span>
          </p>
        </div>

        {/* Circular Store Layout */}
        <div className="relative w-full aspect-square max-w-lg mx-auto">
          {/* Center point - User location */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg"
            >
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            <p className="text-xs text-center mt-1 font-medium">You</p>
          </div>

          {/* Circular rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 rounded-full border border-dashed border-border/50" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-dashed border-border/30" />
          </div>

          {/* Store items positioned in a circle */}
          <AnimatePresence mode="popLayout">
            {stores.map((store, index) => {
              const angle = (index * 360) / stores.length - 90
              const radius = 42 // percentage from center
              const x = 50 + radius * Math.cos((angle * Math.PI) / 180)
              const y = 50 + radius * Math.sin((angle * Math.PI) / 180)

              return (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <motion.div whileHover={{ scale: 1.1 }} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-border shadow-md flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
                      {store.logo ? (
                        <Image
                          src={store.logo || "/placeholder.svg"}
                          alt={store.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <Store className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <div className="mt-1 text-center">
                      <p className="text-xs font-medium truncate max-w-[70px]">{store.name}</p>
                      <p className="text-[10px] text-muted-foreground">{store.distance} km</p>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
