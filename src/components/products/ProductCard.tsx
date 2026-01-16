"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Star, 
  Heart, 
  Eye,
  ShoppingCart,
  Zap,
  Shield,
  Truck
} from "lucide-react";
import { generateSlug } from "@/lib/utils";
import { EtaBadge, type EtaInfo } from "./EtaBadge";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useStore } from "@/store/useStore";
import { Id } from "@/../convex/_generated/dataModel";
import { useToast } from "@/hooks/useToast";

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
  shop_id?: string;
}

export type { EtaInfo };

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  href?: string;
  eta?: EtaInfo;
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
  className?: string;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  href, 
  eta,
  showQuickView = false,
  onQuickView,
  className
}: ProductCardProps) {
  const router = useRouter();
  const { user } = useStore();
  const { success, error } = useToast();
  const hasImage = product.images?.length > 0;
  const img = hasImage ? product.images[0] : "";

  const toggleFavorite = useMutation(api.favorites.toggleFavoriteProduct);
  const isFavorite = useQuery(
    api.favorites.isFavorite,
    user?.id
      ? { user_id: user.id, product_id: product._id as Id<"products"> }
      : "skip"
  );

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) {
      error("Please login to add items to your wishlist");
      return;
    }

    try {
      const added = await toggleFavorite({
        user_id: user.id,
        product_id: product._id as Id<"products">,
      });
      
      if (added) {
        success(`${product.name} added to favorites`);
      } else {
        success(`${product.name} removed from favorites`);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      error("Failed to update wishlist");
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(
        ((product.original_price - product.price) / product.original_price) *
        100,
      )
      : 0;

  const isInStock =
    typeof product.stock_quantity === "number" && product.stock_quantity > 0;
    
  const isLowStock = isInStock && product.stock_quantity !== undefined && product.stock_quantity <= 5;

  const targetHref =
    href ?? `/pd/${product._id}/${generateSlug(product.name || "product")}`;

  return (
    <Card
      className={`group flex w-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] cursor-pointer relative ${className || ""}`}
      onClick={() => router.push(targetHref)}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
        {hasImage ? (
          <Link
            href={targetHref}
            className="block w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={img}
              alt={product.name}
              fill
              className="object-contain px-3 py-4 transition-transform duration-500 group-hover:scale-110"
              unoptimized={img.includes("convex.cloud")}
            />
          </Link>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-1 left-1 right-1 flex items-start justify-between gap-1 z-10">
          <div className="flex items-center gap-0.5">
            {/* Discount Badge */}
            {discount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 shadow-lg">
                {discount}% OFF
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

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className="p-1 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card transition-all shadow-sm hover:shadow-md"
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`h-3 w-3 transition-colors ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-foreground hover:text-red-500"
                }`}
              />
            </button>
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
      </div>

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
            <Link href={targetHref} onClick={(e) => e.stopPropagation()}>
              {product.name}
            </Link>
          </h3>

          {/* Quantity Info */}
          <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
            <span className="font-medium">Min: {product.min_order_quantity}</span>
            {isInStock && product.stock_quantity && (
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
  );
}
