"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, Trash2 } from "lucide-react";
import ShopkeeperGuard from "../_components/ShopkeeperGuard";
import type { Id } from "@/../convex/_generated/dataModel";

export default function ShopkeeperReviewsPage() {
  const { user } = useAuth();
  const [isDeletingId, setIsDeletingId] = useState<Id<"reviews"> | null>(null);

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as { _id: Id<"users"> } | null | undefined;

  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id, is_active: true } : "skip",
  ) as Array<{ _id: Id<"shops">; name: string }> | null | undefined;

  const shopId = shops && shops.length > 0 ? shops[0]._id : null;

  const reviews = useQuery(
    api.reviews.getReviewsByShop,
    shopId ? { shop_id: shopId } : "skip",
  ) as
    | Array<{
        _id: Id<"reviews">;
        rating: number;
        comment?: string;
        created_at: number;
        is_verified: boolean;
        user?: { name?: string | null; email?: string | null };
      }>
    | null
    | undefined;

  const deleteReview = useMutation(api.reviews.deleteReview);

  const handleDelete = async (id: Id<"reviews">) => {
    try {
      setIsDeletingId(id);
      await deleteReview({ id });
    } catch (err) {
      console.error("Failed to delete review", err);
    } finally {
      setIsDeletingId(null);
    }
  };

  if (!user || !dbUser || !shops) {
    return (
      <ShopkeeperGuard>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ShopkeeperGuard>
    );
  }

  return (
    <ShopkeeperGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Product Reviews</h1>
          <p className="text-muted-foreground mt-2">
            See what customers are saying about your products.
          </p>
        </div>

        {!reviews || reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No reviews yet for your shop&apos;s products.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card
                key={review._id}
                className="border border-border bg-card shadow-sm"
              >
                <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">
                        {review.user?.name || "Customer"}
                      </p>
                      {review.is_verified && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-2 py-0.5 uppercase tracking-wide"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                    {review.user?.email && (
                      <p className="text-xs text-muted-foreground">
                        {review.user.email}
                      </p>
                    )}
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {review.comment}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(review.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-2 md:mt-0">
                    <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(review._id)}
                      disabled={isDeletingId === review._id}
                      aria-label="Delete review"
                    >
                      {isDeletingId === review._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ShopkeeperGuard>
  );
}


