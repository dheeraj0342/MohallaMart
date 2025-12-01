"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { Loader2, MapPin, Package, Navigation } from "lucide-react";
import dynamic from "next/dynamic";
import { haversineDistanceKm } from "@/lib/distance";
import { calculateEtaMinutes, DEFAULT_STORE_PROFILE } from "@/lib/eta";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const order = useQuery(api.orders.getOrder, orderId ? { id: orderId as any } : "skip");
  const shop = order?.shop_id
    ? useQuery(api.shops.getShop, { id: order.shop_id })
    : null;
  const rider = order?.rider_id
    ? useQuery(api.riders.getById, { id: order.rider_id })
    : null;

  const [eta, setEta] = useState<{ minEta: number; maxEta: number } | null>(null);

  useEffect(() => {
    if (!order || !rider || !order.delivery_address.coordinates) return;

    // Calculate ETA based on rider location
    const calculateEta = () => {
      const riderLocation = rider.current_location;
      const deliveryLocation = order.delivery_address.coordinates!;

      const distanceKm = haversineDistanceKm(
        riderLocation.lat,
        riderLocation.lon,
        deliveryLocation.lat,
        deliveryLocation.lng
      );

      const etaResult = calculateEtaMinutes({
        storeProfile: DEFAULT_STORE_PROFILE,
        distanceKm,
        currentPendingOrders: 0,
        isPeakHour: false,
      });

      setEta({
        minEta: etaResult.minEta,
        maxEta: etaResult.maxEta,
      });
    };

    calculateEta();
    const interval = setInterval(calculateEta, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [order, rider]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const shopLocation = shop?.address?.coordinates
    ? { lat: shop.address.coordinates.lat, lon: shop.address.coordinates.lng }
    : null;

  const deliveryLocation = order.delivery_address.coordinates
    ? { lat: order.delivery_address.coordinates.lat, lon: order.delivery_address.coordinates.lng }
    : null;

  const riderLocation = rider?.current_location
    ? { lat: rider.current_location.lat, lon: rider.current_location.lon }
    : null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order #{order.order_number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">Status: {order.status}</p>
              {eta && (
                <p className="text-sm text-muted-foreground">
                  Estimated arrival: {eta.minEta}-{eta.maxEta} minutes
                </p>
              )}
              {rider && (
                <p className="text-sm text-muted-foreground">
                  Rider: {rider.name} ({rider.phone})
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        {(shopLocation || deliveryLocation || riderLocation) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden border border-border">
                {/* TODO: Create custom map component with multiple markers and polyline */}
                <MapView
                  position={riderLocation || deliveryLocation || shopLocation}
                  defaultCenter={[20.5937, 78.9629]}
                  onPositionChange={() => { }}
                />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {shopLocation && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Shop:</span> {shopLocation.lat.toFixed(6)}, {shopLocation.lon.toFixed(6)}
                  </p>
                )}
                {deliveryLocation && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Delivery:</span> {deliveryLocation.lat.toFixed(6)}, {deliveryLocation.lon.toFixed(6)}
                  </p>
                )}
                {riderLocation && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Rider:</span> {riderLocation.lat.toFixed(6)}, {riderLocation.lon.toFixed(6)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

