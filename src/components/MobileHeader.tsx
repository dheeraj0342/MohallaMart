"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  Moon,
  Search,
  Sun,
  User,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { images } from "@/lib/images";

interface Category {
  name: string;
  href: string;
  icon: LucideIcon;
  id?: string;
}

interface MobileHeaderProps {
  location: any;
  isSearchOpen: boolean;
  onOpenSearch: () => void;
  onOpenLocation: () => void;
  toggleTheme: () => void;
  isDark: boolean | null;
  toggleMenu: () => void;
  isMenuOpen: boolean;
  groceryCategories: Category[];
  pathname: string | null;
  user?: any;
  dbUser?: { avatar_url?: string; role?: string } | null;
}

export function MobileHeader({
  location,
  isSearchOpen,
  onOpenSearch,
  onOpenLocation,
  toggleTheme,
  isDark,
  toggleMenu,
  isMenuOpen,
  groceryCategories,
  pathname,
  user,
  dbUser,
}: MobileHeaderProps) {
  const isHomePage = pathname === "/" || pathname === null;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [eta, setEta] = useState<{ minEta: number; maxEta: number } | null>(null);
  const [isLoadingEta, setIsLoadingEta] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialEtaRef = useRef<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || 0;
      setIsCollapsed((prev) => {
        if (!prev && y > 80) return true;
        if (prev && y < 20) return false;
        return prev;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch ETA from nearby vendors
  // Implementation details:
  // - Fetches ETA only when location coordinates are available
  // - Uses the closest vendor's ETA for accuracy
  // - Auto-refreshes every 2 minutes to keep ETA current
  // - Handles errors gracefully with fallback
  // - Non-blocking: doesn't block UI rendering
  useEffect(() => {
    // Cleanup function to cancel in-flight requests and clear intervals
    const cleanup = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Location can be stored in two formats:
    // 1. { coordinates: { lat, lng } } - nested format
    // 2. { lat, lon } - flat format (from LocationModal)
    const lat = (location as any)?.coordinates?.lat ?? (location as any)?.lat;
    const lng = (location as any)?.coordinates?.lng ?? (location as any)?.lon;

    // If no location coordinates, reset ETA and cleanup
    if (!lat || !lng) {
      setEta(null);
      setIsLoadingEta(false);
      hasInitialEtaRef.current = false;
      cleanup();
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

      // Don't set loading state if we already have ETA (non-blocking)
      // Only show loading on initial fetch
      if (!hasInitialEtaRef.current) {
        setIsLoadingEta(true);
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
          if (data.vendors && data.vendors.length > 0) {
            // Get the closest vendor's ETA (first one is closest, sorted by distance)
            const closestVendor = data.vendors[0];
            if (closestVendor.eta) {
              setEta(closestVendor.eta);
              hasInitialEtaRef.current = true;
            } else {
              // Fallback: no ETA available
              setEta(null);
            }
          } else {
            // Fallback: no vendors found
            setEta(null);
          }
        } else {
          // Fallback: API error
          setEta(null);
        }
      } catch (error) {
        // Handle errors gracefully - only log if not aborted
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error fetching ETA:", error);
        }
        // Fallback: keep existing ETA or set to null
        // Don't reset ETA on error to avoid flickering
      } finally {
        // Only reset loading state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setIsLoadingEta(false);
        }
        // Clear the abort controller reference if it's the current one
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    };

    // Reset initial ETA flag when location changes
    hasInitialEtaRef.current = false;

    // Initial fetch (non-blocking - doesn't wait for completion)
    fetchEta();

    // Set up auto-refresh every 2 minutes (120000ms)
    // Only set up interval when coordinates are available
    intervalRef.current = setInterval(() => {
      fetchEta();
    }, 120000);

    // Cleanup on unmount or when dependencies change
    return () => {
      cleanup();
    };
  }, [location]);

  // Calculate menu position and close on outside click
  useEffect(() => {
    const updateMenuPosition = () => {
      if (userButtonRef.current) {
        const rect = userButtonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
    };

    const handler = (e: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      updateMenuPosition();
      window.addEventListener("resize", updateMenuPosition);
      window.addEventListener("scroll", updateMenuPosition, true);
    }

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isUserMenuOpen]);

  return (
    <div
      className={`lg:hidden transition-all duration-300 ease-out relative px-0 -mx-4 sm:-mx-6 lg:-mx-8 ${isCollapsed ? "py-2" : "py-3"
        }`}
      style={{
        ...(isHomePage && {
          backgroundImage: `url(${images.bg.mobileHeaderBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }),
      }}
    >
      {/* Overlay for better text readability - only on home page */}
      {isHomePage && (
        <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm" />
      )}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div
          className={`transition-all duration-300 ease-out overflow-hidden ${isCollapsed ? "max-h-0 opacity-0" : "max-h-32 opacity-100 mb-3"
            }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1 min-w-0 sm:gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-1 sm:gap-1.5">
                  <span className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">
                    MohallaMart in
                  </span>
                  <span className="text-xl sm:text-xl md:text-3xl font-black text-primary leading-none">
                    {isLoadingEta ? (
                      <span className="text-base sm:text-lg md:text-2xl">...</span>
                    ) : eta ? (
                      `${eta.minEta}-${eta.maxEta} mins`
                    ) : (
                      "20 mins"
                    )}
                  </span>
                </div>
                <button
                  onClick={onOpenLocation}
                  className="mt-1.5 flex items-center gap-2 text-[11px] md:text-xs text-muted-foreground hover:text-foreground transition-colors max-w-full"
                >
                  <span className="font-bold uppercase tracking-wide max-w-[80px] xs:max-w-[120px] truncate text-foreground">
                    {location?.label ? location.label : "HOME"}
                  </span>
                  <span className="mx-1.5 hidden xs:inline-block text-muted-foreground">·</span>
                  <span className="truncate max-w-[90px] xs:max-w-[140px] sm:max-w-[180px] md:max-w-[220px] text-muted-foreground">
                    {location
                      ? `${location.area || location.city || "Your location"}${location.pincode ? `, ${location.pincode}` : ""
                      }`
                      : "Select your delivery address"}
                  </span>
                  <MapPin className="h-3 w-3 ml-1 shrink-0 text-primary" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Theme toggle button */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full bg-background border border-border text-foreground shadow-md hover:shadow-lg transition-all"
                aria-label="Toggle color theme"
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Moon className="h-4 w-4 text-blue-500 dark:text-yellow-300" />
                )}
              </button>

              {/* User menu button */}
              <div className="relative">
                <button
                  ref={userButtonRef}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-0 rounded-full bg-background border border-border text-foreground shadow-md hover:shadow-lg transition-all overflow-hidden"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  {user && dbUser?.avatar_url ? (
                    <img
                      src={dbUser.avatar_url}
                      alt={user.name || "User"}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="p-2.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar - always visible */}
        {!isSearchOpen && (
          <button
            type="button"
            onClick={onOpenSearch}
            className={`w-full flex items-center gap-2 px-4 rounded-xl bg-accent text-left border border-border shadow-md hover:shadow-lg transition-all ease-out ${isCollapsed ? "py-2.5 mb-3" : "py-3 mb-3"
              }`}
            aria-label="Search for products"
          >
            <Search className="h-5 w-5 text-foreground shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground/90">
              Search for atta, dal, coke and more
            </span>
          </button>
        )}

        {/* Category navigation - always visible */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {groceryCategories.map((category) => {
            const Icon = category.icon;
            const isActive =
              (category.href === "/shops" && pathname === "/") ||
              pathname?.startsWith(category.href);

            return (
              <Link
                key={category.id || category.name}
                href={category.href}
                className="flex flex-col items-center min-w-[68px] gap-1.5 shrink-0"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all
                  ${isActive
                      ? "bg-primary border-primary shadow-md scale-105"
                      : "bg-card text-foreground border-border hover:border-secondary/60"
                    }`}
                >
                  <Icon
                    className={`h-5 w-5
                    ${isActive ? "text-yellow-400" : "text-foreground"}
                  `}
                  />
                </div>
                <span
                  className={`text-[11px] font-semibold text-center leading-tight ${isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                >
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* User menu dropdown - rendered outside overflow container */}
        <AnimatePresence>
          {isUserMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9998]"
                onClick={() => setIsUserMenuOpen(false)}
                aria-hidden="true"
              />
              <motion.div
                ref={userMenuRef}
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed w-48 bg-card border-2 border-border rounded-xl shadow-xl z-[9999] overflow-hidden"
                style={{
                  top: `${menuPosition.top}px`,
                  right: `${menuPosition.right}px`,
                }}
              >
                <Link
                  href="/auth"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-muted border-b border-border transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  User Login
                </Link>
                <Link
                  href="/shopkeeper/signup"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <span className="h-4 w-4 mr-2 flex items-center justify-center">🏪</span>
                  Shopkeeper Login
                </Link>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}