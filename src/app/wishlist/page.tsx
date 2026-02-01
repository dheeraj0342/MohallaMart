"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useStore } from "@/store/useStore";
import { ZeptoCard } from "@/components/products/ZeptoCard";
import { ShopCard } from "@/components/shops/ShopCard";
import { Loader2, Heart, ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Id } from "@/../convex/_generated/dataModel";
import { useToast } from "@/hooks/useToast";

export default function WishlistPage() {
  const { user, addToCart, location } = useStore();
  const { success } = useToast();
  const router = useRouter();
  const [shopEtas, setShopEtas] = useState<Record<string, { minEta: number; maxEta: number }>>({});

  const favorites = useQuery(
    api.favorites.getFavorites,
    user?.id ? { user_id: user.id } : "skip"
  );

  // Simple redirect if not logged in (client-side)
  useEffect(() => {
    // We wait a bit to ensure user state is settled or use a loading state
  }, [user]);

  // Fetch ETAs for shops
  useEffect(() => {
    const loc = location as unknown as { coordinates?: { lat: number; lng: number }; lat?: number; lon?: number } | null;
    const lat = loc?.coordinates?.lat ?? loc?.lat;
    const lng = loc?.coordinates?.lng ?? loc?.lon;

    if (!lat || !lng) return;

    const fetchEtas = async () => {
      try {
        const res = await fetch(`/api/vendors/nearby?userLat=${lat}&userLon=${lng}&radiusKm=10`);
        if (res.ok) {
          const data = await res.json();
          const etas: Record<string, { minEta: number; maxEta: number }> = {};
          if (data.vendors && Array.isArray(data.vendors)) {
            data.vendors.forEach((v: any) => {
              if (v.eta) {
                etas[v.id] = v.eta;
              }
            });
          }
          setShopEtas(etas);
        }
      } catch {
        // Silent error
      }
    };

    fetchEtas();
  }, [location]);

  if (!user) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-50 dark:bg-neutral-900">
            <div className="bg-muted/50 p-6 rounded-full">
                <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Please Login</h1>
            <p className="text-muted-foreground">You need to be logged in to view your wishlist.</p>
            <Button onClick={() => router.push("/login")}>Login</Button>
        </div>
     )
  }

  if (favorites === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { products, shops } = favorites;
  const hasFavorites = products.length > 0 || shops.length > 0;

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product._id,
      name: `${product.name} (${product.unit})`,
      price: product.price,
      ...(product.images && product.images.length > 0 && {
        image: product.images[0],
      }),
      quantity: product.min_order_quantity,
    });
    success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
        </div>

        {!hasFavorites ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-muted/50 p-6 rounded-full mb-4">
                    <Heart className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Save items you love to your wishlist to easily find them later.
                </p>
                <Link href="/">
                    <Button>Start Shopping</Button>
                </Link>
            </div>
        ) : (
            <div className="space-y-12">
                {/* Products Section */}
                {products.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-bold">Favorite Products</h2>
                            <span className="text-sm text-muted-foreground ml-2">({products.length})</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ZeptoCard
                                    key={product._id}
                                    product={{
                                        ...product,
                                        _id: product._id as string,
                                        shop_id: product.shop_id as string
                                    }}
                                    onAddToCart={handleAddToCart}
                                    eta={product.shop_id ? shopEtas[product.shop_id as string] : undefined}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Shops Section */}
                {shops.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <Store className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-bold">Favorite Shops</h2>
                            <span className="text-sm text-muted-foreground ml-2">({shops.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {shops.map((shop) => (
                                <ShopCard
                                    key={shop._id}
                                    shop={{
                                        ...shop,
                                        _id: shop._id as string
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
