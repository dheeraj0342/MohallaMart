"use client";

import { useEffect, useState, useRef } from "react";
import { Clock } from "lucide-react";
import { useStore } from "@/store/useStore";

export interface EtaInfo {
  minEta: number;
  maxEta: number;
}

interface EtaBadgeProps {
  shopId?: string;
  eta?: EtaInfo; // Optional: if provided, uses this instead of fetching
  fallback?: string;
  className?: string;
}

/**
 * Reusable ETA badge component with built-in ETA fetching logic
 * Displays delivery time estimate in a consistent format across the app
 * 
 * Automatically fetches ETA when shopId is provided and location is available.
 * If eta prop is provided, uses that instead (for cases where ETA is already fetched).
 * 
 * @param shopId - Shop ID to fetch ETA for (optional if eta is provided)
 * @param eta - Optional pre-fetched ETA information (if provided, skips fetching)
 * @param fallback - Fallback text when ETA is not available (default: "30 mins")
 * @param className - Additional CSS classes
 */
export function EtaBadge({ shopId, eta: providedEta, fallback = "30 mins", className = "" }: EtaBadgeProps) {
  const { location } = useStore();
  const [eta, setEta] = useState<EtaInfo | null>(providedEta || null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasInitialEtaRef = useRef<boolean>(!!providedEta);

  // Fetch ETA when shopId is provided and location is available
  useEffect(() => {
    // If ETA is provided as prop, use it and don't fetch
    if (providedEta) {
      setEta(providedEta);
      return;
    }

    // If no shopId, reset ETA
    if (!shopId) {
      setEta(null);
      return;
    }

    // Location can be stored in two formats:
    // 1. { coordinates: { lat, lng } } - nested format
    // 2. { lat, lon } - flat format (from LocationModal)
    const lat = (location as any)?.coordinates?.lat ?? (location as any)?.lat;
    const lng = (location as any)?.coordinates?.lng ?? (location as any)?.lon;

    if (!lat || !lng) {
      setEta(null);
      return;
    }

    const fetchEta = async () => {
      // Cancel any previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Only show loading on initial fetch
      if (!hasInitialEtaRef.current) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(
          `/api/vendors/nearby?userLat=${lat}&userLon=${lng}&radiusKm=2`,
          { signal: abortController.signal }
        );

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        if (response.ok) {
          const data = await response.json();
          if (data.vendors && Array.isArray(data.vendors)) {
            // Find the shop with matching ID
            const shop = data.vendors.find((v: any) => v.id === shopId);
            if (shop?.eta) {
              setEta(shop.eta);
              hasInitialEtaRef.current = true;
            } else {
              setEta(null);
            }
          } else {
            setEta(null);
          }
        } else {
          setEta(null);
        }
      } catch (error) {
        // Handle errors gracefully - only log if not aborted
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("[EtaBadge] Error fetching ETA:", error);
        }
        // Don't reset ETA on error to avoid flickering
      } finally {
        // Only reset loading state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
        // Clear the abort controller reference if it's the current one
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    };

    fetchEta();

    // Refresh ETA every 2 minutes
    const interval = setInterval(fetchEta, 120000);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      clearInterval(interval);
    };
  }, [shopId, location, providedEta]);

  // Use provided ETA or fetched ETA
  const displayEta = providedEta || eta;
  const displayText = displayEta ? `${displayEta.minEta}-${displayEta.maxEta} mins` : (isLoading ? "..." : fallback);

  return (
    <span
      className={`flex items-center gap-1 bg-primary/10 dark:bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium ${className}`}
    >
      <Clock className="h-3 w-3" />
      {displayText}
    </span>
  );
}

