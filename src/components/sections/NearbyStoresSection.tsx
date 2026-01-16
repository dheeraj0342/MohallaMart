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
    <section id="nearby" className="py-12 sm:py-16 bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Stores Near You
              </h2>
            </div>
            {!isLoading && shops.length > 0 && (
              <p className="text-sm text-muted-foreground ml-13">
                <span className="font-semibold text-foreground">{shops.length}</span> {shops.length === 1 ? "store" : "stores"} delivering to your area{location?.city ? ` in ${location.city}` : ""}
              </p>
            )}
          </div>
          <Link href="/shops" className="self-start sm:self-auto">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 active:scale-95">
              View all stores
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <>
            <div className="sm:hidden flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-border/30 bg-card/50 overflow-hidden rounded-2xl w-[180px] shrink-0 snap-start">
                  <div className="relative h-28 w-full bg-muted/20 animate-pulse rounded-t-2xl" />
                  <CardContent className="p-3 space-y-2">
                    <div className="h-4 w-3/4 bg-muted/20 rounded-lg animate-pulse" />
                    <div className="h-3 w-1/2 bg-muted/20 rounded-lg animate-pulse" />
                    <div className="h-3 w-2/3 bg-muted/20 rounded-lg animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <Card key={i} className="border-border/30 bg-card/50 overflow-hidden rounded-2xl">
                  <div className="relative h-44 w-full bg-muted/20 animate-pulse rounded-t-2xl" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-5 w-3/4 bg-muted/20 rounded-lg animate-pulse" />
                    <div className="h-4 w-full bg-muted/20 rounded-lg animate-pulse" />
                    <div className="h-3 w-2/3 bg-muted/20 rounded-lg animate-pulse" />
                    <div className="flex items-center justify-between pt-2 border-t border-border/20">
                      <div className="h-3 w-16 bg-muted/20 rounded-lg animate-pulse" />
                      <div className="h-3 w-12 bg-muted/20 rounded-lg animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : shops.length > 0 ? (
          <>
            <div className="sm:hidden flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory">
              {shops.map((shop) => {
                const coordinates = shop.address?.coordinates
                const distance = coordinates && userCoordinates ? calculateDistanceKm(userCoordinates, coordinates) : null
                return (
                  <Link key={shop._id} href={`/shop/${generateSlug(shop.name)}`} className="group w-[180px] shrink-0 snap-start">
                    <Card className="h-full overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:shadow-md hover:border-primary/40 active:scale-[0.98]">
                      <div className="relative h-28 w-full bg-gradient-to-br from-muted/20 to-muted/10 overflow-hidden">
                        {shop.logo_url ? (
                          <Image
                            src={shop.logo_url}
                            alt={shop.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="180px"
                            unoptimized={shop.logo_url.includes("convex.cloud")}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                            <Store className="h-10 w-10 text-primary/40" />
                          </div>
                        )}
                        {shop.rating && shop.rating > 0 && (
                          <Badge className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-primary/90 backdrop-blur-sm text-primary-foreground px-2 py-1 text-[11px] font-semibold">
                            <Star className="h-3 w-3 fill-current" />
                            {shop.rating.toFixed(1)}
                          </Badge>
                        )}
                        {shop.is_active && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                            Open
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 space-y-1.5">
                        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {shop.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0 text-primary/60" />
                          <span className="line-clamp-1">{shop.address.city}</span>
                        </div>
                        {distance !== null && (
                          <div className="flex items-center gap-1 text-[11px] text-primary/80 font-semibold">
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
            
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleShops.map((shop) => {
                const coordinates = shop.address?.coordinates
                const distance = coordinates && userCoordinates ? calculateDistanceKm(userCoordinates, coordinates) : null
                return (
                  <Link key={shop._id} href={`/shop/${generateSlug(shop.name)}`} className="group">
                    <Card className="h-full overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1">
                      <div className="relative h-44 w-full bg-gradient-to-br from-muted/20 to-muted/10 overflow-hidden">
                        {shop.logo_url ? (
                          <Image
                            src={shop.logo_url}
                            alt={shop.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            unoptimized={shop.logo_url.includes("convex.cloud")}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                            <Store className="h-16 w-16 text-primary/40" />
                          </div>
                        )}
                        {shop.rating && shop.rating > 0 && (
                          <Badge className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-primary/90 backdrop-blur-sm text-primary-foreground px-2.5 py-1 text-xs font-semibold">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {shop.rating.toFixed(1)}
                          </Badge>
                        )}
                        {shop.is_active && (
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-[11px] font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                            Open
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4 space-y-2.5">
                        <div>
                          <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                            {shop.name}
                          </h3>
                          {shop.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {shop.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                          <span className="line-clamp-1">{shop.address.city}, {shop.address.state}</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-border/20">
                          {distance !== null ? (
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                              <Navigation className="h-3.5 w-3.5" />
                              <span>{distance.toFixed(1)} km</span>
                            </div>
                          ) : (
                            <span />
                          )}
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Package className="h-3.5 w-3.5 text-primary/60" />
                            <span>{shop.total_orders || 0} orders</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
            
            {shops.length > PAGE_SIZE && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 rounded-lg border-border/50 hover:bg-muted/50 transition-colors"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${
                        page === i 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "hover:bg-muted/50 text-muted-foreground border border-border/30"
                      }`}
                      aria-label={`Go to page ${i + 1}`}
                      aria-current={page === i ? "page" : undefined}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 rounded-lg border-border/50 hover:bg-muted/50 transition-colors"
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
          <Card className="border-border/30 bg-card/50 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/20">
                  <Store className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No stores nearby</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    We couldn't find any stores in your area. Try changing your location or check back later.
                  </p>
                </div>
                <Button 
                  className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all"
                  onClick={() => window.location.reload()}
                >
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
