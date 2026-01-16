"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { api } from "@/../convex/_generated/api"
import { Loader2, Store, MapPin, Phone, Mail, Star, Package, Clock, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useStore } from "@/store/useStore"
import { useToast } from "@/hooks/useToast"
import { generateSlug } from "@/lib/utils"
import ImageModal from "@/components/ImageModal"
import ShopProductCard from "@/components/products/ShopCard"
import { EtaBadge, type EtaInfo } from "@/components/products/EtaBadge"

export default function ShopPage() {
  const params = useParams()
  const slug = params.slug as string
  const { addToCart, location } = useStore()
  const { success } = useToast()

  const [selectedImage, setSelectedImage] = useState<{
    url: string
    alt: string
    title?: string
  } | null>(null)
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc" | "rating">("popular")
  const [shopEta, setShopEta] = useState<EtaInfo | null>(null)

  const shop = useQuery(api.shops.getShopBySlug, { slug })
  const products = useQuery(api.products.getProductsByShop, shop ? { shop_id: shop._id, is_available: true } : "skip")

  // Fetch ETA for the shop when shop and location are available
  useEffect(() => {
    if (!shop?._id || !location) return

    // Location can be stored in two formats:
    // 1. { coordinates: { lat, lng } } - nested format
    // 2. { lat, lon } - flat format (from LocationModal)
    const lat = (location as any)?.coordinates?.lat ?? (location as any)?.lat
    const lng = (location as any)?.coordinates?.lng ?? (location as any)?.lon

    if (!lat || !lng) return

    const fetchShopEta = async () => {
      try {
        const response = await fetch(
          `/api/vendors/nearby?userLat=${lat}&userLon=${lng}&radiusKm=2`
        )
        if (response.ok) {
          const data = await response.json()
          if (data.vendors && Array.isArray(data.vendors)) {
            // Find the shop with matching ID
            const vendor = data.vendors.find((v: any) => v.id === shop._id)
            if (vendor?.eta) {
              setShopEta(vendor.eta)
            }
          }
        }
      } catch (error) {
        console.error("[ShopPage] Error fetching shop ETA:", error)
      }
    }

    fetchShopEta()

    // Refresh ETA every 2 minutes
    const interval = setInterval(fetchShopEta, 120000)

    return () => clearInterval(interval)
  }, [shop?._id, location])

  const handleAddToCart = (product: {
    _id: string
    name: string
    price: number
    images: string[]
    min_order_quantity: number
    unit: string
  }) => {
    addToCart({
      id: product._id,
      name: `${product.name} (${product.unit})`,
      price: product.price,
      ...(product.images && product.images.length > 0 && { image: product.images[0] }),
      quantity: product.min_order_quantity,
    })
    success(`${product.name} added to cart!`)
  }

  if (shop === undefined || products === undefined) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-neutral-200 dark:border-neutral-800" />
              <Loader2 className="h-16 w-16 animate-spin text-neutral-900 dark:text-white absolute inset-0" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 animate-pulse">Loading shop...</p>
          </div>
        </div>
      </div>
    )
  }

  if (shop === null) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl bg-white dark:bg-neutral-900">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
              <Store className="h-10 w-10 text-neutral-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Shop Not Found</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              The shop you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button asChild className="rounded-full px-8">
              <a href="/shops">Browse All Shops</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedProducts = Array.isArray(products)
    ? [...products].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return (a.price ?? 0) - (b.price ?? 0)
        case "price_desc":
          return (b.price ?? 0) - (a.price ?? 0)
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0)
        case "popular":
        default:
          return (b.total_sales ?? 0) - (a.total_sales ?? 0)
      }
    })
    : []

  const hoursOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  const hoursLabel: Record<string, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  }

  const todayKey = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()]

  const todaysHours = shop?.business_hours
    ? (shop.business_hours as Record<string, { open?: string; close?: string } | null | undefined>)[todayKey]
    : undefined

  const todaysLabel =
    !todaysHours || !todaysHours.open || !todaysHours.close
      ? "Closed today"
      : `${todaysHours.open} - ${todaysHours.close}`

  const parseTime = (t?: string) => {
    if (!t) return null as number | null
    const parts = t.split(":")
    const h = Number(parts[0])
    const m = Number(parts[1] ?? 0)
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    return h * 60 + m
  }

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()
  const openNow = (() => {
    if (!todaysHours || !todaysHours.open || !todaysHours.close) return false
    const o = parseTime(todaysHours.open)
    const c = parseTime(todaysHours.close)
    if (o == null || c == null) return false
    if (c < o) return nowMinutes >= o || nowMinutes < c
    return nowMinutes >= o && nowMinutes < c
  })()

  const mapsHref = (() => {
    const coords = (
      shop as unknown as {
        address?: { coordinates?: { lat?: number; lng?: number } }
      }
    ).address?.coordinates
    if (coords && typeof coords.lat === "number" && typeof coords.lng === "number") {
      return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    }
    const q = `${shop.address.street}, ${shop.address.city}`
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}`
  })()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-gradient-to-b from-primary/5 to-background border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="py-3 text-sm flex items-center gap-2" aria-label="Breadcrumb">
            <a
              href="/shops"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Shops
            </a>
            <span className="text-border">/</span>
            <span className="font-semibold truncate text-primary" aria-current="page">
              {shop.name}
            </span>
          </nav>

          {/* Shop Header */}
          <div className="pb-10 pt-4">
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              {/* Left: Shop Info */}
              <div className="flex-1">
                <div className="flex items-start gap-5">
                  {/* Logo */}
                  {shop.logo_url ? (
                    <button
                      onClick={() =>
                        setSelectedImage({
                          url: shop.logo_url!,
                          alt: shop.name,
                          title: `${shop.name} Logo`,
                        })
                      }
                      className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 ring-2 ring-primary/20 shrink-0 hover:ring-primary/40 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Image
                        src={shop.logo_url || "/placeholder.svg"}
                        alt={shop.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                        unoptimized={shop.logo_url.includes("convex.cloud")}
                      />
                    </button>
                  ) : (
                    <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-lg">
                      <Store className="h-16 w-16 text-white" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {shop.name}
                    </h1>

                    {shop.description && (
                      <p className="mt-3 text-muted-foreground max-w-xl line-clamp-2 text-base">
                        {shop.description}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      {/* Open/Closed Status */}
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-sm transition-all ${openNow
                          ? "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30"
                          : "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30"
                          }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${openNow ? "bg-green-500" : "bg-red-500"}`} />
                        {openNow ? "Open" : "Closed"}
                        <span className="text-xs opacity-75 ml-1">{todaysLabel}</span>
                      </span>

                      {/* Rating */}
                      {shop.rating && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 backdrop-blur-sm">
                          <Star className="h-4 w-4 fill-current" />
                          {shop.rating.toFixed(1)}
                        </span>
                      )}

                      {/* ETA Badge */}
                      {shopEta && (
                        <EtaBadge shopId={shop._id} eta={shopEta} className="text-xs" />
                      )}

                      {/* Active Status */}
                      {shop.is_active ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-primary/20 text-primary dark:text-primary border border-primary/30 backdrop-blur-sm">
                          ✓ Verified Seller
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border/50">
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Business Hours - Horizontal */}
                    {shop.business_hours && (
                      <div className="mt-6 pt-4 border-t border-border/30">
                        <div className="grid grid-cols-7 gap-1">
                          {hoursOrder.map((d) => {
                            const hours = (
                              shop.business_hours as Record<string, { open?: string; close?: string } | null | undefined>
                            )[d]
                            const isClosed = !hours || !hours.open || !hours.close
                            const isToday = d === todayKey

                            return (
                              <div
                                key={d}
                                className={`flex flex-col items-center justify-center py-2 px-1 rounded text-xs font-medium transition-all ${
                                  isToday
                                    ? "bg-primary/15 text-primary border border-primary/30"
                                    : isClosed
                                    ? "text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                <span className="font-semibold">{hoursLabel[d]}</span>
                                <span className={`text-[10px] ${isClosed ? "text-red-500" : "text-muted-foreground"}`}>
                                  {isClosed ? "Closed" : hours.open}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Contact Card */}
              <div className="w-full lg:w-80 space-y-4">
                <Card className="border-border/50 bg-card shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2">
                  <CardContent className="p-6 space-y-4">
                    {/* ETA Display */}
                    {shopEta && (
                      <div className="flex items-center gap-3 text-sm pb-2 border-b border-border">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex-1">
                          <span className="text-muted-foreground">Delivery Time</span>
                          <div className="font-semibold text-foreground">
                            {shopEta.minEta}-{shopEta.maxEta} mins
                          </div>
                        </div>
                      </div>
                    )}

                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <MapPin className="h-4 w-4 mt-0.5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white shrink-0" />
                      <span className="line-clamp-2">
                        {shop.address.street}, {shop.address.city}
                      </span>
                    </a>

                    <a
                      href={`tel:${shop.contact.phone}`}
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <Phone className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white shrink-0" />
                      <span>{shop.contact.phone}</span>
                    </a>

                    {shop.contact.email && (
                      <a
                        href={`mailto:${shop.contact.email}`}
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                      >
                        <Mail className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white shrink-0" />
                        <span className="truncate">{shop.contact.email}</span>
                      </a>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-lg bg-transparent">
                    <a href={`tel:${shop.contact.phone}`}>
                      <Phone className="h-4 w-4 mr-1.5" />
                      Call
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-lg bg-transparent">
                    <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                      <MapPin className="h-4 w-4 mr-1.5" />
                      Directions
                    </a>
                  </Button>
                </div>

                <Button
                  asChild
                  className="w-full rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-base py-6"
                >
                  <a href="#products">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Browse Products
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="products" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Products Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Products</h2>
                {products && products.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {products.length} {products.length === 1 ? "item" : "items"} available
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Sort by</span>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-44 rounded-lg border-neutral-200 dark:border-neutral-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            {sortedProducts && sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {sortedProducts.map((product) => (
                  <ShopProductCard
                    key={product._id}
                    product={product as any}
                    onAddToCart={(p) => handleAddToCart(p)}
                    href={`/pd/${product._id}/${generateSlug(product.name)}`}
                    onImageClick={({ url, alt, title }) =>
                      setSelectedImage({
                        url,
                        alt,
                        title: title ?? product.name,
                      })
                    }
                    eta={shopEta || undefined}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Products Available</h3>
                  <p className="text-sm text-muted-foreground">
                    This shop hasn&apos;t added any products yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          alt={selectedImage.alt}
          title={selectedImage.title}
        />
      )}
    </div>
  )
}
