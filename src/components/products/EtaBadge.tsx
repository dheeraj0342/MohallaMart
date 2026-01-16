"use client";

import { useEffect, useState, useRef } from "react";
import { Clock, CheckCircle, AlertCircle, Truck } from "lucide-react";
import { useStore } from "@/store/useStore";

export interface EtaInfo {
  minEta: number;
  maxEta: number;
}

interface EtaBadgeProps {
  shopId?: string;
  eta?: EtaInfo;
  fallback?: string;
  className?: string;
  variant?: "compact" | "detailed" | "minimal";
  showIcon?: boolean;
}

// Simple in-memory cache for ETA data
const etaCache = new Map<string, { data: EtaInfo; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

export function EtaBadge({ 
  shopId, 
  eta: providedEta, 
  fallback = "30 mins", 
  className = "",
  variant = "compact",
  showIcon = true
}: EtaBadgeProps) {
  const { location } = useStore();
  const [eta, setEta] = useState<EtaInfo | null>(providedEta || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasInitialEtaRef = useRef<boolean>(!!providedEta);

  // Fetch ETA when shopId is provided and location is available
  useEffect(() => {
    if (providedEta) {
      setEta(providedEta);
      return;
    }

    if (!shopId) {
      setEta(null);
      return;
    }

    const lat = (location as any)?.coordinates?.lat ?? (location as any)?.lat;
    const lng = (location as any)?.coordinates?.lng ?? (location as any)?.lon;

    if (!lat || !lng) {
      setEta(null);
      return;
    }

    const fetchEta = async () => {
      const cacheKey = `${shopId}-${lat}-${lng}`;
      const cached = etaCache.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_DURATION) {
        setEta(cached.data);
        setError(false);
        hasInitialEtaRef.current = true;
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      if (!hasInitialEtaRef.current) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(
          `/api/vendors/nearby?userLat=${lat}&userLon=${lng}&radiusKm=2`,
          { signal: abortController.signal }
        );

        if (abortController.signal.aborted) {
          return;
        }

        if (response.ok) {
          const data = await response.json();
          if (data.vendors && Array.isArray(data.vendors)) {
            const shop = data.vendors.find((v: any) => v.id === shopId);
            if (shop?.eta) {
              etaCache.set(cacheKey, { data: shop.eta, timestamp: now });
              setEta(shop.eta);
              setError(false);
              hasInitialEtaRef.current = true;
            } else {
              setEta(null);
              setError(false);
            }
          } else {
            setEta(null);
            setError(false);
          }
        } else {
          setEta(null);
          setError(true);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setError(true);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    };

    fetchEta();
    const interval = setInterval(fetchEta, 120000);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      clearInterval(interval);
    };
  }, [shopId, location, providedEta]);

  const displayEta = providedEta || eta;
  
  // Enhanced display logic with better UX
  let displayText = fallback;
  let statusBg = "bg-green-50 dark:bg-green-500/10";
  let statusText = "text-green-700 dark:text-green-400";
  let statusBorder = "border-green-200 dark:border-green-500/30";
  let Icon = Truck;
  let iconColor = "text-green-600 dark:text-green-400";

  if (isLoading) {
    displayText = variant === "detailed" ? "Calculating delivery..." : "Loading...";
    statusBg = "bg-blue-50 dark:bg-blue-500/10";
    statusText = "text-blue-700 dark:text-blue-400";
    statusBorder = "border-blue-200 dark:border-blue-500/30";
    Icon = Clock;
    iconColor = "text-blue-600 dark:text-blue-400 animate-spin";
  } else if (displayEta) {
    const avgEta = Math.round((displayEta.minEta + displayEta.maxEta) / 2);
    
    if (variant === "detailed") {
      displayText = `${displayEta.minEta}-${displayEta.maxEta} mins delivery`;
    } else if (variant === "minimal") {
      displayText = `${avgEta} mins`;
    } else {
      displayText = `${displayEta.minEta}-${displayEta.maxEta} mins`;
    }
    
    // Color coding based on delivery time
    if (avgEta <= 20) {
      statusBg = "bg-green-50 dark:bg-green-500/10";
      statusText = "text-green-700 dark:text-green-400";
      statusBorder = "border-green-200 dark:border-green-500/30";
      Icon = Truck;
      iconColor = "text-green-600 dark:text-green-400";
    } else if (avgEta <= 40) {
      statusBg = "bg-amber-50 dark:bg-amber-500/10";
      statusText = "text-amber-700 dark:text-amber-400";
      statusBorder = "border-amber-200 dark:border-amber-500/30";
      Icon = Clock;
      iconColor = "text-amber-600 dark:text-amber-400";
    } else {
      statusBg = "bg-orange-50 dark:bg-orange-500/10";
      statusText = "text-orange-700 dark:text-orange-400";
      statusBorder = "border-orange-200 dark:border-orange-500/30";
      Icon = Clock;
      iconColor = "text-orange-600 dark:text-orange-400";
    }
  } else if (error) {
    displayText = variant === "detailed" ? "Delivery unavailable" : "Unavailable";
    statusBg = "bg-red-50 dark:bg-red-500/10";
    statusText = "text-red-700 dark:text-red-400";
    statusBorder = "border-red-200 dark:border-red-500/30";
    Icon = AlertCircle;
    iconColor = "text-red-600 dark:text-red-400";
  } else {
    displayText = fallback;
    statusBg = "bg-gray-50 dark:bg-gray-500/10";
    statusText = "text-gray-700 dark:text-gray-400";
    statusBorder = "border-gray-200 dark:border-gray-500/30";
    Icon = Clock;
    iconColor = "text-gray-600 dark:text-gray-400";
  }

  // Different render styles based on variant
  if (variant === "minimal") {
    return (
      <span
        className={`inline-flex items-center gap-1 ${statusText} font-medium text-xs transition-all duration-200 ${className}`}
      >
        {showIcon && <Icon className={`h-3 w-3 ${iconColor}`} />}
        {displayText}
      </span>
    );
  }

  if (variant === "detailed") {
    return (
      <div
        className={`inline-flex items-center gap-2 ${statusBg} ${statusBorder} border px-3 py-1.5 rounded-lg transition-all duration-200 ${className}`}
      >
        {showIcon && (
          <div className={`p-1 rounded-full ${statusBg}`}>
            <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
          </div>
        )}
        <div className="flex flex-col">
          <span className={`text-xs font-semibold ${statusText}`}>
            {displayText}
          </span>
          {!isLoading && displayEta && (
            <span className="text-[10px] text-muted-foreground">
              Fast delivery
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default compact variant
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${statusBg} ${statusBorder} border px-2 py-1 rounded-full font-medium text-xs transition-all duration-200 hover:shadow-sm ${className}`}
    >
      {showIcon && <Icon className={`h-3 w-3 ${iconColor}`} />}
      {displayText}
    </span>
  );
}
