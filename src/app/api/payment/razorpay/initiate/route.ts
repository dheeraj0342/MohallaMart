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
 * Returns: { razorpay_order_id, key_id, amount, currency }
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

    if (!amount || !order_id || !customer_email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      success: true,
      razorpay_order_id: (razorpayOrder as { id: string }).id,
      key_id: config.key_id,
      amount: amount * 100, // Amount in paise
      currency: "INR",
    });
  } catch (error: any) {
    console.error("Error initiating Razorpay payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

