"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Clock, CheckCircle, AlertCircle, Truck, Zap } from "lucide-react";
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
  onEtaUpdate?: (eta: EtaInfo | null) => void;
  refreshInterval?: number;
}

interface CachedEta {
  data: EtaInfo;
  timestamp: number;
  location: { lat: number; lng: number };
}

const etaCache = new Map<string, CachedEta>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const RETRY_DELAY = 2000; // 2 seconds between retries
const MAX_RETRIES = 3; // Retry up to 3 times
const STALE_THRESHOLD = 2 * 60 * 1000; // 2 minutes - refresh after this
const MIN_ETA = 1;
const MAX_ETA = 180; // Max 3 hours

export function EtaBadge({ 
  shopId, 
  eta: providedEta, 
  fallback = "30 mins", 
  className = "",
  variant = "compact",
  showIcon = true,
  onEtaUpdate,
  refreshInterval = 2 * 60 * 1000, // 2 minutes default refresh
}: EtaBadgeProps) {
  const { location } = useStore();
  const [eta, setEta] = useState<EtaInfo | null>(providedEta || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialEtaRef = useRef<boolean>(!!providedEta);
  const isMountedRef = useRef(true);

  // Validate ETA values
  const validateEta = useCallback((minEta: number, maxEta: number): EtaInfo | null => {
    const min = Math.max(MIN_ETA, Math.floor(minEta));
    const max = Math.min(MAX_ETA, Math.ceil(maxEta));

    if (min <= 0 || max <= 0 || min > max) {
      return null;
    }

    return { minEta: min, maxEta: max };
  }, []);

  const getLocationKey = useCallback((lat: number, lng: number) => {
    return `${Math.round(lat * 10000)}_${Math.round(lng * 10000)}`;
  }, []);

  const getCacheKey = useCallback((shopIdVal: string, lat: number, lng: number) => {
    return `${shopIdVal}_${getLocationKey(lat, lng)}`;
  }, [getLocationKey]);

  const isDataStale = useCallback((timestamp: number) => {
    return Date.now() - timestamp > STALE_THRESHOLD;
  }, []);

  const updateEta = useCallback((newEta: EtaInfo | null, timestamp: number) => {
    if (!isMountedRef.current) return;
    
    setEta(newEta);
    setLastUpdated(timestamp);
    setError(newEta === null);
    setRetryCount(0);
    hasInitialEtaRef.current = true;
    
    if (onEtaUpdate) {
      onEtaUpdate(newEta);
    }
  }, [onEtaUpdate]);

  const fetchEta = useCallback(async (forceRefresh = false) => {
    // If provided ETA is passed in props, use it directly
    if (providedEta) {
      updateEta(providedEta, Date.now());
      return;
    }

    // Validate required shopId
    if (!shopId) {
      setEta(null);
      setError(false);
      return;
    }

    // Extract location coordinates
    const lat = (location as any)?.coordinates?.lat ?? (location as any)?.lat;
    const lng = (location as any)?.coordinates?.lng ?? (location as any)?.lon;

    if (typeof lat !== 'number' || typeof lng !== 'number' || !lat || !lng) {
      setEta(null);
      setError(false);
      return;
    }

    const cacheKey = getCacheKey(shopId, lat, lng);
    const cached = etaCache.get(cacheKey);
    const now = Date.now();

    // Use cache if valid and not stale (unless forcing refresh)
    if (!forceRefresh && cached && now - cached.timestamp < CACHE_DURATION && !isDataStale(cached.timestamp)) {
      updateEta(cached.data, cached.timestamp);
      return;
    }

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Show loading only on initial fetch
    if (!hasInitialEtaRef.current && retryCount === 0) {
      setIsLoading(true);
    }

    try {
      // Build query params with cache busting
      const searchParams = new URLSearchParams({
        userLat: lat.toFixed(6),
        userLon: lng.toFixed(6),
        radiusKm: "2",
        t: Date.now().toString(), // Cache busting
      });

      const response = await fetch(
        `/api/vendors/nearby?${searchParams}`,
        { 
          signal: abortController.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          method: 'GET',
        }
      );

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }

      if (!Array.isArray(data.vendors)) {
        throw new Error('No vendors in response');
      }

      // Find the specific shop
      const shop = data.vendors.find((v: any) => v.id === shopId || String(v.id) === String(shopId));
      
      if (!shop) {
        // Shop not found in delivery area
        updateEta(null, now);
        return;
      }

      if (!shop.eta || typeof shop.eta !== 'object') {
        // Shop found but no ETA data
        updateEta(null, now);
        return;
      }

      // Validate ETA data
      const minEta = Number(shop.eta.minEta);
      const maxEta = Number(shop.eta.maxEta);

      if (Number.isNaN(minEta) || Number.isNaN(maxEta)) {
        throw new Error('Invalid ETA numbers');
      }

      // Validate and normalize ETA
      const validatedEta = validateEta(minEta, maxEta);

      if (!validatedEta) {
        throw new Error('ETA validation failed');
      }

      // Cache the result
      etaCache.set(cacheKey, { 
        data: validatedEta, 
        timestamp: now,
        location: { lat, lng }
      });

      updateEta(validatedEta, now);

    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      // Retry on network or server errors
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            fetchEta(forceRefresh);
          }
        }, RETRY_DELAY);
        return;
      }

      // Max retries exceeded
      if (!isMountedRef.current) return;
      
      setError(true);
      setEta(null);
      setIsLoading(false);
    } finally {
      if (!abortController.signal.aborted && isMountedRef.current) {
        setIsLoading(false);
      }
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, [shopId, location, providedEta, getCacheKey, validateEta, updateEta, isDataStale, retryCount]);

  // Initial fetch on mount or when dependencies change
  useEffect(() => {
    isMountedRef.current = true;
    fetchEta();

    return () => {
      // Cleanup on unmount
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [shopId, location, providedEta]);

  // Periodic refresh
  useEffect(() => {
    // Don't set interval for provided ETA
    if (!shopId || providedEta) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    // Start refresh interval
    refreshIntervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        fetchEta(false); // Regular refresh, use cache if available
      }
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [shopId, providedEta, refreshInterval, fetchEta]);

  // Determine what ETA to display
  const displayEta = providedEta || eta;
  
  // Initialize display variables
  let displayText = fallback;
  let statusBg = "bg-green-50 dark:bg-green-500/10";
  let statusText = "text-green-700 dark:text-green-400";
  let statusBorder = "border-green-200 dark:border-green-500/30";
  let Icon = Truck;
  let iconColor = "text-green-600 dark:text-green-400";
  let showExpressTag = false;

  if (isLoading && !hasInitialEtaRef.current) {
    // Loading state
    displayText = "Loading...";
    statusBg = "bg-blue-50 dark:bg-blue-500/10";
    statusText = "text-blue-700 dark:text-blue-400";
    statusBorder = "border-blue-200 dark:border-blue-500/30";
    Icon = Clock;
    iconColor = "text-blue-600 dark:text-blue-400 animate-spin";
  } else if (displayEta) {
    // Calculate average ETA
    const avgEta = Math.round((displayEta.minEta + displayEta.maxEta) / 2);
    
    // Format display text based on variant
    if (variant === "detailed") {
      displayText = `${displayEta.minEta}-${displayEta.maxEta} mins`;
    } else if (variant === "minimal") {
      displayText = `${avgEta} min${avgEta === 1 ? '' : 's'}`;
    } else {
      // Compact (default)
      displayText = `${displayEta.minEta}-${displayEta.maxEta}m`;
    }
    
    // Color coding based on delivery time
    if (avgEta <= 15) {
      statusBg = "bg-green-50 dark:bg-green-500/10";
      statusText = "text-green-700 dark:text-green-400";
      statusBorder = "border-green-200 dark:border-green-500/30";
      Icon = Truck;
      iconColor = "text-green-600 dark:text-green-400";
      showExpressTag = true;
    } else if (avgEta <= 30) {
      statusBg = "bg-emerald-50 dark:bg-emerald-500/10";
      statusText = "text-emerald-700 dark:text-emerald-400";
      statusBorder = "border-emerald-200 dark:border-emerald-500/30";
      Icon = CheckCircle;
      iconColor = "text-emerald-600 dark:text-emerald-400";
      showExpressTag = true;
    } else if (avgEta <= 45) {
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
    // Error state
    displayText = "Unavailable";
    statusBg = "bg-gray-50 dark:bg-gray-500/10";
    statusText = "text-gray-700 dark:text-gray-400";
    statusBorder = "border-gray-200 dark:border-gray-500/30";
    Icon = AlertCircle;
    iconColor = "text-gray-600 dark:text-gray-400";
  }

  // Render based on variant
  if (variant === "minimal") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 ${statusText} font-semibold text-[10px] transition-all duration-200 ${className}`}
        title={lastUpdated ? `Updated ${Math.round((Date.now() - lastUpdated) / 1000)}s ago` : "ETA Badge"}
        role="status"
        aria-live="polite"
      >
        {showIcon && <Icon className={`h-3.5 w-3.5 ${iconColor}`} />}
        {displayText}
      </span>
    );
  }

  if (variant === "detailed") {
    return (
      <div
        className={`inline-flex items-center gap-2 ${statusBg} ${statusBorder} border px-3 py-2 rounded-lg transition-all duration-200 ${className}`}
        title={lastUpdated ? `Updated ${Math.round((Date.now() - lastUpdated) / 1000)}s ago` : "ETA Information"}
        role="status"
        aria-live="polite"
      >
        {showIcon && (
          <div className={`p-1 rounded-full ${statusBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <span className={`text-sm font-semibold ${statusText}`}>
            {displayText} delivery
          </span>
          {!isLoading && displayEta && (
            <span className="text-[11px] text-muted-foreground">
              {showExpressTag ? '⚡ Express' : 'Standard'}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${statusBg} ${statusBorder} border px-2.5 py-1.5 rounded-full font-semibold text-[10px] transition-all duration-200 hover:shadow-sm ${className}`}
      title={lastUpdated ? `Updated ${Math.round((Date.now() - lastUpdated) / 1000)}s ago` : "ETA Badge"}
      role="status"
      aria-live="polite"
    >
      {showIcon && showExpressTag && displayEta && displayEta.minEta <= 15 ? (
        <Zap className={`h-3.5 w-3.5 ${iconColor}`} />
      ) : showIcon ? (
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      ) : null}
      {displayText}
    </span>
  );
}
