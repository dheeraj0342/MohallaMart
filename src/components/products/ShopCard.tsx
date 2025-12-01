"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Star, ShoppingCart } from "lucide-react";
import type { Product } from "./ProductCard";

interface ShopProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  href?: string;
  className?: string;
  onImageClick?: (args: { url: string; alt: string; title?: string }) => void;
}

export default function ShopProductCard({
  product,
  onAddToCart,
  href,
  className,
  onImageClick,
}: ShopProductCardProps) {
  const router = useRouter();
  const hasImage = product.images && product.images.length > 0;
  const imageUrl = hasImage ? product.images[0] : "";
  const discountPercentage = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;
  const isInStock = typeof product.stock_quantity === "number" && product.stock_quantity > 0;

  const handleImageClick = (e: React.MouseEvent) => {
    if (onImageClick && hasImage) {
      e.stopPropagation();
      onImageClick({
        url: imageUrl,
        alt: product.name,
        title: product.name,
      });
    }
  };

  const imageContent = hasImage ? (
    <Image
      src={imageUrl}
      alt={product.name}
      fill
      className="object-contain px-3 py-4 transition-transform duration-300 group-hover:scale-105 bg-card"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      unoptimized={imageUrl.includes("convex.cloud")}
      priority={false}
      style={{
        color: "transparent",
      }}
      // Add a fallback background via className for situations where image fails to load
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.background = "var(--muted)";
      }}
    />
  ) : (
    <div className="flex items-center justify-center h-full">
      <Package className="h-14 w-14 text-muted-foreground" />
    </div>
  );

  const ImageWrapper = onImageClick && hasImage ? "button" : "div";
  const imageWrapperProps = ImageWrapper === "button"
    ? {
      type: "button" as const,
      onClick: handleImageClick,
      className: `relative w-full aspect-4/3 bg-muted overflow-hidden cursor-zoom-in flex items-center justify-center`,
    }
    : {
      className: "relative w-full aspect-4/3 bg-muted overflow-hidden flex items-center justify-center",
    };

  return (
    <div className={className}>
      <Card
        className={`group flex max-w-[220px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/40 ${href ? "cursor-pointer" : ""
          }`}
        onClick={href ? () => router.push(href) : undefined}
        role={href ? "link" : undefined}
        aria-label={href ? product.name : undefined}
      >
        {/* Image */}
        <ImageWrapper {...(imageWrapperProps as any)}>
          {imageContent}

          {/* Badges */}
          <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 z-10">
            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <span className="inline-flex items-center rounded-full bg-destructive text-destructive-foreground px-2 py-0.5 text-[11px] font-semibold shadow-sm">
                {discountPercentage}% OFF
              </span>
            )}
            {/* Featured Badge */}
            {product.is_featured && (
              <span className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[11px] font-semibold shadow-sm">
                Featured
              </span>
            )}
          </div>
        </ImageWrapper>

        {/* Content */}
        <CardContent className="flex flex-col gap-1.5 p-2 grow">
          {/* Delivery & Rating (match ProductCard) */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" />
                <path d="M6 3v3l2 1" stroke="currentColor" strokeLinecap="round" />
              </svg>
              13 mins
            </span>

            {product.rating && (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Title & optional description */}
          <div className="space-y-1">
            <h3 className="text-[13px] font-semibold leading-snug text-foreground line-clamp-2 min-h-[32px] group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Quantity / unit */}
          <p className="text-[11px] text-muted-foreground">
            {product.min_order_quantity} {product.unit}
          </p>

          {/* Price + CTA (match ProductCard layout, keep this card's CTA styling) */}
          <div className="mt-1 flex items-center justify-between gap-2">
            <div>
              <span className="text-base font-bold text-foreground">
                ₹{Math.round(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="ml-1 text-xs text-muted-foreground line-through">
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
              className="h-8 px-4 rounded-md border-2 border-green-600 text-green-600 font-semibold text-xs hover:bg-green-50 dark:hover:bg-green-950/40 disabled:opacity-50"
              variant="outline"
              aria-label={`Add ${product.name} to cart`}
            >
              ADD
            </Button>
          </div>

          {/* Stock meta + optional link */}
          <div className="mt-1 flex flex-col gap-1 text-[11px]">
            <div className="flex items-center justify-end">
              {isInStock ? (
                <span className="font-semibold text-green-600 dark:text-green-400">
                  In stock ({product.stock_quantity})
                </span>
              ) : (
                <span className="font-semibold text-red-600 dark:text-red-400">
                  Out of stock
                </span>
              )}
            </div>

            {/* Optional details link below, matching compact layout */}
            {href && (
              <Link
                href={href}
                className="text-[11px] font-semibold text-primary hover:text-primary/80 hover:underline text-center transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                View details →
              </Link>
            )}
          </div>

          {/* Spacer to push bottom content when needed */}
          <div className="mt-auto" />
        </CardContent>
      </Card>
    </div>
  );
}