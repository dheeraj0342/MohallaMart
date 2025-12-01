"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart } from "lucide-react";

export interface Product {
  _id: string;
  name: string;
  price: number;
  original_price?: number;
  images: string[];
  description?: string;
  stock_quantity?: number;
  unit: string;
  rating?: number;
  min_order_quantity: number;
  total_sales?: number;
  is_featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  href?: string;
}

export function ProductCard({ product, onAddToCart, href }: ProductCardProps) {
  const router = useRouter();
  const hasImage = product.images && product.images.length > 0;
  const imageUrl = hasImage ? product.images[0] : "";
  const discountPercentage = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;
  const isInStock = typeof product.stock_quantity === "number" && product.stock_quantity > 0;

  return (
    <Card
      className={`group h-full flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 ${href ? "cursor-pointer" : ""
        }`}
      onClick={href ? () => router.push(href) : undefined}
      role={href ? "link" : undefined}
      aria-label={href ? product.name : undefined}
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-muted overflow-hidden flex items-center justify-center">
        {href ? (
          <Link href={href} className="block w-full h-full">
            {hasImage ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                unoptimized={imageUrl.includes("convex.cloud")}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </Link>
        ) : (
          <>
            {hasImage ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                unoptimized={imageUrl.includes("convex.cloud")}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </>
        )}

        {/* Optional discount / featured badges, kept subtle */}
        {discountPercentage > 0 && (
          <Badge className="absolute top-2 right-2 z-10 bg-destructive/90 text-destructive-foreground text-[11px] px-2 py-0.5">
            {discountPercentage}% OFF
          </Badge>
        )}
        {product.is_featured && (
          <Badge className="absolute top-2 left-2 z-10 bg-primary/90 text-primary-foreground text-[11px] px-2 py-0.5">
            Featured
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 flex flex-col grow">
        {/* Delivery Time Badge */}
        <div className="flex items-center gap-1 mb-3">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="text-muted-foreground"
          >
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
            <path
              d="M6 3v3l2 1"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-xs text-muted-foreground font-medium">13 MINS</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 mb-3 min-h-10 group-hover:text-primary transition-colors">
          {href ? (
            <Link href={href} onClick={(e) => e.stopPropagation()}>
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h3>

        {/* Size / unit */}
        <p className="text-xs text-muted-foreground mb-4">
          {product.min_order_quantity} {product.unit}
        </p>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-bold text-foreground">
              ₹{Math.round(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{Math.round(product.original_price)}
              </span>
            )}
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={!isInStock}
            variant="outline"
            className="px-6 h-9 rounded-md border-2 border-green-600 text-green-600 text-sm font-semibold hover:bg-green-50 hover:text-green-700 hover:border-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            size="sm"
            aria-label={`Add ${product.name} to cart`}
          >
            ADD
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}