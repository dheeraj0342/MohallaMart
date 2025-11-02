"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Loader2, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoAttempted, setAutoAttempted] = useState(false);

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
            console.log("Location detected:", resolvedLocation);
            onClose();
          })
          .catch(() => {
            setErrorMessage(
              "We detected your location but couldn't fetch the address. Please check your connection and try again."
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
  }, [isDetecting, onClose, reverseGeocode]);

  useEffect(() => {
    if (isOpen && !autoAttempted && !isDetecting) {
      detectLocation();
    }
  }, [autoAttempted, detectLocation, isDetecting, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
          style={{ zIndex: 9999 }}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 1 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-2xl border border-[#e0e0e0] bg-[#ffffff] shadow-2xl dark:border-[#2d333b] dark:bg-[#24292e]"
            style={{ zIndex: 2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e0e0e0] px-6 py-4 dark:border-[#2d333b]">
              <h2 className="text-2xl font-bold text-[#212121] dark:text-[#f9f6f2]">Select Location</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-[#85786a] transition-colors hover:bg-[#e6f4ec] hover:text-[#212121] dark:text-[#a2a6b2] dark:hover:bg-[#1f2f25] dark:hover:text-[#f9f6f2]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 p-6">
              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    key={errorMessage}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border border-[#ffb199] bg-[#fff1eb] px-4 py-3 text-sm text-[#b83d0f] dark:border-[#ffb199]/30 dark:bg-[#ffb199]/10 dark:text-[#ffb199]"
                  >
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auto-detect Location Button */}
              <button
                onClick={detectLocation}
                disabled={isDetecting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-brand px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-[#1f8f4e] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-primary-brand dark:hover:bg-[#1f8f4e]"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Detecting Location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-5 w-5" />
                    <span>Use Current Location</span>
                  </>
                )}
              </button>

              {/* Info Text */}
              <p className="text-center text-sm text-[#85786a] dark:text-[#a2a6b2]">
                We&apos;ll automatically detect your location to provide better service
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}