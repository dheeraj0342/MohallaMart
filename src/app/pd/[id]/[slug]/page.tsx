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
import type { Product } from "@/components/products/ProductCard"

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


  const isValidConvexId = typeof idParam === "string" && /^[a-z0-9]{20,}$/i.test(idParam)
  const productById = useQuery(
    api.products.getProduct,
    isValidConvexId ? { id: idParam as Id<"products"> } : "skip",
  )
  const productBySlug = useQuery(api.products.getProductBySlug, slug ? { slug } : "skip")

  const product = productById || productBySlug || null

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Image gallery */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="relative w-full aspect-4/3 rounded-lg bg-muted overflow-hidden">
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
              </div>

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
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.description && (
                <p className="text-muted-foreground">{product.description}</p>
              )}

              {/* Ratings */}
              {product.rating && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm text-muted-foreground">{product.rating.toFixed(1)} / 5</span>
                </div>
              )}

              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">₹{product.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">/{product.unit}</span>
                  </div>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.original_price.toFixed(2)}
                    </span>
                  )}
                  {product.original_price && product.original_price > product.price && (
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {product.stock_quantity > 0 ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">In Stock ({product.stock_quantity})</span>
                  ) : (
                    <span className="text-red-500 font-medium">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Quantity & Grade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Quantity</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setQty(Math.max(product.min_order_quantity, qty - 1))}>-</Button>
                    <div className="min-w-12 text-center">{qty}</div>
                    <Button variant="outline" onClick={() => setQty(qty + 1)}>+</Button>
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">Min: {product.min_order_quantity} {product.unit}</div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Quality Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option>Standard</option>
                    <option>Premium</option>
                    <option>Economy</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={() => handleAddToCart(product as Product)}
                disabled={product.stock_quantity === 0}
                className="w-full mt-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>

              <button
                onClick={() => setWish((w) => !w)}
                aria-pressed={wish}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <Heart className={`h-4 w-4 ${wish ? "text-red-500" : "text-neutral-500"}`} />
                {wish ? "Added to Wishlist" : "Add to Wishlist"}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
