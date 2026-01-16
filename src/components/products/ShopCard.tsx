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
      className="object-contain px-2 py-3 transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      unoptimized={imageUrl.includes("convex.cloud")}
      priority={false}
      style={{ color: "transparent" }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.background = "white";
      }}
    />
  ) : (
    <div className="flex items-center justify-center h-full bg-muted/10">
      <Package className="h-12 w-12 text-muted-foreground/50" />
    </div>
  );

  const ImageWrapper = onImageClick && hasImage ? "button" : "div";
  const imageWrapperProps = ImageWrapper === "button"
    ? {
        type: "button" as const,
        onClick: handleImageClick,
        className: `relative w-full aspect-square bg-muted/10 overflow-hidden cursor-zoom-in flex items-center justify-center rounded-t-xl`,
      }
    : {
        className: "relative w-full aspect-square bg-muted/10 overflow-hidden flex items-center justify-center rounded-t-xl",
      };

  return (
    <div className={className}>
      <Card
        className={`group flex w-full max-w-none flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 ${href ? "cursor-pointer" : ""}`}
        onClick={href ? () => router.push(href) : undefined}
        role={href ? "link" : undefined}
        aria-label={href ? product.name : undefined}
      >
        <ImageWrapper {...(imageWrapperProps as any)}>
          {imageContent}

          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1 z-10">
            <div className="flex items-center gap-1 flex-wrap">
              {discountPercentage > 0 && (
                <Badge className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 shadow-md rounded-md">
                  {discountPercentage}% OFF
                </Badge>
              )}
              
              {isLowStock && (
                <Badge className="bg-orange-500 text-white text-[9px] font-semibold px-2 py-0.5 shadow-md rounded-md">
                  Only {product.stock_quantity}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {showQuickView && onQuickView && (
                <button
                  onClick={handleQuickView}
                  className="p-1.5 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white transition-all shadow-sm hover:shadow-md"
                  aria-label="Quick view"
                >
                  <Eye className="h-4 w-4 text-foreground" />
                </button>
              )}

              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(product);
                  }}
                  className="p-1.5 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white transition-all shadow-sm hover:shadow-md"
                  aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`h-4 w-4 transition-all ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-foreground hover:text-red-500"
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          {product.is_featured && (
            <div className="absolute bottom-2 left-2 z-10">
              <Badge className="bg-green-500 text-white text-[9px] font-bold px-2 py-1 shadow-md rounded-md flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Featured
              </Badge>
            </div>
          )}
        </ImageWrapper>

        <CardContent className="flex flex-col gap-2.5 p-3 grow">
          <div className="flex items-center justify-between gap-2">
            <EtaBadge 
              shopId={product.shop_id} 
              eta={eta} 
              variant="compact" 
              className="text-[9px]"
            />

            {product.rating && (
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] font-bold text-yellow-700">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-medium">{product.unit}</span>
              {isInStock && product.stock_quantity && (
                <span className="text-primary font-semibold text-[10px] bg-primary/10 px-1.5 py-0.5 rounded">
                  {product.stock_quantity} left
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-bold text-foreground">
                ₹{Math.round(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-[9px] text-muted-foreground line-through">
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
              size="sm"
              className={`h-9 px-3 rounded-lg font-bold text-xs transition-all duration-200 ${
                isInStock
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg active:scale-95"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
