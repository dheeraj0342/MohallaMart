"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Id } from "@/../convex/_generated/dataModel";

const LOW_STOCK_THRESHOLD = 10;

export default function LowStockAlert() {
  const { user } = useAuth();
  
  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as { _id: Id<"users"> } | null | undefined;

  const products = useQuery(
    api.products.getMyProducts,
    dbUser?._id ? { owner_id: dbUser._id } : "skip",
  ) as Array<{
    _id: Id<"products">;
    name: string;
    stock_quantity: number;
    unit: string;
  }> | null | undefined;

  const lowStockProducts = products?.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD,
  ) || [];

  const outOfStockProducts = products?.filter((p) => p.stock_quantity === 0) || [];

  if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
          <AlertCircle className="h-5 w-5" />
          Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {outOfStockProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                Out of Stock ({outOfStockProducts.length})
              </span>
            </div>
            <div className="space-y-2">
              {outOfStockProducts.slice(0, 3).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-2 bg-white dark:bg-neutral-900 rounded-md"
                >
                  <span className="text-sm text-foreground">{product.name}</span>
                  <Badge variant="destructive">0 {product.unit}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {lowStockProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                Low Stock ({lowStockProducts.length})
              </span>
            </div>
            <div className="space-y-2">
              {lowStockProducts.slice(0, 3).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-2 bg-white dark:bg-neutral-900 rounded-md"
                >
                  <span className="text-sm text-foreground">{product.name}</span>
                  <Badge variant="secondary">
                    {product.stock_quantity} {product.unit}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href="/shopkeeper/shop/products">
          <Button variant="outline" className="w-full">
            <Package className="h-4 w-4 mr-2" />
            Manage Inventory
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

