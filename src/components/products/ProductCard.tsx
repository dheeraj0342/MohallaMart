"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  shop_id?: string; // Shop ID for ETA calculation
}

export type { EtaInfo };

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  href?: string;
  eta?: EtaInfo;
}

export function ProductCard({ product, onAddToCart, href, eta }: ProductCardProps) {
  const router = useRouter();
  const { user } = useStore();
  const { success, error } = useToast();
  const hasImage = product.images?.length > 0;
  const img = hasImage ? product.images[0] : "";

  const toggleFavorite = useMutation(api.favorites.toggleFavoriteProduct);
  const isFavorite = useQuery(
    api.favorites.isFavorite,
    user?.id
      ? { user_id: user.id as Id<"users">, product_id: product._id as Id<"products"> }
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
        user_id: user.id as Id<"users">,
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

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(
        ((product.original_price - product.price) / product.original_price) *
        100,
      )
      : 0;

  const isInStock =
    typeof product.stock_quantity === "number" && product.stock_quantity > 0;

  const targetHref =
    href ?? `/pd/${product._id}/${generateSlug(product.name || "product")}`;

  return (
    <Card
      className="group flex h-full w-full flex-col rounded-lg border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer relative"
      onClick={() => router.push(targetHref)}
    >
      {/* Image */}
      <div className="relative w-full aspect-4/3 bg-muted flex items-center justify-center overflow-hidden rounded-t-lg">
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
              className="object-contain px-3 py-4 transition-transform duration-300 group-hover:scale-105"
              unoptimized={img.includes("convex.cloud")}
            />
          </Link>
        ) : (
          <Package className="h-14 w-14 text-muted-foreground" />
        )}

        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] py-0.5 px-2 z-10">
            {discount}% OFF
          </Badge>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10 shadow-sm"
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
              }`}
          />
        </button>
      </div>

      {/* Content */}
      <CardContent className="flex flex-col gap-1.5 p-2.5">
        {/* Delivery & Rating */}
        <div className="flex items-center justify-between text-xs">
          <EtaBadge shopId={product.shop_id} eta={eta} />

          {product.rating && (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-semibold leading-snug text-foreground line-clamp-2 min-h-[32px] group-hover:text-primary transition-colors">
          <Link href={targetHref} onClick={(e) => e.stopPropagation()}>
            {product.name}
          </Link>
        </h3>

        <p className="text-[12px] text-muted-foreground">
          {product.min_order_quantity} {product.unit}
        </p>

        <div className="mt-1.5 flex items-center justify-between gap-2">
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
            className="h-8 px-4 rounded-md border-2 border-green-600 text-green-600 font-semibold text-xs hover:bg-green-50 dark:hover:bg-green-950/40 disabled:opacity-50"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={!isInStock}
            aria-label={`Add ${product.name} to cart`}
          >
            ADD
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
