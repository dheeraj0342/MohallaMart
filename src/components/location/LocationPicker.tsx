"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import { getHighAccuracyGPS, type HighAccuracyLocation } from "@/lib/location/gps";
import { snapToRoad } from "@/lib/location/osrm";
import { reverseGeocode, type ReverseGeocodeResult } from "@/lib/location/nominatim";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
});

export interface AccurateLocation {
  lat: number;
  lon: number;
  accuracy: number;
  snapped: boolean;
  source: "gps" | "gps+snap" | "gps+snap+manual";
  addressText: string;
  road?: string;
  suburb?: string;
  city?: string;
  postcode?: string;
}

interface LocationPickerProps {
  initialLocation?: AccurateLocation | null;
  onChange: (location: AccurateLocation | null) => void;
}

export function LocationPicker({ initialLocation, onChange }: LocationPickerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [position, setPosition] = useState<HighAccuracyLocation | null>(
    initialLocation
      ? { lat: initialLocation.lat, lon: initialLocation.lon, accuracy: initialLocation.accuracy }
      : null,
  );
  const [snapped, setSnapped] = useState<boolean>(initialLocation?.snapped ?? false);
  const [source, setSource] = useState<AccurateLocation["source"]>(
    initialLocation?.source ?? "gps",
  );
  const [address, setAddress] = useState<ReverseGeocodeResult | null>(
    initialLocation
      ? {
          addressText: initialLocation.addressText,
          road: initialLocation.road,
          suburb: initialLocation.suburb,
          city: initialLocation.city,
          postcode: initialLocation.postcode,
        }
      : null,
  );

  const updateAccurateLocation = useCallback(
    async (next: HighAccuracyLocation, sourceOverride?: AccurateLocation["source"]) => {
      try {
        setLoading(true);
        // Reverse geocode
        const addr = await reverseGeocode(next.lat, next.lon);
        setAddress(addr);

        const finalLocation: AccurateLocation = {
          lat: next.lat,
          lon: next.lon,
          accuracy: next.accuracy,
          snapped,
          source: sourceOverride ?? source,
          addressText: addr.addressText,
          road: addr.road,
          suburb: addr.suburb,
          city: addr.city,
          postcode: addr.postcode,
        };

        onChange(finalLocation);
      } catch (err) {
        console.error("[LocationPicker] reverseGeocode failed", err);
      } finally {
        setLoading(false);
      }
    },
    [onChange, snapped, source],
  );

  // Initial GPS + OSRM snap
  useEffect(() => {
    const init = async () => {
      if (initialLocation) {
        // Already have a location
        return;
      }
      try {
        setLoading(true);
        const gps = await getHighAccuracyGPS();
        setPosition(gps);

        const snappedResult = await snapToRoad(gps.lat, gps.lon);
        let next = gps;
        if (snappedResult.snapped) {
          next = { lat: snappedResult.lat, lon: snappedResult.lon, accuracy: gps.accuracy };
          setSnapped(true);
          setSource("gps+snap");
          setPosition(next);
        } else {
          setSnapped(false);
          setSource("gps");
        }

        await updateAccurateLocation(next);
      } catch (err) {
        console.error("[LocationPicker] GPS initialization failed", err);
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [initialLocation, updateAccurateLocation]);

  const handlePositionChange = async (lat: number, lon: number) => {
    const currentAccuracy = position?.accuracy ?? 0;
    const next: HighAccuracyLocation = { lat, lon, accuracy: currentAccuracy };
    setPosition(next);
    setSnapped(false);
    setSource("gps+snap+manual");
    await updateAccurateLocation(next, "gps+snap+manual");
  };

  const defaultCenter: [number, number] = [
    initialLocation?.lat ?? 28.6139, // Delhi fallback
    initialLocation?.lon ?? 77.209,
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Shop Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64 w-full rounded-lg overflow-hidden border border-border">
          {position ? (
            <MapView
              position={{ lat: position.lat, lon: position.lon }}
              defaultCenter={defaultCenter}
              onPositionChange={handlePositionChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">
                  Detecting your location with high accuracy...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1 text-sm">
          <p className="text-xs font-medium text-muted-foreground">Selected address</p>
          <p className="text-foreground text-sm">
            {address?.addressText || "Move the marker to fine-tune your shop location."}
          </p>
          {position && (
            <p className="text-xs text-muted-foreground">
              Lat: {position.lat.toFixed(6)}, Lon: {position.lon.toFixed(6)} · Accuracy:{" "}
              {position.accuracy ? `${Math.round(position.accuracy)}m` : "n/a"} · Source:{" "}
              {source}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                setLoading(true);
                const gps = await getHighAccuracyGPS();
                setPosition(gps);
                setSnapped(false);
                setSource("gps");
                await updateAccurateLocation(gps, "gps");
              } catch (err) {
                console.error("[LocationPicker] GPS refresh failed", err);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Updating...
              </>
            ) : (
              "Refresh GPS"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


