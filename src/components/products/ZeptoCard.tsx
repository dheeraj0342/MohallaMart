"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Package, Star, Heart } from "lucide-react";
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

interface ZeptoCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  href?: string;
  eta?: EtaInfo;
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
  className?: string;
}

export function ZeptoCard({ 
  product, 
  onAddToCart, 
  href, 
  eta,
  showQuickView = false,
  onQuickView,
  className
}: ZeptoCardProps) {
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

  const discountAmount = product.original_price ? product.original_price - product.price : 0;
  const isInStock = typeof product.stock_quantity === "number" && product.stock_quantity > 0;
  const targetHref = href ?? `/pd/${product._id}/${generateSlug(product.name || "product")}`;

  return (
    <div 
      className={`relative flex flex-col w-full min-w-[160px] max-w-[200px] bg-white rounded-xl overflow-hidden cursor-pointer group hover:shadow-md transition-shadow duration-300 ${className || ""}`}
      onClick={() => router.push(targetHref)}
    >
      <div className="relative aspect-square w-full p-2">
        {hasImage ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-contain p-2"
            unoptimized={img.includes("convex.cloud")}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/20">
            <Package className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}

        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white shadow-sm"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </button>

        <div className="absolute bottom-2 right-2 z-10 transition-transform group-hover:scale-105">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={!isInStock}
            size="sm"
            className="h-8 px-4 rounded-lg font-bold text-xs uppercase bg-white border border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            {isInStock ? "ADD" : "OUT"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col p-3 pt-0 gap-1.5 flex-1">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-base font-bold text-gray-900">₹{Math.round(product.price)}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
              ₹{Math.round(product.original_price)}
            </span>
          )}
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center text-[10px] font-bold text-primary italic leading-none">
             <span>₹{Math.round(discountAmount)} OFF</span>
          </div>
        )}

        <h3 className="text-[13px] font-medium text-gray-800 line-clamp-2 leading-snug h-9">
          {product.name}
        </h3>

        <div className="text-[11px] text-muted-foreground font-medium">
          {product.unit}
        </div>

        {product.is_featured && (
          <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 w-fit px-1.5 py-0.5 rounded leading-none">
            Featured
          </div>
        )}

        <div className="mt-auto pt-1 flex items-center justify-between">
          {product.rating ? (
            <div className="flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700">
               <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" />
               <span className="text-[11px] font-bold">{product.rating.toFixed(1)}</span>
               <span className="text-[10px] text-emerald-600/70 ml-0.5">(2.5k)</span>
            </div>
          ) : (
            <div className="h-5" />
          )}
          
          <EtaBadge 
            shopId={product.shop_id} 
            eta={eta} 
            variant="compact" 
            className="text-[9px] font-bold bg-muted/30 px-1.5 py-0.5 rounded text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}
