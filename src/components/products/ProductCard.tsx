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
      className={`group flex w-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 cursor-pointer relative ${className || ""}`}
      onClick={() => router.push(targetHref)}
    >
      <div className="relative w-full aspect-square bg-muted/10 flex items-center justify-center overflow-hidden rounded-t-xl">
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
              className="object-contain px-2 py-3 transition-transform duration-500 group-hover:scale-105"
              unoptimized={img.includes("convex.cloud")}
            />
          </Link>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1 z-10">
          <div className="flex items-center gap-1 flex-wrap">
            {discount > 0 && (
              <Badge className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 shadow-md rounded-md">
                {discount}% OFF
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

            <button
              onClick={handleToggleFavorite}
              className="p-1.5 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white transition-all shadow-sm hover:shadow-md"
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`h-4 w-4 transition-all ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-foreground hover:text-red-500"
                }`}
              />
            </button>
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
      </div>

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
            <Link href={targetHref} onClick={(e) => e.stopPropagation()}>
              {product.name}
            </Link>
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
  );
}
