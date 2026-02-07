// Razorpay configuration and utilities
export interface RazorpayConfig {
  key_id: string;
  key_secret: string;
  mode: "test" | "live";
}

export interface PaymentData {
  amount: number;
  currency: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  description: string;
  callback_url: string;
  notes?: Record<string, string>;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  description: string;
  vpa?: string;
  email: string;
  contact: string;
  fee: number;
  tax: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  acquirer_data?: Record<string, unknown>;
  created_at: number;
}

class RazorpayService {
  private config: RazorpayConfig;

  constructor() {
    // Determine mode: explicit RAZORPAY_MODE → NODE_ENV=production → default to test
    let mode: "test" | "live" = "test";
    if (process.env.RAZORPAY_MODE === "live") {
      mode = "live";
    } else if (process.env.NODE_ENV === "production" && process.env.RAZORPAY_MODE !== "test") {
      mode = "live";
    }

    const key_id = process.env.RAZORPAY_KEY_ID || "";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

    this.config = {
      key_id,
      key_secret,
      mode,
    };

    // Validate configuration
    if (!key_id || !key_secret) {
      const errorMsg = `Razorpay credentials are missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.`;
      // eslint-disable-next-line no-console
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Log mode for debugging
    // eslint-disable-next-line no-console
    console.info(`[Razorpay] Initialized in ${mode.toUpperCase()} mode`);
  }

  // Create a payment order
  async createOrder(paymentData: PaymentData): Promise<unknown> {
    const orderData: Record<string, unknown> = {
      amount: Math.round(paymentData.amount * 100), // Convert to paise and ensure integer
      currency: paymentData.currency,
      receipt: paymentData.order_id,
      notes: paymentData.notes || {},
      payment_capture: 1, // auto-capture payment
    };

    try {
      if (!this.config.key_id || !this.config.key_secret) {
        throw new Error("Razorpay keys are not configured on the server.");
      }

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${this.config.key_id}:${this.config.key_secret}`).toString("base64")}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        let errorDetails = "";
        try {
          const errorBody = await response.json();
          errorDetails = errorBody?.error?.description || JSON.stringify(errorBody);
        } catch {
          errorDetails = response.statusText;
        }
        
        const errorMsg = `Razorpay API error: ${response.status} - ${errorDetails}`;
        // eslint-disable-next-line no-console
        console.error(`[Razorpay] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const orderResult = await response.json();
      if (!orderResult?.id) {
        throw new Error("Invalid response from Razorpay: No order ID returned");
      }

      // eslint-disable-next-line no-console
      console.info(`[Razorpay] Order created successfully: ${orderResult.id}`);
      return orderResult;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("[Razorpay] Error creating order:", error.message);
      throw error;
    }
  }

  // Verify payment signature
  verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require("crypto");

    if (!this.config.key_secret) {
      // If key secret missing we cannot verify — return false
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", this.config.key_secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    return expectedSignature === razorpaySignature;
  }

  // Get payment details
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      if (!paymentId) {
        throw new Error("Payment ID is required");
      }

      const response = await fetch(
        `https://api.razorpay.com/v1/payments/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.config.key_id}:${this.config.key_secret}`).toString("base64")}`,
          },
        },
      );

      if (!response.ok) {
        let errorDetails = "";
        try {
          const errorBody = await response.json();
          errorDetails = errorBody?.error?.description || JSON.stringify(errorBody);
        } catch {
          errorDetails = response.statusText;
        }
        
        const errorMsg = `Razorpay API error: ${response.status} - ${errorDetails}`;
        // eslint-disable-next-line no-console
        console.error(`[Razorpay] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const paymentResult = await response.json();
      if (!paymentResult?.id) {
        throw new Error("Invalid response from Razorpay: No payment ID in response");
      }

      // eslint-disable-next-line no-console
      console.info(`[Razorpay] Payment details fetched: ${paymentResult.id}, Status: ${paymentResult.status}`);
      return paymentResult;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("[Razorpay] Error fetching payment details:", error.message);
      throw error;
    }
  }

  // Refund payment
  async refundPayment(
    paymentId: string,
    amount?: number,
    notes?: Record<string, string>,
  ): Promise<unknown> {
    const refundData = {
      amount: amount ? amount * 100 : undefined, // Convert to paise
      notes: notes || {},
    };

    try {
      const response = await fetch(
        `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${this.config.key_id}:${this.config.key_secret}`).toString("base64")}`,
          },
          body: JSON.stringify(refundData),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Razorpay API error: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error refunding payment:", error);
      throw error;
    }
  }

  // Get client configuration for frontend
  getClientConfig() {
    return {
      key_id: this.config.key_id,
      mode: this.config.mode,
      currency: "INR",
      name: "MohallaMart",
      description: "Your Trusted Neighborhood Marketplace",
      image: "/logo.png",
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
      theme: {
        color: "#2E7D32", // Forest Green
      },
      notes: {
        address: "MohallaMart",
      },
    };
  }

  // Get payment mode for debugging/logging
  getMode(): "test" | "live" {
    return this.config.mode;
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService();

// Types are already exported as interfaces above
