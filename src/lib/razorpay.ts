// Razorpay configuration and utilities
export interface RazorpayConfig {
  key_id: string;
  key_secret: string;
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
    this.config = {
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    };

    if (!this.config.key_id || !this.config.key_secret) {
      throw new Error('Razorpay configuration is missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }
  }

  // Create a payment order
  async createOrder(paymentData: PaymentData): Promise<unknown> {
    const orderData = {
      amount: paymentData.amount * 100, // Convert to paise
      currency: paymentData.currency,
      receipt: paymentData.order_id,
      notes: paymentData.notes || {},
    };

    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.config.key_id}:${this.config.key_secret}`).toString('base64')}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Razorpay API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Verify payment signature
  verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.config.key_secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }

  // Get payment details
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.key_id}:${this.config.key_secret}`).toString('base64')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Razorpay API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  }

  // Refund payment
  async refundPayment(paymentId: string, amount?: number, notes?: Record<string, string>): Promise<unknown> {
    const refundData = {
      amount: amount ? amount * 100 : undefined, // Convert to paise
      notes: notes || {},
    };

    try {
      const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.config.key_id}:${this.config.key_secret}`).toString('base64')}`,
        },
        body: JSON.stringify(refundData),
      });

      if (!response.ok) {
        throw new Error(`Razorpay API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  // Get client configuration for frontend
  getClientConfig() {
    return {
      key_id: this.config.key_id,
      currency: 'INR',
      name: 'MohallaMart',
      description: 'Your Trusted Neighborhood Marketplace',
      image: '/logo.png',
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#2E7D32', // Forest Green
      },
      notes: {
        address: 'MohallaMart',
      },
    };
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService();

// Types are already exported as interfaces above
