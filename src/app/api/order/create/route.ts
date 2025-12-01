import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/../../convex/_generated/api";

/**
 * POST /api/order/create
 * Create a new order (rider assignment is done manually by shopkeeper)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      shop_id,
      items,
      subtotal,
      delivery_fee,
      tax,
      total_amount,
      delivery_address,
      payment_method,
      notes,
    } = body;

    // Create order
    const orderId = await fetchMutation(api.orders.createOrder, {
      user_id: user_id as any,
      shop_id: shop_id as any,
      items,
      subtotal,
      delivery_fee,
      tax,
      total_amount,
      delivery_address,
      payment_method,
      notes,
    });

    // Note: Rider assignment is done manually by shopkeeper from their dashboard
    // Order is created with status "pending" and shopkeeper will accept and assign rider
  } catch (err: any) {
    console.error("[Order Create] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

