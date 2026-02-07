import { NextRequest, NextResponse } from "next/server";
import { razorpayService } from "@/lib/razorpay";

/**
 * POST /api/payment/razorpay/initiate
 * Initiate Razorpay payment by creating a Razorpay order
 * 
 * Body: {
 *   amount: number,
 *   order_id: string,
 *   customer_id: string,
 *   customer_name: string,
 *   customer_email: string,
 *   customer_phone: string,
 *   description: string,
 *   callback_url: string
 * }
 * 
 * Returns: { success: true, razorpay_order_id, key_id, amount, currency, mode }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      order_id,
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      description,
      callback_url,
    } = body;

    // Validate required fields
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Must be a positive number." },
        { status: 400 }
      );
    }

    if (!order_id || typeof order_id !== "string") {
      return NextResponse.json(
        { error: "Invalid order_id. Must be a valid string." },
        { status: 400 }
      );
    }

    if (!customer_email || typeof customer_email !== "string" || !customer_email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid customer_email. Must be a valid email address." },
        { status: 400 }
      );
    }

    // Log payment initiation for debugging
    console.info(`[Razorpay] Initiating payment for order ${order_id}, amount: ₹${amount}, customer: ${customer_email}`);

    // Create Razorpay order
    const razorpayOrder = await razorpayService.createOrder({
      amount,
      currency: "INR",
      order_id,
      customer_id: customer_id || "",
      customer_name: customer_name || "",
      customer_email,
      customer_phone: customer_phone || "",
      description: description || "MohallaMart Order Payment",
      callback_url: callback_url || "",
      notes: {
        order_id,
        customer_id: customer_id || "",
      },
    });

    const config = razorpayService.getClientConfig();

    console.info(`[Razorpay] Order created successfully: ${(razorpayOrder as any)?.id}`);

    return NextResponse.json({
      success: true,
      razorpay_order_id: (razorpayOrder as { id: string }).id,
      key_id: config.key_id,
      amount: amount * 100, // Amount in paise
      currency: "INR",
      mode: config.mode,
    });
  } catch (error: any) {
    console.error("[Razorpay] Error initiating payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

