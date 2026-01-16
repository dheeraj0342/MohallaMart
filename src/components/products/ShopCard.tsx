"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye,
  Zap,
  Shield,
  Truck
} from "lucide-react";
import type { Product } from "./ProductCard";
import { EtaBadge, type EtaInfo } from "./EtaBadge";

interface ShopProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  isFavorite?: boolean;
  href?: string;
  className?: string;
  onImageClick?: (args: { url: string; alt: string; title?: string }) => void;
  eta?: EtaInfo;
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
}

export default function ShopProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  href,
  className,
  onImageClick,
  eta,
  showQuickView = false,
  onQuickView,
}: ShopProductCardProps) {
  const router = useRouter();
  const hasImage = product.images && product.images.length > 0;
  const imageUrl = hasImage ? product.images[0] : "";
  
  const discountPercentage = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;
    
  const isInStock = typeof product.stock_quantity === "number" && product.stock_quantity > 0;
  const isLowStock = isInStock && product.stock_quantity !== undefined && product.stock_quantity <= 5;

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

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const imageContent = hasImage ? (
    <Image
      src={imageUrl}
      alt={product.name}
      fill
      className="object-contain px-3 py-4 transition-transform duration-500 group-hover:scale-110"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      unoptimized={imageUrl.includes("convex.cloud")}
      priority={false}
      style={{ color: "transparent" }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.background = "white";
      }}
    />
  ) : (
    <div className="flex items-center justify-center h-full bg-white">
      <Package className="h-16 w-16 text-muted-foreground" />
    </div>
  );

  const ImageWrapper = onImageClick && hasImage ? "button" : "div";
  const imageWrapperProps = ImageWrapper === "button"
    ? {
        type: "button" as const,
        onClick: handleImageClick,
        className: `relative w-full aspect-square bg-white overflow-hidden cursor-zoom-in flex items-center justify-center`,
      }
    : {
        className: "relative w-full aspect-square bg-white overflow-hidden flex items-center justify-center",
      };

  return (
    <div className={className}>
      <Card
        className={`group flex w-full max-w-none flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] ${href ? "cursor-pointer" : ""}`}
        onClick={href ? () => router.push(href) : undefined}
        role={href ? "link" : undefined}
        aria-label={href ? product.name : undefined}
      >
        {/* Image Section */}
        <ImageWrapper {...(imageWrapperProps as any)}>
          {imageContent}

          {/* Top Badges */}
          <div className="absolute top-1 left-1 right-1 flex items-start justify-between gap-1 z-10">
            <div className="flex items-center gap-0.5">
              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 shadow-lg">
                  {discountPercentage}% OFF
                </Badge>
              )}
              
              {/* Low Stock Badge */}
              {isLowStock && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-[8px] font-semibold px-1.5 py-0.5 shadow-lg">
                  Only {product.stock_quantity}
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-0.5">
              {/* Quick View */}
              {showQuickView && onQuickView && (
                <button
                  onClick={handleQuickView}
                  className="p-1 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card transition-all shadow-sm hover:shadow-md"
                  aria-label="Quick view"
                >
                  <Eye className="h-3 w-3 text-foreground" />
                </button>
              )}

              {/* Favorite */}
              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(product);
                  }}
                  className="p-1 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card transition-all shadow-sm hover:shadow-md"
                  aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`h-3 w-3 transition-colors ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-foreground hover:text-red-500"
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Featured Badge */}
          {product.is_featured && (
            <div className="absolute bottom-1 left-1">
              <Badge className="bg-green-500 hover:bg-green-600 text-white text-[8px] font-bold px-1.5 py-0.5 shadow-lg flex items-center gap-0.5">
                <Zap className="h-2.5 w-2.5" />
                Featured
              </Badge>
            </div>
          )}
        </ImageWrapper>

        {/* Content Section */}
        <CardContent className="flex flex-col gap-2 p-2.5 grow">
          {/* Delivery & Rating */}
          <div className="flex items-center justify-between gap-1">
            <EtaBadge 
              shopId={product.shop_id} 
              eta={eta} 
              variant="compact" 
              className="text-[8px]"
            />

            {product.rating && (
              <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                <span className="text-[9px] font-bold text-yellow-700">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-1">
            {/* Title */}
            <h3 className="text-xs font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Quantity Info */}
            <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
              <span className="font-medium">Min: {product.min_order_quantity}</span>
              {isInStock && (
                <span className="text-primary font-medium text-[7px]">
                  ✓ {product.stock_quantity}
                </span>
              )}
            </div>
          </div>

          {/* Price Section */}
          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-foreground">
                  ₹{Math.round(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-[10px] text-muted-foreground line-through">
                    ₹{Math.round(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              disabled={!isInStock}
              size="sm"
              className={`h-8 px-2.5 rounded-lg font-bold text-xs transition-all duration-200 ${
                isInStock
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg active:scale-95"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
