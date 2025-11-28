"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { api } from "@/../../convex/_generated/api";
import {
  Loader2,
  Store,
  MapPin,
  Phone,
  Mail,
  Star,
  Package,
  Clock,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/useToast";
import ImageModal from "@/components/ImageModal";

export default function ShopPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart } = useStore();
  const { success } = useToast();
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt: string;
    title?: string;
  } | null>(null);

  const shop = useQuery(api.shops.getShopBySlug, { slug });
  const products = useQuery(
    api.products.getProductsByShop,
    shop ? { shop_id: shop._id, is_available: true } : "skip"
  );

  const handleAddToCart = (product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    min_order_quantity: number;
    unit: string;
  }) => {
    addToCart({
      id: product._id,
      name: `${product.name} (${product.unit})`,
      price: product.price,
      ...(product.images && product.images.length > 0 && { image: product.images[0] }),
      quantity: product.min_order_quantity,
    });
    success(`${product.name} added to cart!`);
  };

  if (shop === undefined || products === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (shop === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Shop Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>The shop you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-neutral-800 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {shop.logo_url ? (
                  <div
                    className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/10 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() =>
                      setSelectedImage({
                        url: shop.logo_url!,
                        alt: shop.name,
                        title: `${shop.name} Logo`,
                      })
                    }
                  >
                    <Image
                      src={shop.logo_url}
                      alt={shop.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized={shop.logo_url.includes("convex.cloud")}
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold font-montserrat text-black dark:text-white">{shop.name}</h1>
                  {shop.description && (
                    <p className="text-muted-foreground mt-1">{shop.description}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {shop.rating && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  >
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {shop.rating.toFixed(1)} Rating
                  </Badge>
                )}
                {shop.total_orders !== undefined && shop.total_orders > 0 && (
                  <Badge variant="outline">
                    <Package className="h-3 w-3 mr-1" />
                    {shop.total_orders.toLocaleString()}+ Orders
                  </Badge>
                )}
                <Badge
                  variant={shop.is_active ? "default" : "secondary"}
                  className={
                    shop.is_active
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }
                >
                  {shop.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-3 min-w-[200px]">
              <Card className="border-border bg-card">
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="line-clamp-1">
                        {shop.address.street}, {shop.address.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{shop.contact.phone}</span>
                    </div>
                    {shop.contact.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-xs truncate">{shop.contact.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Products Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black dark:text-white">Products</h2>
            {products && products.length > 0 && (
              <Badge variant="outline" className="text-sm">
                {products.length} {products.length === 1 ? "Product" : "Products"}
              </Badge>
            )}
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card
                  key={product._id}
                  className="group hover:shadow-lg transition-shadow border-border bg-card overflow-hidden"
                >
                  {/* Product Image */}
                  <div
                    className="relative h-72 w-full bg-muted overflow-hidden cursor-pointer"
                    onClick={() => {
                      if (product.images && product.images.length > 0) {
                        setSelectedImage({
                          url: product.images[0],
                          alt: product.name,
                          title: product.name,
                        });
                      }
                    }}
                  >
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        unoptimized={product.images[0].includes("convex.cloud")}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-20 w-20 text-muted-foreground" />
                      </div>
                    )}
                    {product.original_price && product.original_price > product.price && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white dark:bg-red-600 dark:text-white z-10">
                        {Math.round(
                          ((product.original_price - product.price) /
                            product.original_price) *
                          100
                        )}
                        % OFF
                      </Badge>
                    )}
                    {product.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground z-10">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-foreground">
                          ₹{product.price.toFixed(2)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.original_price.toFixed(2)}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">/{product.unit}</span>
                      </div>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
                          <span className="text-xs text-muted-foreground">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>
                        Min: {product.min_order_quantity} {product.unit}
                      </span>
                      {product.stock_quantity > 0 ? (
                        <span className="text-green-600 dark:text-green-400">
                          In Stock ({product.stock_quantity})
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">Out of Stock</span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock_quantity === 0}
                      className="w-full"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Products Available
                </h3>
                <p className="text-sm text-muted-foreground">
                  This shop hasn&apos;t added any products yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Shop Details Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>{shop.address.street}</p>
                <p>
                  {shop.address.city}, {shop.address.state} {shop.address.pincode}
                </p>
                {shop.address.coordinates && (
                  <p className="text-xs text-muted-foreground/70">
                    Coordinates: {shop.address.coordinates.lat.toFixed(6)},{" "}
                    {shop.address.coordinates.lng.toFixed(6)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Business Hours */}
            {shop.business_hours && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {Object.entries(shop.business_hours).map(([day, hours]) => {
                      if (!hours) return null;
                      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                      return (
                        <div
                          key={day}
                          className="flex items-center justify-between py-1 border-b border-border last:border-0"
                        >
                          <span className="font-medium text-foreground">{dayName}</span>
                          <span className="text-muted-foreground">
                            {hours.open} - {hours.close}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{shop.contact.phone}</span>
                </div>
                {shop.contact.email && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm break-all">{shop.contact.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          alt={selectedImage.alt}
          title={selectedImage.title}
        />
      )}
    </div>
  );
}
