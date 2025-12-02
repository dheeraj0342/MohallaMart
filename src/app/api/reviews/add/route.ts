import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/../../convex/_generated/api";
import type { Id } from "@/../../convex/_generated/dataModel";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await fetchQuery(api.users.getUser, {
      id: supabaseUser.id,
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { productId, orderId, rating, reviewText } = body;

    if (!productId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: productId, rating" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Verify that user has purchased (and received) this product at least once
    const userOrders = await fetchQuery(api.orders.getOrdersByUser, {
      user_id: dbUser._id as Id<"users">,
    });

    const deliveredOrders = userOrders.filter(
      (order: any) => order.status === "delivered",
    );

    const hasCompletedPurchase = deliveredOrders.some((order: any) =>
      order.items.some((item: any) => item.product_id === productId),
    );

    if (!hasCompletedPurchase) {
      return NextResponse.json(
        {
          error:
            "You can only review products from completed (delivered) orders",
        },
        { status: 403 },
      );
    }

    const reviewId = await fetchMutation(api.reviews.createReview, {
      user_id: dbUser._id as Id<"users">,
      product_id: productId as Id<"products">,
      order_id: orderId ? (orderId as Id<"orders">) : undefined,
      rating,
      comment: reviewText,
    });

    return NextResponse.json({ success: true, reviewId }, { status: 200 });
  } catch (error: any) {
    console.error("[Reviews Add] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add review" },
      { status: 500 },
    );
  }
}


