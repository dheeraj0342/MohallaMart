"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/../convex/_generated/api"
import { useStore } from "@/store/useStore"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Package, Star, Store, ChevronLeft, ChevronRight } from "lucide-react"
import { generateSlug } from "@/lib/utils"

const DELIVERY_RADIUS_KM = 2
const PAGE_SIZE = 6

interface LatLng {
  lat: number
  lng: number
}

function calculateDistanceKm(pointA: LatLng, pointB: LatLng): number {
  const R = 6371
  const dLat = ((pointB.lat - pointA.lat) * Math.PI) / 180
  const dLng = ((pointB.lng - pointA.lng) * Math.PI) / 180
  const lat1 = (pointA.lat * Math.PI) / 180
  const lat2 = (pointB.lat * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

type Shop = {
  _id: string
  name: string
  description?: string
  logo_url?: string
  address: {
    street?: string
    city: string
    state: string
    pincode?: string
    coordinates?: { lat: number; lng: number }
  }
  rating?: number
  total_orders?: number
  is_active?: boolean
}

export default function NearbyStoresSection() {
  const location = useStore((s) => s.location)
  const [page, setPage] = useState(0)

  const queryArgs = useMemo(() => {
    const base = { query: "", is_active: true, limit: 12 }
    if (!location) return base
    if (location.coordinates) {
      return {
        ...base,
        customer_location: location.coordinates,
        max_radius_km: DELIVERY_RADIUS_KM,
      }
    }
    if (location.pincode) return { ...base, pincode: location.pincode }
    if (location.city) return { ...base, city: location.city }
    return base
  }, [location])

  const nearbyShops = useQuery(api.shops.searchShops, queryArgs)
  const userCoordinates = location?.coordinates ?? null
  const isLoading = nearbyShops === undefined

  const shops: Shop[] = useMemo(() => {
    const list = (nearbyShops ?? []) as Shop[]
    if (!userCoordinates) return list
    return [...list].sort((a, b) => {
      const aCoords = a.address?.coordinates
      const bCoords = b.address?.coordinates
      if (aCoords && bCoords) {
        const distA = calculateDistanceKm(userCoordinates, aCoords)
        const distB = calculateDistanceKm(userCoordinates, bCoords)
        return distA - distB
      }
      if (aCoords) return -1
      if (bCoords) return 1
      return (b.rating || 0) - (a.rating || 0)
    })
  }, [nearbyShops, userCoordinates])

  const totalPages = Math.max(1, Math.ceil(shops.length / PAGE_SIZE))
  const visibleShops = shops.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1))
  }, [page, totalPages])

  return (
    <section id="nearby" className="py-8 sm:py-12 bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Stores Near You
              </h2>
            </div>
            <p className="text-sm text-muted-foreground ml-10 sm:ml-10">
              {shops.length} {shops.length === 1 ? "store" : "stores"} delivering to your area{location?.city ? ` in ${location.city}` : ""}
            </p>
          </div>
          <Link href="/shops" className="self-end sm:self-auto">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary hover:bg-primary/10 text-sm font-medium px-3 h-9"
            >
              View all stores
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div>
            {/* Mobile: horizontal skeleton */}
            <div className="sm:hidden flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-border bg-card overflow-hidden rounded-xl shadow-sm w-[160px] shrink-0">
                  <div className="relative h-24 w-full bg-muted animate-pulse" />
                  <CardContent className="p-3 space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Desktop: grid skeleton */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <Card key={i} className="border-border bg-card overflow-hidden rounded-xl shadow-sm">
                  <div className="relative h-36 w-full bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : shops.length > 0 ? (
          <>
            {/* Mobile: horizontal scroll with improved cards */}
            <div className="sm:hidden flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
              {shops.map((shop) => {
                const coordinates = shop.address?.coordinates
                const distance = coordinates && userCoordinates ? calculateDistanceKm(userCoordinates, coordinates) : null
                return (
                  <Link key={shop._id} href={`/shop/${generateSlug(shop.name)}`} className="group w-[160px] shrink-0">
                    <Card className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/40 active:scale-[0.98]">
                      {/* Image */}
                      <div className="relative h-24 w-full bg-muted overflow-hidden">
                        {shop.logo_url ? (
                          <Image
                            src={shop.logo_url}
                            alt={shop.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="160px"
                            unoptimized={shop.logo_url.includes("convex.cloud")}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <Store className="h-8 w-8 text-muted-foreground/60" />
                          </div>
                        )}
                        {/* Rating badge */}
                        {shop.rating && shop.rating > 0 && (
                          <Badge className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white px-1.5 py-0.5 text-[10px] font-medium">
                            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                            {shop.rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      {/* Content */}
                      <CardContent className="p-2.5 space-y-1">
                        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {shop.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="line-clamp-1">{shop.address.city}</span>
                        </div>
                        {distance !== null && (
                          <div className="flex items-center gap-1 text-[11px] text-primary font-medium">
                            <Navigation className="h-3 w-3" />
                            <span>{distance.toFixed(1)} km</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
            
            {/* Desktop: grid with improved cards */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleShops.map((shop) => {
                const coordinates = shop.address?.coordinates
                const distance = coordinates && userCoordinates ? calculateDistanceKm(userCoordinates, coordinates) : null
                return (
                  <Link key={shop._id} href={`/shop/${generateSlug(shop.name)}`} className="group">
                    <Card className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5">
                      {/* Image */}
                      <div className="relative h-36 w-full bg-muted overflow-hidden">
                        {shop.logo_url ? (
                          <Image
                            src={shop.logo_url}
                            alt={shop.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            unoptimized={shop.logo_url.includes("convex.cloud")}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <Store className="h-12 w-12 text-muted-foreground/60" />
                          </div>
                        )}
                        {/* Rating badge */}
                        {shop.rating && shop.rating > 0 && (
                          <Badge className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-sm text-white px-2 py-1 text-xs font-medium">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {shop.rating.toFixed(1)}
                          </Badge>
                        )}
                        {/* Active indicator */}
                        {shop.is_active && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            Open
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <CardContent className="p-4 space-y-2">
                        <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                          {shop.name}
                        </h3>
                        
                        {shop.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                            {shop.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-1">{shop.address.city}, {shop.address.state}</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          {distance !== null ? (
                            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                              <Navigation className="h-3.5 w-3.5" />
                              <span>{distance.toFixed(1)} km away</span>
                            </div>
                          ) : (
                            <span />
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Package className="h-3.5 w-3.5" />
                            <span>{shop.total_orders || 0} orders</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
            {/* Pagination */}
            {shops.length > PAGE_SIZE && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                        page === i 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="border-border bg-card border-dashed">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted">
                  <Store className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">No stores nearby</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    We couldn't find any stores in your area. Try changing your location or check back later.
                  </p>
                </div>
                <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
