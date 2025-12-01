"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface OrderTrackingMapProps {
  shopLocation: { lat: number; lon: number } | null;
  deliveryLocation: { lat: number; lon: number } | null;
  riderLocation: { lat: number; lon: number } | null;
}

// Initialize Leaflet icon only on client side
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// Custom icons
const shopIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const deliveryIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const riderIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to fit map bounds
function FitBounds({ locations }: { locations: Array<{ lat: number; lon: number }> }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lon] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, locations]);

  return null;
}

export default function OrderTrackingMap({
  shopLocation,
  deliveryLocation,
  riderLocation,
}: OrderTrackingMapProps) {
  if (typeof window === "undefined") {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const locations = [
    shopLocation,
    deliveryLocation,
    riderLocation,
  ].filter((loc): loc is { lat: number; lon: number } => loc !== null);

  const center: LatLngExpression =
    locations.length > 0
      ? [locations[0].lat, locations[0].lon]
      : [20.5937, 78.9629]; // Default to India center

  const zoom = locations.length > 1 ? 12 : 14;

  // Create polyline path: shop -> rider -> delivery (if rider exists)
  const polylinePositions: LatLngExpression[] = [];
  if (shopLocation && riderLocation) {
    polylinePositions.push([shopLocation.lat, shopLocation.lon]);
    polylinePositions.push([riderLocation.lat, riderLocation.lon]);
  }
  if (riderLocation && deliveryLocation) {
    if (polylinePositions.length === 0) {
      polylinePositions.push([riderLocation.lat, riderLocation.lon]);
    }
    polylinePositions.push([deliveryLocation.lat, deliveryLocation.lon]);
  } else if (shopLocation && deliveryLocation && !riderLocation) {
    polylinePositions.push([shopLocation.lat, shopLocation.lon]);
    polylinePositions.push([deliveryLocation.lat, deliveryLocation.lon]);
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.length > 1 && <FitBounds locations={locations} />}
      {polylinePositions.length > 1 && (
        <Polyline
          positions={polylinePositions}
          color="#3b82f6"
          weight={3}
          opacity={0.7}
          dashArray="10, 10"
        />
      )}
      {shopLocation && (
        <Marker position={[shopLocation.lat, shopLocation.lon] as LatLngExpression} icon={shopIcon}>
          <Popup>Shop Location</Popup>
        </Marker>
      )}
      {deliveryLocation && (
        <Marker
          position={[deliveryLocation.lat, deliveryLocation.lon] as LatLngExpression}
          icon={deliveryIcon}
        >
          <Popup>Delivery Address</Popup>
        </Marker>
      )}
      {riderLocation && (
        <Marker
          position={[riderLocation.lat, riderLocation.lon] as LatLngExpression}
          icon={riderIcon}
        >
          <Popup>Rider Location (Live)</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

