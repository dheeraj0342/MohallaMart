"use client";

import { useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { LatLngExpression, Marker as LeafletMarker } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  position: { lat: number; lon: number } | null;
  defaultCenter: [number, number];
  onPositionChange: (lat: number, lon: number) => void;
}

// Initialize Leaflet icon only on client side
if (typeof window !== "undefined") {
  // Fix for default marker icon path issue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// Component to handle map click events
function MapEventHandler({ onPositionChange }: { onPositionChange: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      const { lat, lng } = e.latlng;
      onPositionChange(lat, lng);
    },
  });
  return null;
}

// Component to handle marker drag events
function DraggableMarker({
  position,
  onDragEnd,
}: {
  position: { lat: number; lon: number };
  onDragEnd: (lat: number, lon: number) => void;
}) {
  const markerRef = useRef<LeafletMarker>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (marker) {
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        onDragEnd(lat, lng);
      });
    }
    return () => {
      if (marker) {
        marker.off("dragend");
      }
    };
  }, [onDragEnd]);

  return (
    <Marker
      position={[position.lat, position.lon] as LatLngExpression}
      ref={markerRef}
      draggable
    />
  );
}

export default function MapView({ position, defaultCenter, onPositionChange }: MapViewProps) {
  // Only render on client side
  if (typeof window === "undefined") {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const center: LatLngExpression = position ? [position.lat, position.lon] : defaultCenter;
  const zoom = position ? 14 : 5;

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
      <MapEventHandler onPositionChange={onPositionChange} />
      {position && (
        <DraggableMarker
          position={position}
          onDragEnd={(lat, lon) => onPositionChange(lat, lon)}
        />
      )}
    </MapContainer>
  );
}
