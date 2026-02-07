"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/useToast";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Loader2, MapPin, CreditCard, Clock, Wallet } from "lucide-react";
import LocationModal from "@/components/LocationModal";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Checkout Page
 * Handles order placement with address, payment method, and location selection
 */

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();
  const cart = useStore((state) => state.cart);
  const location = useStore((state) => state.location);
  const clearCart = useStore((state) => state.clearCart);

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eta, setEta] = useState<{ minEta: number; maxEta: number } | null>(null);
  const razorpayLoaded = useRef(false);

  const { subtotal, totalItems } = useMemo(() => {
    const sub = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal: sub, totalItems: count };
  }, [cart]);

  const FREE_THRESHOLD = 199;
  const DELIVERY_FEE = 40;
  const deliveryFee = subtotal >= FREE_THRESHOLD ? 0 : DELIVERY_FEE;
  const tax = subtotal * 0.05; // 5% tax
  const payableAmount = subtotal + deliveryFee + tax;

  // Get shop ID from products (fetch product details to get shop_id)
  // Use productId if available, otherwise fall back to id
  // Filter out any invalid/undefined IDs
  const productIds = useMemo(() => {
    return cart
      .map((item) => (item.productId || item.id) as string)
      .filter((id): id is string => Boolean(id && typeof id === "string"));
  }, [cart]);

  const products = useQuery(
    api.products.getProducts,
    cart.length > 0 && productIds.length > 0 ? { ids: productIds as any } : "skip"
  );

  // Get shop ID from first product (assuming all items are from same shop)
  const shopId = products && products.length > 0 ? products[0].shop_id : null;

  // Check if products are still loading
  const isLoadingProducts = cart.length > 0 && productIds.length > 0 && products === undefined;

  // Get user ID from Convex
  const dbUser = useQuery(
    api.users.getUserByEmail,
    user?.email ? { email: user.email } : "skip"
  );

  // Get shop details for ETA preview (must call hook unconditionally)
  const shop = useQuery(
    api.shops.getShop,
    shopId ? { id: shopId as any } : "skip"
  );

  // Load Razorpay script
  useEffect(() => {
    if (razorpayLoaded.current || typeof window === "undefined") return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      razorpayLoaded.current = true;
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Calculate ETA preview when location and shop are available
  useEffect(() => {
    if (!location?.coordinates || !shop?.address?.coordinates) {
      setEta(null);
      return;
    }

    // Simple ETA preview (full calculation happens in API)
    const distanceKm = Math.sqrt(
      Math.pow(location.coordinates.lat - shop.address.coordinates.lat, 2) +
      Math.pow(location.coordinates.lng - shop.address.coordinates.lng, 2)
    ) * 111; // Rough conversion to km

    // Simple estimate: 5 min prep + 3 min/km travel
    const estimatedMinutes = Math.round(5 + distanceKm * 3);
    setEta({
      minEta: Math.max(10, estimatedMinutes - 5),
      maxEta: estimatedMinutes + 5,
    });
  }, [location, shop]);

  const handlePlaceOrder = async () => {
    // Validation checks
    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    if (!user) {
      error("Please login to place order");
      router.push("/auth?next=/checkout");
      return;
    }

    if (!dbUser) {
      error("User not found. Please try again.");
      return;
    }

    if (isLoadingProducts) {
      error("Product data is still loading. Please wait a moment and try again.");
      return;
    }

    if (!products || products.length === 0) {
      error("Product information not available. Please refresh the page and try again.");
      return;
    }

    if (!shopId) {
      error("Unable to determine shop. Please refresh the page and try again.");
      return;
    }

    if (!street?.trim() || !city?.trim() || !pincode?.trim() || !state?.trim()) {
      error("Please fill in all address fields");
      return;
    }

    if (!location?.coordinates) {
      error("Please select a delivery location on the map");
      return;
    }

    if (cart.length === 0) {
      error("Your cart is empty. Please add items before checking out.");
      return;
    }

    setIsSubmitting(true);

    try {
      // First create the order
      // Use productId if available, otherwise fall back to id
      // Filter out any items with invalid IDs
      const orderItems = cart
        .filter((item) => {
          const productId = item.productId || item.id;
          return Boolean(productId && typeof productId === "string");
        })
        .map((item) => ({
          product_id: (item.productId || item.id) as any,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
        }));

      if (orderItems.length === 0) {
        throw new Error("No valid products in cart. Please refresh and try again.");
      }

      const orderResponse = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: dbUser._id,
          shop_id: shopId,
          items: orderItems,
          subtotal,
          delivery_fee: deliveryFee,
          tax,
          total_amount: payableAmount,
          delivery_address: {
            street: street.trim(),
            city: city.trim(),
            pincode: pincode.trim(),
            state: state.trim(),
            coordinates: {
              lat: location.coordinates.lat,
              lng: location.coordinates.lng,
            },
          },
          payment_method: paymentMethod,
          notes: notes?.trim() || undefined,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order. Please try again.");
      }

      if (!orderData.orderId) {
        throw new Error("Order ID not returned from server. Please contact support.");
      }

      // If cash payment, redirect to tracking
      if (paymentMethod === "cash") {
        success("Order placed successfully!");
        clearCart();
        router.push(orderData.trackingUrl || `/track/${orderData.orderId}`);
        return;
      }

      // If Razorpay payment, initiate payment
      if (paymentMethod === "razorpay") {
        if (!razorpayLoaded.current || !window.Razorpay) {
          throw new Error("Payment system is not loaded. Please refresh the page and try again.");
        }

        // Get user details safely
        const storeUser = useStore.getState().user;
        const userName = storeUser?.name || dbUser?.name || (user && "name" in user ? user.name : (user as any)?.user_metadata?.name) || "Customer";
        const userEmail = storeUser?.email || dbUser?.email || (user && "email" in user ? user.email : (user as any)?.email) || "";
        const userPhone = storeUser?.phone || dbUser?.phone || "";

        if (!userEmail) {
          throw new Error("User email is required for payment. Please update your profile.");
        }

        // Initiate Razorpay payment
        let paymentData: any = null;
        try {
          const paymentResponse = await fetch("/api/payment/razorpay/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: payableAmount,
              order_id: orderData.orderId,
              customer_id: dbUser._id,
              customer_name: userName,
              customer_email: userEmail,
              customer_phone: userPhone,
              description: `Order #${orderData.orderNumber || orderData.orderId}`,
              callback_url: `${window.location.origin}/checkout/payment-callback`,
            }),
          });

          paymentData = await paymentResponse.json();

          if (!paymentResponse.ok) {
            throw new Error(paymentData.error || "Failed to initiate payment. Please try again.");
          }

          if (!paymentData.razorpay_order_id || !paymentData.key_id) {
            throw new Error("Invalid payment response from server. Please contact support.");
          }
        } catch (paymentInitError: any) {
          console.error("Payment initiation error:", paymentInitError);
          throw new Error(paymentInitError.message || "Failed to initialize payment gateway. Please try again.");
        }

        // Open Razorpay checkout
        const options = {
          key: paymentData.key_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: "MohallaMart",
          description: `Order #${orderData.orderNumber || orderData.orderId}`,
          order_id: paymentData.razorpay_order_id,
          handler: async (response: any) => {
            try {
              console.log("[Checkout] Payment successful response from Razorpay:", {
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature?.substring(0, 10) + "...",
              });

              if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
                throw new Error("Invalid payment response from Razorpay. Missing payment credentials.");
              }

              // Verify payment
              console.log("[Checkout] Verifying payment with backend...");
              const verifyResponse = await fetch("/api/payment/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: orderData.orderId,
                }),
              });

              const verifyData = await verifyResponse.json();

              console.log("[Checkout] Payment verification response:", {
                status: verifyResponse.status,
                success: verifyData.success,
                payment_status: verifyData.payment_status,
                error: verifyData.error,
              });

              if (!verifyResponse.ok) {
                console.error("[Checkout] Verification API returned error status:", verifyResponse.status);
                throw new Error(
                  verifyData.error ||
                  `Payment verification failed (${verifyResponse.status}). Please contact support.`
                );
              }

              if (!verifyData.success) {
                console.error("[Checkout] Verification returned success=false:", verifyData);
                throw new Error(
                  verifyData.error ||
                  "Payment could not be verified. Please check your account or contact support."
                );
              }

              console.log("[Checkout] Payment verified successfully");
              success("Payment successful! Your order has been placed.");
              clearCart();
              router.push(orderData.trackingUrl || `/track/${orderData.orderId}`);
            } catch (verifyErr: any) {
              console.error("[Checkout] Payment verification error:", {
                message: verifyErr.message,
                stack: verifyErr.stack,
              });
              error(verifyErr.message || "Failed to verify payment. Please contact support.");
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: userName,
            email: userEmail,
            contact: userPhone,
          },
          theme: {
            color: "#27ae60", // Forest Green
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        razorpay.on("payment.failed", (response: any) => {
          console.error("[Checkout] Payment failed event from Razorpay:", {
            error_code: response?.error?.code,
            error_description: response?.error?.description,
            error_reason: response?.error?.reason,
            error_source: response?.error?.source,
            error_step: response?.error?.step,
            error_message: response?.error?.message,
          });
          error(
            `Payment failed: ${response?.error?.description || response?.error?.message || "Unknown error"}. Please try again.`
          );
          setIsSubmitting(false);
        });
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      error(err.message || "Failed to place order. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => router.push("/")}>Start Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="w-full"
                >
                  {location?.coordinates
                    ? `Location: ${location.coordinates.lat.toFixed(4)}, ${location.coordinates.lng.toFixed(4)}`
                    : "Select Location on Map"}
                </Button>
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label
                      htmlFor="cash"
                      className="flex items-center gap-2 cursor-pointer font-normal"
                    >
                      <Wallet className="h-4 w-4" />
                      Cash on Delivery
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label
                      htmlFor="razorpay"
                      className="flex items-center gap-2 cursor-pointer font-normal"
                    >
                      <CreditCard className="h-4 w-4" />
                      Razorpay (Online Payment)
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{payableAmount.toFixed(2)}</span>
                  </div>
                </div>
                {eta && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                    <Clock className="h-4 w-4" />
                    <span>
                      Estimated delivery: {eta.minEta}-{eta.maxEta} minutes
                    </span>
                  </div>
                )}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || !location?.coordinates || isLoadingProducts || !products || products.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : isLoadingProducts ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        initial={location?.coordinates ? { lat: location.coordinates.lat, lon: location.coordinates.lng } : null}
      />
    </div>
  );
}

