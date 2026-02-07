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
 * Returns: { success: boolean, payment_status: string, payment_id: string }
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

    // Validate required fields
    if (!razorpay_order_id || typeof razorpay_order_id !== "string") {
      console.error("[Razorpay] Invalid razorpay_order_id:", razorpay_order_id);
      return NextResponse.json(
        { success: false, error: "Invalid razorpay_order_id. Must be a valid string." },
        { status: 400 }
      );
    }

    if (!razorpay_payment_id || typeof razorpay_payment_id !== "string") {
      console.error("[Razorpay] Invalid razorpay_payment_id:", razorpay_payment_id);
      return NextResponse.json(
        { success: false, error: "Invalid razorpay_payment_id. Must be a valid string." },
        { status: 400 }
      );
    }

    if (!razorpay_signature || typeof razorpay_signature !== "string") {
      console.error("[Razorpay] Invalid razorpay_signature:", razorpay_signature);
      return NextResponse.json(
        { success: false, error: "Invalid razorpay_signature. Must be a valid string." },
        { status: 400 }
      );
    }

    if (!order_id || typeof order_id !== "string") {
      console.error("[Razorpay] Invalid order_id:", order_id);
      return NextResponse.json(
        { success: false, error: "Invalid order_id. Must be a valid string." },
        { status: 400 }
      );
    }

    console.log(`[Razorpay] Verifying payment - Order: ${order_id}, Payment ID: ${razorpay_payment_id}`);

    // Step 1: Verify payment signature
    const isValid = razorpayService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error(`[Razorpay] Signature verification failed - Order: ${order_id}, Payment: ${razorpay_payment_id}`);
      return NextResponse.json(
        { success: false, error: "Payment signature verification failed" },
        { status: 400 }
      );
    }

    console.log(`[Razorpay] Signature verified successfully for order ${order_id}`);

    // Step 2: Get payment details from Razorpay
    let paymentDetails: any = null;
    try {
      paymentDetails = await razorpayService.getPayment(razorpay_payment_id);
      console.log(`[Razorpay] Payment details fetched - Status: ${paymentDetails.status}`, {
        id: paymentDetails.id,
        amount: paymentDetails.amount,
        status: paymentDetails.status,
      });
    } catch (err: any) {
      console.error(`[Razorpay] Failed to fetch payment details from API:`, err.message);
      // Still try to update the order with what we know
      paymentDetails = { status: "unknown" };
    }

    // Step 3: Determine final payment status
    const isCaptured = paymentDetails.status === "captured";
    const paymentStatus = isCaptured ? "paid" : "failed";

    console.log(`[Razorpay] Payment determination - Razorpay status: ${paymentDetails.status}, Final status: ${paymentStatus}`);

    // Step 4: Update order in Convex database
    try {
      console.log(`[Razorpay] Updating order payment status to: ${paymentStatus}`);
      
      // Update payment status
      await fetchMutation(api.orders.updatePaymentStatus, {
        id: order_id as any,
        payment_status: paymentStatus,
      });

      console.log(`[Razorpay] Payment status updated successfully`);

      // Update Razorpay payment details
      console.log(`[Razorpay] Updating Razorpay payment details`);
      await fetchMutation(api.orders.updateRazorpayPayment, {
        id: order_id as any,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      console.log(`[Razorpay] Razorpay payment details updated successfully`);
    } catch (dbErr: any) {
      console.error(`[Razorpay] Database update failed:`, dbErr);
      console.error("Error details:", {
        message: dbErr.message,
        code: dbErr.code,
        stack: dbErr.stack,
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to update order: ${dbErr.message || "Unknown database error"}`,
          error_details: dbErr.message,
        },
        { status: 500 }
      );
    }

    // Step 5: Return success response
    const response = {
      success: true,
      payment_status: paymentStatus,
      payment_id: razorpay_payment_id,
      order_id: order_id,
    };

    console.log(`[Razorpay] Payment verification completed successfully:`, response);
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error("[Razorpay] Unexpected error during verification:", error);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Payment verification failed",
        error_type: error.name,
      },
      { status: 500 }
    );
  }
}

