"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/useToast";
import { getHighAccuracyGPS } from "@/lib/location/gps";
import { snapToRoad } from "@/lib/location/osrm";
import { reverseGeocode as reverseGeocodeLib } from "@/lib/location/nominatim";

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initial?: { lat: number; lon: number } | null;
}

// Dynamically import the map component with SSR disabled
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
      <Loader2 className="h-8 w-8 animate-spin text-primary-brand" />
    </div>
  ),
});

export default function MapPickerModal({ isOpen, onClose, initial = null }: MapPickerModalProps) {
  const { setLocation } = useStore();
  const { success, error: errorToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(
    initial ?? null
  );
  const [address, setAddress] = useState<{ city?: string; area?: string; pincode?: string } | null>(null);

  // Search box
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ place_id: number; lat: string; lon: string; display_name: string }>>([]);
  const searchDebounceRef = useRef<number | null>(null);
  const latestSearchId = useRef(0);

  // Map center fallback
  const defaultCenter = useMemo(() => [20.5937, 78.9629] as [number, number], []); // India center fallback

  // Reverse geocode wrapper using shared Nominatim util
  const reverseGeocode = useCallback(
    async (lat: number, lon: number) => {
      const r = await reverseGeocodeLib(lat, lon);
      
      // Prioritize hamlet/suburb for Area
      const area = r.suburb || r.hamlet || r.village || r.road || "Unknown Area";
      
      // Prioritize City/Town/Village for City
      // Note: r.city in nominatim.ts already falls back to town/village, but we can be more explicit if needed
      // If city is same as area (e.g. both are village), try to find a broader region like county/district
      let city = r.city || r.county || r.stateDistrict || "Unknown City";
      
      if (city === area) {
         if (r.county) city = r.county;
         else if (r.stateDistrict) city = r.stateDistrict;
      }

      const pincode = r.postcode ?? undefined;
      return { city, area, pincode, raw: r };
    },
    []
  );

  // Nominatim search for suggestions (free)
  const searchPlace = useCallback(
    async (q: string) => {
      if (!q || q.trim().length === 0) {
        setSuggestions([]);
        return;
      }

      const id = ++latestSearchId.current;
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "6");
      url.searchParams.set("accept-language", "en");

      try {
        const res = await fetch(url.toString(), {
          headers: {
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error("Search failed");
        const items = await res.json();
        // ensure we only set suggestions for latest query
        if (id === latestSearchId.current) setSuggestions(items);
      } catch {
        // silently ignore; don't spam UI
      }
    },
    []
  );

  // debounce search input
  useEffect(() => {
    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    if (!query) {
      setSuggestions([]);
      return;
    }
    searchDebounceRef.current = window.setTimeout(() => searchPlace(query), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // detect using browser geolocation
  const detectLocation = useCallback(() => {
    if (isDetecting) return;
    setIsDetecting(true);
    setErrorMessage(null);

    (async () => {
      try {
        const gps = await getHighAccuracyGPS();
        // Snap to road using OSRM
        const snapped = await snapToRoad(gps.lat, gps.lon);
        const finalLat = snapped.snapped ? snapped.lat : gps.lat;
        const finalLon = snapped.snapped ? snapped.lon : gps.lon;

        setPosition({ lat: finalLat, lon: finalLon });
        const resolved = await reverseGeocode(finalLat, finalLon);
        setAddress({ city: resolved.city, area: resolved.area, pincode: resolved.pincode });
        success(`Location updated to ${resolved.area}, ${resolved.city}`);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unable to detect your location. Try again.";
        setErrorMessage(msg);
        errorToast(msg);
      } finally {
        setIsDetecting(false);
      }
    })();
  }, [isDetecting, reverseGeocode, success, errorToast]);

  // when user selects a suggestion
  const onSelectSuggestion = async (item: { place_id: number; lat: string; lon: string; display_name: string }) => {
    try {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      setPosition({ lat, lon });
      const resolved = await reverseGeocode(lat, lon);
      setAddress({ city: resolved.city, area: resolved.area, pincode: resolved.pincode });
      setSuggestions([]);
      setQuery("");
    } catch {
      errorToast("Failed to select location.");
    }
  };

  // when user confirms selection to store in global
  const confirmLocation = () => {
    if (!position) {
      const msg = "Please pick a location on the map or use detect/search.";
      setErrorMessage(msg);
      errorToast(msg);
      return;
    }
    const payload = { city: address?.city ?? "Unknown City", area: address?.area ?? "Unknown Area", pincode: address?.pincode, lat: position.lat, lon: position.lon };
    setLocation(payload);
    success(`Location set to ${payload.area}, ${payload.city}`);
    onClose();
  };

  // Handle map position updates
  const handleMapPositionChange = useCallback(
    async (lat: number, lon: number) => {
      setPosition({ lat, lon });
      try {
        const r = await reverseGeocode(lat, lon);
        setAddress({ city: r.city, area: r.area, pincode: r.pincode });
      } catch {
        // ignore
      }
    },
    [reverseGeocode]
  );

  // If the modal opens and there's no position but `initial` is not provided, try auto-detect once automatically:
  useEffect(() => {
    if (isOpen && !position && !initial) {
      // do not block user; try geolocation once
      detectLocation();
    } else if (isOpen && initial && !position) {
      setPosition({ lat: initial.lat, lon: initial.lon });
      reverseGeocode(initial.lat, initial.lon)
        .then((r) => setAddress({ city: r.city, area: r.area, pincode: r.pincode }))
        .catch(() => { });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6" style={{ zIndex: 99999 }} role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 1 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl max-h-[95vh] rounded-xl border-2 border-neutral-200 bg-white shadow-xl overflow-hidden flex flex-col mx-auto"
            style={{ zIndex: 2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 flex-shrink-0 bg-gray-50">
              <h3 className="text-xl font-semibold text-neutral-900">Pick Location</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={detectLocation}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm bg-primary-brand text-white hover:bg-primary-brand/90 transition-colors"
                >
                  {isDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  <span className="hidden sm:inline">Detect</span>
                </button>

                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-neutral-500 hover:text-primary-brand hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
              {/* Left: Map */}
              <div className="flex-1 min-h-0 h-[300px] md:h-auto">
                <MapView
                  position={position}
                  defaultCenter={defaultCenter}
                  onPositionChange={handleMapPositionChange}
                />
              </div>

              {/* Right: Controls */}
              <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-gray-100 p-4 flex flex-col gap-3 overflow-y-auto max-h-[400px] md:max-h-none bg-white">
                {errorMessage && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                {/* Search */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Search Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Navigation className="h-4 w-4 text-neutral-500" />
                    </div>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Type city, area, or pincode"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand transition-all duration-200 hover:border-neutral-300 text-sm"
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <ul className="mt-2 max-h-44 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                      {suggestions.map((s) => (
                        <li
                          key={s.place_id}
                          onClick={() => onSelectSuggestion(s)}
                          className="px-4 py-3 cursor-pointer hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-b-0"
                        >
                          <div className="font-medium text-neutral-900">{s.display_name.split(",")[0]}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{s.display_name}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Selected Location</div>
                  <div className="rounded-xl border border-gray-200 p-3 text-sm bg-gray-50">
                    <div className="space-y-1.5">
                      <div><span className="font-medium text-neutral-700">Area:</span> <span className="text-neutral-900">{address?.area ?? "—"}</span></div>
                      <div><span className="font-medium text-neutral-700">City:</span> <span className="text-neutral-900">{address?.city ?? "—"}</span></div>
                      <div><span className="font-medium text-neutral-700">Pincode:</span> <span className="text-neutral-900">{address?.pincode ?? "—"}</span></div>
                      <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">Lat: {position?.lat?.toFixed(6) ?? "—"} • Lon: {position?.lon?.toFixed(6) ?? "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex gap-2 pt-2">
                  <button
                    onClick={confirmLocation}
                    className="flex-1 rounded-xl bg-primary-brand text-white px-4 py-2.5 font-semibold hover:bg-primary-brand/90 transition-colors text-sm"
                  >
                    Save Location
                  </button>
                  <button
                    onClick={() => { setPosition(null); setAddress(null); setQuery(""); setSuggestions([]); }}
                    className="rounded-xl border-2 border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-gray-50 hover:border-neutral-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                <div className="text-xs text-gray-400 mt-1 px-1">
                  💡 Tip: Click or drag the marker on the map to refine the location. Use Detect for automatic location.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
