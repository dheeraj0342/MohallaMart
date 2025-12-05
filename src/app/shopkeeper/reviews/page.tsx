"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import ShopkeeperGuard from "../_components/ShopkeeperGuard";
import type { Id } from "@/../convex/_generated/dataModel";

export default function ShopkeeperReviewsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isDeletingId, setIsDeletingId] = useState<Id<"reviews"> | null>(null);
  const [replyingId, setReplyingId] = useState<Id<"reviews"> | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

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
        reply?: string;
        replied_at?: number;
        created_at: number;
        is_verified: boolean;
        user?: { name?: string | null; email?: string | null };
      }>
    | null
    | undefined;

  const deleteReview = useMutation(api.reviews.deleteReview);
  const replyToReview = useMutation(api.reviews.replyToReview);

  const handleDelete = async (id: Id<"reviews">) => {
    try {
      setIsDeletingId(id);
      await deleteReview({ id });
      success("Review deleted");
    } catch {
      error("Failed to delete review");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleReply = async (id: Id<"reviews">) => {
    if (!replyText.trim() || !dbUser) return;

    try {
      setIsSubmittingReply(true);
      await replyToReview({
        id,
        reply: replyText,
        shopkeeper_id: dbUser._id,
      });
      success("Reply sent successfully");
      setReplyingId(null);
      setReplyText("");
    } catch {
      error("Failed to send reply");
    } finally {
      setIsSubmittingReply(false);
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
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-1 flex-1">
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
                      
                      <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>

                      {review.comment && (
                        <p className="text-sm text-foreground mt-2">
                          {review.comment}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(review.created_at).toLocaleString()}
                      </p>

                      {/* Shopkeeper Reply Display */}
                      {review.reply && (
                        <div className="mt-4 pl-4 border-l-2 border-primary/20 bg-muted/30 p-3 rounded-r-lg">
                          <p className="text-xs font-semibold text-primary mb-1">Your Reply</p>
                          <p className="text-sm text-foreground">{review.reply}</p>
                          {review.replied_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(review.replied_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Reply Form */}
                      {!review.reply && replyingId === review._id && (
                        <div className="mt-4 space-y-2">
                          <textarea
                            className="w-full p-2 text-sm border rounded-md bg-background"
                            placeholder="Write your reply..."
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReply(review._id)}
                              disabled={isSubmittingReply}
                            >
                              {isSubmittingReply && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                              Send Reply
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setReplyingId(null);
                                setReplyText("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {!review.reply && replyingId !== review._id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyingId(review._id);
                            setReplyText("");
                          }}
                        >
                          Reply
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(review._id)}
                        disabled={isDeletingId === review._id}
                      >
                        {isDeletingId === review._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
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


