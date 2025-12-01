"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { api } from "@/../../convex/_generated/api"
import { Loader2, Store, MapPin, Phone, Mail, Star, Package, Clock, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useStore } from "@/store/useStore"
import { useToast } from "@/hooks/useToast"
import { generateSlug } from "@/lib/utils"
import ImageModal from "@/components/ImageModal"

export default function ShopPage() {
  const params = useParams()
  const slug = params.slug as string
  const { addToCart } = useStore()
  const { success } = useToast()

  const [selectedImage, setSelectedImage] = useState<{
    url: string
    alt: string
    title?: string
  } | null>(null)
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc" | "rating">("popular")

  const shop = useQuery(api.shops.getShopBySlug, { slug })
  const products = useQuery(api.products.getProductsByShop, shop ? { shop_id: shop._id, is_available: true } : "skip")

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="py-4 text-sm flex items-center gap-2" aria-label="Breadcrumb">
            <a
              href="/shops"
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Shops
            </a>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <span className="text-neutral-900 dark:text-white font-medium truncate" aria-current="page">
              {shop.name}
            </span>
          </nav>

          {/* Shop Header */}
          <div className="pb-8 pt-2">
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
                      className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-700 flex-shrink-0 hover:ring-2 hover:ring-neutral-900 dark:hover:ring-white transition-all duration-200"
                    >
                      <Image
                        src={shop.logo_url || "/placeholder.svg"}
                        alt={shop.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                        unoptimized={shop.logo_url.includes("convex.cloud")}
                      />
                    </button>
                  ) : (
                    <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-neutral-900 dark:bg-white flex items-center justify-center flex-shrink-0">
                      <Store className="h-12 w-12 text-white dark:text-neutral-900" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                      {shop.name}
                    </h1>

                    {shop.description && (
                      <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-xl line-clamp-2">
                        {shop.description}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {/* Open/Closed Status */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                          openNow
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${openNow ? "bg-green-500" : "bg-red-500"}`} />
                        {openNow ? "Open" : "Closed"}
                        <span className="text-neutral-500 dark:text-neutral-500 ml-1">{todaysLabel}</span>
                      </span>

                      {/* Rating */}
                      {shop.rating && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                          <Star className="h-3 w-3 fill-current" />
                          {shop.rating.toFixed(1)}
                        </span>
                      )}

                      {/* Active Status */}
                      {shop.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          Verified Seller
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Contact Card */}
              <div className="w-full lg:w-80 space-y-4">
                <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                    >
                      <MapPin className="h-4 w-4 mt-0.5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white flex-shrink-0" />
                      <span className="line-clamp-2">
                        {shop.address.street}, {shop.address.city}
                      </span>
                    </a>

                    <a
                      href={`tel:${shop.contact.phone}`}
                      className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                    >
                      <Phone className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white flex-shrink-0" />
                      <span>{shop.contact.phone}</span>
                    </a>

                    {shop.contact.email && (
                      <a
                        href={`mailto:${shop.contact.email}`}
                        className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                      >
                        <Mail className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white flex-shrink-0" />
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
                  className="w-full rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                >
                  <a href="#products">
                    <ShoppingCart className="h-4 w-4 mr-2" />
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Products</h2>
                {products && products.length > 0 && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <Card
                    key={product._id}
                    className="group border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300"
                  >
                    {/* Product Image */}
                    <button
                      onClick={() => {
                        if (product.images && product.images.length > 0) {
                          setSelectedImage({
                            url: product.images[0],
                            alt: product.name,
                            title: product.name,
                          })
                        }
                      }}
                      className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden"
                    >
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized={product.images[0].includes("convex.cloud")}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
                        </div>
                      )}

                      {/* Discount Badge */}
                      {product.original_price && product.original_price > product.price && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
                          {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                        </span>
                      )}

                      {/* Featured Badge */}
                      {product.is_featured && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                          Featured
                        </span>
                      )}
                    </button>

                    <CardContent className="p-5">
                      {/* Product Name */}
                      <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                        {product.name}
                      </h3>

                      {/* Description */}
                      {product.description && (
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Price Row */}
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-neutral-900 dark:text-white">
                              ₹{product.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-neutral-400">/{product.unit}</span>
                          </div>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-sm text-neutral-400 line-through">
                              ₹{product.original_price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {product.rating && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-neutral-600 dark:text-neutral-400">{product.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Stock Info */}
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-neutral-500 dark:text-neutral-400">
                          Min: {product.min_order_quantity} {product.unit}
                        </span>
                        {product.stock_quantity > 0 ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            In Stock ({product.stock_quantity})
                          </span>
                        ) : (
                          <span className="text-red-500 font-medium">Out of Stock</span>
                        )}
                      </div>

                      {/* View Details Link */}
                      <div className="mt-3">
                        <a
                          href={`/product/${generateSlug(product.name)}`}
                          className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:underline"
                        >
                          View details
                        </a>
                      </div>

                      {/* Add to Cart */}
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock_quantity === 0}
                        className="w-full mt-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 disabled:opacity-50"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No Products Available</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    This shop hasn&apos;t added any products yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Business Hours */}
          {shop.business_hours && (
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-6">
                <Card className="border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-white">
                      <Clock className="h-4 w-4" />
                      Business Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {hoursOrder.map((d) => {
                        const hours = (
                          shop.business_hours as Record<string, { open?: string; close?: string } | null | undefined>
                        )[d]
                        const isClosed = !hours || !hours.open || !hours.close
                        const isToday = d === todayKey

                        return (
                          <div
                            key={d}
                            className={`flex items-center justify-between py-2 px-2 rounded-lg text-sm ${
                              isToday ? "bg-neutral-100 dark:bg-neutral-800" : ""
                            }`}
                          >
                            <span
                              className={`font-medium ${
                                isToday ? "text-neutral-900 dark:text-white" : "text-neutral-600 dark:text-neutral-400"
                              }`}
                            >
                              {hoursLabel[d]}
                              {isToday && <span className="ml-2 text-xs text-neutral-400">Today</span>}
                            </span>
                            <span className={isClosed ? "text-red-500" : "text-neutral-600 dark:text-neutral-400"}>
                              {isClosed ? "Closed" : `${hours.open} - ${hours.close}`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </aside>
          )}
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
