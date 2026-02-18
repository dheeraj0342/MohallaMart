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
import { Loader2, MapPin, CreditCard, Clock, Wallet, AlertCircle, Info } from "lucide-react";
import LocationModal from "@/components/LocationModal";
import { haversineDistanceKm } from "@/lib/distance";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type DeliveryZone = {
  name: string;
  min_distance: number;
  max_distance: number;
  delivery_fee: number;
  min_order_value?: number;
};

type DeliveryInfo = {
  fee: number;
  zoneName: string | null;
  reason: string;
  /** true when customer is outside the shop's delivery area */
  unserviceable: boolean;
  /** minimum order value required for this zone (if any) */
  minOrderValue?: number;
  distanceKm?: number;
};

function resolveDeliveryInfo(
  shop: {
    radius_km?: number;
    address?: { coordinates?: { lat: number; lng: number } };
    delivery_zones?: DeliveryZone[];
  } | null | undefined,
  customerLocation: { lat: number; lng: number } | null,
  subtotal: number,
): DeliveryInfo {
  const FLAT_FEE = 40;
  const FREE_THRESHOLD = 199;

  // No location data → fall back to flat fee, don't block
  if (!customerLocation || !shop?.address?.coordinates) {
    return {
      fee: subtotal >= FREE_THRESHOLD ? 0 : FLAT_FEE,
      zoneName: null,
      reason: subtotal >= FREE_THRESHOLD ? "Free delivery" : "Standard delivery fee",
      unserviceable: false,
    };
  }

  const distanceKm = haversineDistanceKm(
    shop.address.coordinates.lat,
    shop.address.coordinates.lng,
    customerLocation.lat,
    customerLocation.lng,
  );

  // Check outer delivery radius
  if (shop.radius_km && distanceKm > shop.radius_km) {
    return {
      fee: 0,
      zoneName: null,
      reason: `Your location is ${distanceKm.toFixed(1)} km away — outside the ${shop.radius_km} km delivery area`,
      unserviceable: true,
      distanceKm,
    };
  }

  // Match delivery zone
  if (shop.delivery_zones && shop.delivery_zones.length > 0) {
    const zone = shop.delivery_zones.find(
      (z) => distanceKm >= z.min_distance && distanceKm <= z.max_distance,
    );

    if (zone) {
      const hasMinOrder = zone.min_order_value && zone.min_order_value > 0;
      return {
        fee: zone.delivery_fee,
        zoneName: zone.name,
        reason: `${zone.name} (${zone.min_distance}–${zone.max_distance} km)`,
        unserviceable: false,
        minOrderValue: hasMinOrder ? zone.min_order_value : undefined,
        distanceKm,
      };
    }

    // Customer is within radius but no zone covers this distance → flat fee
  }

  // Default flat fee
  const isFree = subtotal >= FREE_THRESHOLD;
  return {
    fee: isFree ? 0 : FLAT_FEE,
    zoneName: null,
    reason: isFree ? "Free delivery" : "Standard delivery fee",
    unserviceable: false,
    distanceKm,
  };
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

  // Get user from Convex by Supabase id (reliable after auth sync)
  const dbUser = useQuery(
    api.users.getUser,
    user?.id ? { id: user.id } : "skip"
  );

  // Get shop details for ETA preview and delivery zone calculation
  const shop = useQuery(
    api.shops.getShop,
    shopId ? { id: shopId as any } : "skip"
  );

  // Resolve customer coordinates from location store
  const customerCoords = useMemo<{ lat: number; lng: number } | null>(() => {
    if (!location) return null;
    const lat = (location as any)?.coordinates?.lat ?? (location as any)?.lat;
    const lng = (location as any)?.coordinates?.lng ?? (location as any)?.lon ?? (location as any)?.lng;
    if (lat && lng) return { lat, lng };
    return null;
  }, [location]);

  // Delivery fee resolved from zone configuration
  const deliveryInfo = useMemo<DeliveryInfo>(
    () => resolveDeliveryInfo(shop, customerCoords, subtotal),
    [shop, customerCoords, subtotal],
  );

  const deliveryFee = deliveryInfo.fee;
  const tax = subtotal * 0.05; // 5% tax
  const payableAmount = subtotal + deliveryFee + tax;

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
    if (!customerCoords || !shop?.address?.coordinates) {
      setEta(null);
      return;
    }

    const distanceKm = haversineDistanceKm(
      shop.address.coordinates.lat,
      shop.address.coordinates.lng,
      customerCoords.lat,
      customerCoords.lng,
    );

    // Simple estimate: 5 min prep + 3 min/km travel
    const estimatedMinutes = Math.round(5 + distanceKm * 3);
    setEta({
      minEta: Math.max(10, estimatedMinutes - 5),
      maxEta: estimatedMinutes + 5,
    });
  }, [customerCoords, shop]);

  const handlePlaceOrder = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    if (!user) {
      error("Please login to place order");
      router.push("/auth?next=/checkout");
      return;
    }

    if (dbUser === undefined) {
      error("Loading your account. Please wait a moment and try again.");
      return;
    }
    if (dbUser === null) {
      error("Account not synced. Please refresh the page or log out and log in again.");
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
      error("Please fill in all address fields (street, city, pincode, state)");
      return;
    }

    if (cart.length === 0) {
      error("Your cart is empty. Please add items before checking out.");
      return;
    }

    // Serviceability check
    if (deliveryInfo.unserviceable) {
      error(deliveryInfo.reason);
      return;
    }

    // Min order value check for matched zone
    if (
      deliveryInfo.minOrderValue &&
      deliveryInfo.minOrderValue > 0 &&
      subtotal < deliveryInfo.minOrderValue
    ) {
      error(
        `Minimum order of ₹${deliveryInfo.minOrderValue} required for ${deliveryInfo.zoneName ?? "this zone"}. Add ₹${(deliveryInfo.minOrderValue - subtotal).toFixed(2)} more to proceed.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // First create the order
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

      const deliveryAddress: {
        street: string;
        city: string;
        pincode: string;
        state: string;
        coordinates?: { lat: number; lng: number };
      } = {
        street: street.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        state: state.trim(),
      };
      if (customerCoords) {
        deliveryAddress.coordinates = customerCoords;
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
          delivery_address: deliveryAddress,
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
              if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
                throw new Error("Invalid payment response from Razorpay. Missing payment credentials.");
              }

              // Verify payment
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

              if (!verifyResponse.ok) {
                throw new Error(
                  verifyData.error ||
                  `Payment verification failed (${verifyResponse.status}). Please contact support.`
                );
              }

              if (!verifyData.success) {
                throw new Error(
                  verifyData.error ||
                  "Payment could not be verified. Please check your account or contact support."
                );
              }

              success("Payment successful! Your order has been placed.");
              clearCart();
              router.push(orderData.trackingUrl || `/track/${orderData.orderId}`);
            } catch (verifyErr: any) {
              console.error("[Checkout] Payment verification error:", verifyErr);
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
                  {customerCoords
                    ? `Location: ${customerCoords.lat.toFixed(4)}, ${customerCoords.lng.toFixed(4)}`
                    : "Select Location on Map"}
                </Button>

                {/* Serviceability / zone info */}
                {customerCoords && shop !== undefined && (
                  <div
                    className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                      deliveryInfo.unserviceable
                        ? "bg-destructive/10 border border-destructive/20 text-destructive"
                        : "bg-muted/50 border border-border text-muted-foreground"
                    }`}
                  >
                    {deliveryInfo.unserviceable ? (
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    ) : (
                      <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <span>{deliveryInfo.reason}</span>
                      {deliveryInfo.distanceKm !== undefined && !deliveryInfo.unserviceable && (
                        <span className="ml-1 opacity-70">
                          ({deliveryInfo.distanceKm.toFixed(1)} km away)
                        </span>
                      )}
                      {deliveryInfo.minOrderValue && deliveryInfo.minOrderValue > 0 && subtotal < deliveryInfo.minOrderValue && (
                        <p className="mt-1 text-amber-600 dark:text-amber-400 font-medium">
                          Min order ₹{deliveryInfo.minOrderValue} required for this zone.
                          Add ₹{(deliveryInfo.minOrderValue - subtotal).toFixed(2)} more.
                        </p>
                      )}
                    </div>
                  </div>
                )}

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
                    <span className="flex items-center gap-1">
                      Delivery Fee
                      {deliveryInfo.zoneName && (
                        <span className="text-xs text-muted-foreground">({deliveryInfo.zoneName})</span>
                      )}
                    </span>
                    <span>
                      {deliveryInfo.unserviceable ? (
                        <span className="text-destructive text-sm">N/A</span>
                      ) : deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{payableAmount.toFixed(2)}</span>
                  </div>
                </div>
                {eta && !deliveryInfo.unserviceable && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                    <Clock className="h-4 w-4" />
                    <span>
                      Estimated delivery: {eta.minEta}–{eta.maxEta} minutes
                    </span>
                  </div>
                )}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={
                    isSubmitting ||
                    isLoadingProducts ||
                    dbUser === undefined ||
                    !products ||
                    products.length === 0 ||
                    deliveryInfo.unserviceable
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : isLoadingProducts || dbUser === undefined ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : deliveryInfo.unserviceable ? (
                    "Outside Delivery Area"
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
        initial={customerCoords ? { lat: customerCoords.lat, lon: customerCoords.lng } : null}
      />
    </div>
  );
}
