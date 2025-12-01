"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Star } from "lucide-react";
import { generateSlug } from "@/lib/utils";

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
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  href?: string;
}

export function ProductCard({ product, onAddToCart, href }: ProductCardProps) {
  const router = useRouter();
  const hasImage = product.images?.length > 0;
  const img = hasImage ? product.images[0] : "";

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
      className="group flex h-full max-w-[200px] flex-col rounded-lg border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={() => router.push(targetHref)}
    >
      {/* Image */}
      <div className="relative w-full aspect-4/3 bg-muted flex items-center justify-center overflow-hidden">
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
          <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[10px] py-0.5 px-2">
            {discount}% OFF
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex flex-col gap-1.5 p-2.5">
        {/* Delivery & Rating */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" />
              <path d="M6 3v3l2 1" stroke="currentColor" strokeLinecap="round" />
            </svg>
            13 mins
          </span>

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
