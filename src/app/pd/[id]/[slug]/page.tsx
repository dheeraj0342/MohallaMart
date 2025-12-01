"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { useQuery } from "convex/react"
import { api } from "@/../../convex/_generated/api"
import type { Id } from "@/../../convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Package, ShoppingCart } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useToast } from "@/hooks/useToast"

export default function ProductPdPage() {
  const params = useParams()
  const idParam = params.id as string
  const slug = params.slug as string
  const { addToCart } = useStore()
  const { success } = useToast()

  const isValidConvexId = typeof idParam === "string" && /^[a-z0-9]{20,}$/i.test(idParam)
  const productById = useQuery(
    api.products.getProduct,
    isValidConvexId ? { id: idParam as Id<"products"> } : "skip",
  )
  const productBySlug = useQuery(api.products.getProductBySlug, slug ? { slug } : "skip")

  const product = productById || productBySlug || null

  const handleAddToCart = () => {
    if (!product) return
    addToCart({
      id: product._id,
      name: `${product.name} (${product.unit})`,
      price: product.price,
      ...(product.images && product.images.length > 0 && { image: product.images[0] }),
      quantity: product.min_order_quantity,
    })
    success(`${product.name} added to cart!`)
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="relative h-80 w-full bg-neutral-100 dark:bg-neutral-800">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized={product.images[0].includes("convex.cloud")}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
                </div>
              )}
            </div>
          </Card>

          <Card className="border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.description && (
                <p className="text-neutral-600 dark:text-neutral-400">{product.description}</p>
              )}

              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">₹{product.price.toFixed(2)}</span>
                    <span className="text-sm text-neutral-400">/{product.unit}</span>
                  </div>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-neutral-400 line-through">₹{product.original_price.toFixed(2)}</span>
                  )}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {product.stock_quantity > 0 ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">In Stock ({product.stock_quantity})</span>
                  ) : (
                    <span className="text-red-500 font-medium">Out of Stock</span>
                  )}
                </div>
              </div>

              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Min order: {product.min_order_quantity} {product.unit}
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="w-full mt-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

