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
      className="object-cover group-hover:scale-105 transition-transform duration-300"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      unoptimized={imageUrl.includes("convex.cloud")}
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
      className: `relative aspect-square w-full bg-muted overflow-hidden cursor-zoom-in`,
    }
    : {
      className: "relative aspect-square w-full bg-muted overflow-hidden",
    };

  return (
    <div className={className}>
      <Card
        className={`group h-full flex flex-col overflow-hidden border-border bg-card hover:shadow-lg hover:border-primary/50 transition-all duration-300 ${href ? "cursor-pointer" : ""
          }`}
        onClick={href ? () => router.push(href) : undefined}
        role={href ? "link" : undefined}
        aria-label={href ? product.name : undefined}
      >
        {/* Image Container - Square Aspect */}
        <ImageWrapper {...(imageWrapperProps as any)}>
          {imageContent}

          {/* Top Badges Row */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
            <div className="flex flex-col gap-2">
              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <span className="inline-block rounded-full bg-destructive text-destructive-foreground px-2.5 py-1 text-xs font-semibold shadow-md">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Featured Badge */}
            {product.is_featured && (
              <span className="inline-block rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-xs font-semibold shadow-md">
                Featured
              </span>
            )}
          </div>
        </ImageWrapper>

        {/* Content */}
        <CardContent className="flex flex-col flex-grow gap-3 p-4">
          {/* Title & Description */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Price & Rating Row */}
          <div className="flex items-end justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-foreground">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  /{product.unit}
                </span>
              </div>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{product.original_price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Rating Badge */}
            {product.rating && (
              <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Meta Information Row */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              Min {product.min_order_quantity} {product.unit}
            </span>
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

          {/* Actions - Auto margin top to push to bottom */}
          <div className="mt-auto pt-2 flex flex-col gap-2 border-t border-border">
            {href && (
              <Link
                href={href}
                className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline text-center transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                View details →
              </Link>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              disabled={!isInStock}
              className="w-full font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              size="default"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isInStock ? "Add to cart" : "Out of stock"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}