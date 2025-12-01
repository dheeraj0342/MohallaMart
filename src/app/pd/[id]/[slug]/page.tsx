"use client"

import Image from "next/image"
import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/../../convex/_generated/api"
import type { Id } from "@/../../convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Package, ShoppingCart, Heart, Star } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useToast } from "@/hooks/useToast"
import { useState } from "react"
import { type Product } from "@/components/products/ProductCard"
import { RelatedProductsRow } from "@/components/products/RelatedProductsRow"
import ImageModal from "@/components/ImageModal"

export default function ProductPdPage() {
  const params = useParams()
  const idParam = params.id as string
  const slug = params.slug as string
  const { addToCart } = useStore()
  const { success } = useToast()
  const [qty, setQty] = useState<number>(1)
  const [grade, setGrade] = useState<string>("Standard")
  const [wish, setWish] = useState<boolean>(false)
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)


  const isValidConvexId = typeof idParam === "string" && /^[a-z0-9]{20,}$/i.test(idParam)
  const productById = useQuery(
    api.products.getProduct,
    isValidConvexId ? { id: idParam as Id<"products"> } : "skip",
  )
  const productBySlug = useQuery(api.products.getProductBySlug, slug ? { slug } : "skip")

  const product = productById || productBySlug || null

  // Preload a pool of products to build related sections client-side
  const relatedPool = useQuery(api.products.searchProducts, {
    query: "",
    is_available: true,
    limit: 60,
  })

  const discount =
    product && product.original_price && product.original_price > product.price
      ? Math.round(
        ((product.original_price - product.price) / product.original_price) * 100,
      )
      : 0

  const handleAddToCart = (p: Product) => {
    if (!p) return
    addToCart({
      id: p._id,
      name: `${p.name} (${p.unit})`,
      price: p.price,
      ...(p.images && p.images.length > 0 && { image: p.images[0] }),
      quantity: Math.max(p.min_order_quantity, qty),
      productId: p._id as unknown as Id<"products">,
      grade,
    })
    success(`${p.name} added to cart!`)
  }

  if (productById === undefined || productBySlug === undefined) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-neutral-200 dark:border-neutral-800" />
              <Loader2 className="h-16 w-16 animate-spin text-neutral-900 dark:text-white absolute inset-0" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 animate-pulse">Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  if (product === null) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl bg-white dark:bg-neutral-900">
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-neutral-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Product Not Found</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              The product you are looking for doesn&apos;t exist or has been removed.
            </p>
            <Button asChild className="rounded-full px-8">
              <a href="/shops">Browse Shops</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const images = Array.isArray(product.images) ? product.images : []
  const activeImage =
    images.length > 0 ? images[Math.min(activeImageIndex, images.length - 1)] : null

  const unitPrice = product.price
  const totalPrice = unitPrice * qty

  const pool = (relatedPool ?? []) as any[]

  const similarProducts = pool.filter(
    (p) =>
      p._id !== product._id &&
      p.category_id === product.category_id &&
      p.shop_id === product.shop_id,
  )

  const topCategoryProducts = [...pool]
    .filter((p) => p.category_id === product.category_id)
    .sort((a, b) => {
      const salesDiff = (b.total_sales ?? 0) - (a.total_sales ?? 0)
      if (salesDiff !== 0) return salesDiff
      return (b.rating ?? 0) - (a.rating ?? 0)
    })
    .slice(0, 10)

  const peopleAlsoBought = [...pool]
    .filter(
      (p) =>
        p._id !== product._id &&
        p.shop_id === product.shop_id &&
        (p.total_sales ?? 0) > 0,
    )
    .sort((a, b) => (b.total_sales ?? 0) - (a.total_sales ?? 0))

  const adaptProductForCard = (p: any): Product => ({
    _id: p._id,
    name: p.name,
    price: p.price,
    original_price: p.original_price,
    images: Array.isArray(p.images) ? p.images : [],
    description: p.description,
    stock_quantity: p.stock_quantity,
    unit: p.unit,
    rating: p.rating,
    min_order_quantity: p.min_order_quantity,
    total_sales: p.total_sales,
    is_featured: p.is_featured,
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 text-sm text-muted-foreground">
          <a href="/shops" className="hover:text-primary transition-colors">
            Shops
          </a>
          <span className="mx-1">/</span>
          <span className="text-foreground line-clamp-1 align-middle">
            {product.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Image gallery */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <button
                type="button"
                className="relative w-full aspect-4/3 rounded-lg bg-muted overflow-hidden"
                onClick={() => activeImage && setIsImageModalOpen(true)}
                aria-label="View product image"
              >
                {activeImage ? (
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={activeImage.includes("convex.cloud")}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </button>

              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {images.map((src, idx) => (
                    <button
                      key={src + idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border ${idx === activeImageIndex
                        ? "border-primary ring-1 ring-primary"
                        : "border-border"
                        }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <Image
                        src={src}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized={src.includes("convex.cloud")}
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Details */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl sm:text-2xl font-bold leading-snug">
                {product.name}
              </CardTitle>
              {/* Ratings + meta */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {product.rating && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {product.rating.toFixed(1)}
                  </span>
                )}
                {product.total_sales ? (
                  <span className="text-[11px]">
                    {product.total_sales}+ bought
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-6">
              {product.description && (
                <p className="text-muted-foreground">{product.description}</p>
              )}

              <div className="flex items-end justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ₹{unitPrice.toFixed(2)} each × {qty} {product.unit}
                  </div>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.original_price.toFixed(2)}
                    </span>
                  )}
                  {discount > 0 && (
                    <div className="inline-flex items-center rounded-full bg-(--success-bg-light) px-2 py-0.5 text-[11px] font-medium text-(--success-fg)">
                      {discount}% OFF today
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  {product.stock_quantity > 0 ? (
                    <span className="font-medium text-green-600 dark:text-green-400">
                      In Stock ({product.stock_quantity})
                    </span>
                  ) : (
                    <span className="font-medium text-red-500">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity & Grade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-neutral-500 dark:text-neutral-400">
                    Quantity
                  </label>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-2 py-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => setQty(Math.max(product.min_order_quantity, qty - 1))}
                      aria-label="Decrease quantity"
                    >
                      -
                    </Button>
                    <div className="min-w-10 text-center text-sm font-medium">
                      {qty}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => setQty(qty + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </Button>
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Min: {product.min_order_quantity} {product.unit}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500 dark:text-neutral-400">
                    Quality Grade
                  </label>
                  <div className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm flex items-center">
                    Premium
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Button
                  onClick={() => handleAddToCart(product as Product)}
                  disabled={product.stock_quantity === 0}
                  className="w-full rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>

                <button
                  onClick={() => setWish((w) => !w)}
                  aria-pressed={wish}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <Heart className={`h-4 w-4 ${wish ? "text-red-500" : "text-neutral-500"}`} />
                  {wish ? "Added to Wishlist" : "Add to Wishlist"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related sections */}
        <div className="mt-10 space-y-10">
          {similarProducts.length > 0 && (
            <RelatedProductsRow
              title="Similar products"
              products={similarProducts.map(adaptProductForCard)}
            />
          )}

          {topCategoryProducts.length > 0 && (
            <RelatedProductsRow
              title="Top in this category"
              products={topCategoryProducts.map(adaptProductForCard)}
              showRank
            />
          )}

          {peopleAlsoBought.length > 0 && (
            <RelatedProductsRow
              title="People also bought"
              products={peopleAlsoBought.map(adaptProductForCard)}
            />
          )}
        </div>
      </div>

      {/* Fullscreen image modal for active image */}
      {activeImage && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={activeImage}
          alt={product.name}
          title={product.name}
        />
      )}
    </div>
  )
}
