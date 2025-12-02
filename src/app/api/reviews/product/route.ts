import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/../../convex/_generated/api";
import type { Id } from "@/../../convex/_generated/dataModel";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId parameter" },
        { status: 400 },
      );
    }

    const reviews = await fetchQuery(api.reviews.getReviewsByProduct, {
      product_id: productId as Id<"products">,
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error: any) {
    console.error("[Reviews Product] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}


