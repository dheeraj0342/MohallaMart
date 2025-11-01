"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Loader2, Navigation } from "lucide-react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoAttempted, setAutoAttempted] = useState(false);
  const setLocation = useStore((state) => state.setLocation);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
    }
    setAutoAttempted(false);
    setIsDetecting(false);
  }, [isOpen]);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", latitude.toString());
    url.searchParams.set("lon", longitude.toString());
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("zoom", "15");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "en");

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`Reverse geocoding failed: ${response.status}`);

    const data = (await response.json()) as { address?: Record<string, string> };
    const address = data.address ?? {};

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.state_district ||
      address.state ||
      address.county ||
      "Your City";

    const area =
      address.suburb ||
      address.neighbourhood ||
      address.residential ||
      address.quarter ||
      address.city_district ||
      address.district ||
      address.state_district ||
      address.county ||
      address.village ||
      city;

    return { city, area, pincode: address.postcode };
  }, []);

  const detectLocation = useCallback(() => {
    if (isDetecting) return;

    setAutoAttempted(true);
    setErrorMessage(null);
    setIsDetecting(true);

    if (!("geolocation" in navigator)) {
      setErrorMessage("Geolocation is not supported on this device. Enable location services and try again.");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        reverseGeocode(latitude, longitude)
          .then((resolvedLocation) => {
            setErrorMessage(null);
            setLocation({
              ...resolvedLocation,
              coordinates: { lat: latitude, lng: longitude },
            });
            onClose();
          })
          .catch(() => {
            setErrorMessage(
              "We detected your location but couldn’t fetch the address. Please check your connection and try again."
            );
          })
          .finally(() => setIsDetecting(false));
      },
      () => {
        setErrorMessage("Unable to detect your location. Allow location access and try again.");
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isDetecting, onClose, reverseGeocode, setLocation]);

  useEffect(() => {
    if (isOpen && !autoAttempted && !isDetecting) {
      detectLocation();
    }
  }, [autoAttempted, detectLocation, isDetecting, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-4 pt-20 sm:pt-28"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] dark:bg-black/70"
            style={{ zIndex: 0 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl border border-[#e0e0e0] bg-[#ffffff] text-[#212121] shadow-2xl dark:border-[#2d333b] dark:bg-[#24292e] dark:text-[#f9f6f2]"
            style={{ zIndex: 10 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#ffffff] dark:bg-[#24292e] border-b border-[#e0e0e0] dark:border-[#2d333b] px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Select Location</h2>
              <button
                onClick={onClose}
                className="text-[#a79f94] hover:text-[#594a3a] dark:text-[#a2a6b2] dark:hover:text-[#f9f6f2] transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    key={errorMessage}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-lg border border-[#ffb199] bg-[#fff1eb] text-[#b83d0f] px-4 py-3 text-sm leading-relaxed"
                  >
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auto-detect Location */}
              <button
                onClick={detectLocation}
                disabled={isDetecting}
                className="w-full bg-[#e6f4ec] border-2 border-[#a8d5bb] text-[#1f8f4e] px-4 py-3 rounded-lg font-semibold hover:bg-[#d0ecd9] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Navigation className="h-5 w-5" />
                    Use Current Location
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
