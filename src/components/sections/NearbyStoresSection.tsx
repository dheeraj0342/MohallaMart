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
    <section id="nearby" className="py-16 sm:py-8 bg-background">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
              Stores Near You
            </h2>
          </div>
          <div className="mt-2 sm:mt-0 flex sm:block justify-end">
            <Link href="/shops" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent text-sm sm:text-base px-3 py-2 sm:px-4"
                size="sm"
              >
                View all
              </Button>
            </Link>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm sm:text-base text-muted-foreground">
            {shops.length} {shops.length === 1 ? "shop" : "shops"} nearby{location?.city ? ` in ${location.city}` : ""}
          </p>
        </div>

        {isLoading ? (
          <div>
            {/* Mobile: horizontal skeleton, 2 visible */}
            <div className="sm:hidden flex gap-3 overflow-x-auto no-scrollbar">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-border bg-card overflow-hidden rounded-xl shadow-sm basis-1/2 shrink-0">
                  <div className="relative h-28 w-full bg-muted animate-pulse" />
                  <CardContent className="p-3 space-y-2">
                    <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-14 bg-muted rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Desktop: grid skeleton */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <Card key={i} className="border-border bg-card overflow-hidden rounded-xl shadow-sm">
                  <div className="relative h-32 md:h-36 w-full bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-14 bg-muted rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : shops.length > 0 ? (
          <>
            {/* Mobile: horizontal scroll, 2 visible */}
            <div className="sm:hidden flex gap-3 overflow-x-auto no-scrollbar">
              {shops.map((shop) => {
                const coordinates = shop.address?.coordinates
                const distance = coordinates && userCoordinates ? calculateDistanceKm(userCoordinates, coordinates) : null
                return (
                  <Link key={shop._id} href={`/shop/${generateSlug(shop.name)}`} className="group basis-1/2 shrink-0">
                    <Card className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:border-primary/40">
                      {/* Image / header */}
                      <div className="relative h-28 w-full bg-muted overflow-hidden">
                        {shop.logo_url ? (
                          <Image
                            src={shop.logo_url}
                            alt={shop.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw"
                            unoptimized={shop.logo_url.includes("convex.cloud")}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Store className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}

                        {/* Rating badge */}
                        {shop.rating && shop.rating > 0 && (
                          <Badge className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs shadow-sm">
                            <Star className="h-3 w-3 fill-current" />
                            {shop.rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className="flex flex-col gap-2 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-sm md:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {shop.name}
                          </h3>
                          {shop.is_active && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                              Active
                            </Badge>
                          )}
                        </div>

                        {shop.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {shop.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">
                            {shop.address.city}, {shop.address.state}
                          </span>
                        </div>

                        {distance !== null && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Navigation className="h-3 w-3 text-primary" />
                            <span>{distance.toFixed(1)} km away</span>
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            <span>{shop.total_orders || 0} orders</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
            {/* Desktop: grid */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {visibleShops.map((shop) => {
                const coordinates = shop.address?.coordinates
                const distance = coordinates && userCoordinates ? calculateDistanceKm(userCoordinates, coordinates) : null
                return (
                  <Link key={shop._id} href={`/shop/${generateSlug(shop.name)}`} className="group">
                    <Card className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:border-primary/40">
                      <div className="relative h-32 md:h-36 w-full bg-muted overflow-hidden">
                        {shop.logo_url ? (
                          <Image
                            src={shop.logo_url}
                            alt={shop.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 1200px) 50vw, 33vw"
                            unoptimized={shop.logo_url.includes("convex.cloud")}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Store className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        {shop.rating && shop.rating > 0 && (
                          <Badge className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs shadow-sm">
                            <Star className="h-3 w-3 fill-current" />
                            {shop.rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="flex flex-col gap-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {shop.name}
                          </h3>
                          {shop.is_active && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                              Active
                            </Badge>
                          )}
                        </div>
                        {shop.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {shop.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">
                            {shop.address.city}, {shop.address.state}
                          </span>
                        </div>
                        {distance !== null && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Navigation className="h-3 w-3 text-primary" />
                            <span>{distance.toFixed(1)} km away</span>
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
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
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="py-12 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Store className="h-5 w-5" />
                <span>No nearby shops found</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
