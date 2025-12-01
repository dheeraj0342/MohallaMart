"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Loader2, MapPin, CreditCard, Clock } from "lucide-react";
import LocationModal from "@/components/LocationModal";

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
  const productIds = cart.map((item) => item.id as any);
  const products = useQuery(
    api.products.getProducts,
    cart.length > 0 ? { ids: productIds } : "skip"
  );

  // Get shop ID from first product (assuming all items are from same shop)
  const shopId = products && products.length > 0 ? products[0].shop_id : null;

  // Get user ID from Convex
  const dbUser = useQuery(
    api.users.getUserByEmail,
    user?.email ? { email: user.email } : "skip"
  );

  // Get shop details for ETA preview
  const shop = shopId ? useQuery(api.shops.getShop, { id: shopId as any }) : null;

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
    if (!user) {
      error("Please login to place order");
      router.push("/auth?next=/checkout");
      return;
    }

    if (!dbUser) {
      error("User not found. Please try again.");
      return;
    }

    if (!shopId) {
      error("Invalid shop");
      return;
    }

    if (!street || !city || !pincode || !state) {
      error("Please fill in all address fields");
      return;
    }

    if (!location?.coordinates) {
      error("Please select a delivery location on the map");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: dbUser._id,
          shop_id: shopId,
          items: cart.map((item) => ({
            product_id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
          })),
          subtotal,
          delivery_fee: deliveryFee,
          tax,
          total_amount: payableAmount,
          delivery_address: {
            street,
            city,
            pincode,
            state,
            coordinates: {
              lat: location.coordinates.lat,
              lng: location.coordinates.lng,
            },
          },
          payment_method: paymentMethod,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      success("Order placed successfully!");
      clearCart();
      router.push(data.trackingUrl || `/track/${data.orderId}`);
    } catch (err: any) {
      error(err.message || "Failed to place order");
    } finally {
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
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    Cash on Delivery
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    Online Payment
                  </label>
                </div>
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
                  disabled={isSubmitting || !location?.coordinates}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Placing Order...
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

