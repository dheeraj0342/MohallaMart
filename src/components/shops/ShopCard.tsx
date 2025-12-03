"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Star, Package, Navigation, Heart } from "lucide-react";
import { generateSlug } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useStore } from "@/store/useStore";
import { Id } from "@/../convex/_generated/dataModel";
import { useToast } from "@/hooks/useToast";

export interface Shop {
  _id: string;
  name: string;
  description?: string;
  logo_url?: string;
  address: {
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  total_orders: number;
  is_active: boolean;
}

interface ShopCardProps {
  shop: Shop;
  distance?: number | null;
}

export function ShopCard({ shop, distance }: ShopCardProps) {
  const { user } = useStore();
  const { success, error } = useToast();

  const toggleFavorite = useMutation(api.favorites.toggleFavoriteShop);
  const isFavorite = useQuery(
    api.favorites.isFavorite,
    user?.id
      ? { user_id: user.id as Id<"users">, shop_id: shop._id as Id<"shops"> }
      : "skip"
  );

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    
    if (!user?.id) {
      error("Please login to add shops to your wishlist");
      return;
    }

    try {
      const added = await toggleFavorite({
        user_id: user.id as Id<"users">,
        shop_id: shop._id as Id<"shops">,
      });
      
      if (added) {
        success(`${shop.name} added to favorites`);
      } else {
        success(`${shop.name} removed from favorites`);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      error("Failed to update wishlist");
    }
  };

  return (
    <Link
      href={`/shop/${generateSlug(shop.name)}`}
      className="group block h-full"
    >
      <Card className="h-full hover:shadow-lg transition-shadow border-border bg-card overflow-hidden relative">
        <div className="relative h-48 w-full bg-muted overflow-hidden">
          {shop.logo_url ? (
            <Image
              src={shop.logo_url}
              alt={shop.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              unoptimized={shop.logo_url.includes("convex.cloud")}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Store className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Rating Badge */}
          {shop.rating && shop.rating > 0 && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground z-10">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {shop.rating.toFixed(1)}
            </Badge>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10 shadow-sm"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
                }`}
            />
          </button>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {shop.name}
          </h3>
          {shop.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {shop.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">
              {shop.address.city}, {shop.address.state}
            </span>
          </div>

          {/* Distance */}
          {distance !== null && distance !== undefined && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Navigation className="h-3 w-3 text-primary" />
              <span>{distance.toFixed(1)} km away</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>{shop.total_orders || 0} orders</span>
            </div>
            {shop.is_active && (
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
