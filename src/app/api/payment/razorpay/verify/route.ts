import { NextRequest, NextResponse } from "next/server";
import { razorpayService } from "@/lib/razorpay";
import { fetchMutation } from "convex/nextjs";
import { api } from "@convex/_generated/api";

/**
 * POST /api/payment/razorpay/verify
 * Verify Razorpay payment signature and update order payment status
 * 
 * Body: {
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string,
 *   order_id: string (Convex order ID)
 * }
 * 
 * Returns: { success: boolean, payment_status: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValid = razorpayService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Get payment details from Razorpay
    const paymentDetails = await razorpayService.getPayment(razorpay_payment_id);

    // Update order with payment details and status
    await fetchMutation(api.orders.updatePaymentStatus, {
      id: order_id as any,
      payment_status: paymentDetails.status === "captured" ? "paid" : "failed",
    });

    // Update order with Razorpay payment details
    await fetchMutation(api.orders.updateRazorpayPayment, {
      id: order_id as any,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return NextResponse.json({
      success: true,
      payment_status: paymentDetails.status === "captured" ? "paid" : "failed",
      payment_id: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

