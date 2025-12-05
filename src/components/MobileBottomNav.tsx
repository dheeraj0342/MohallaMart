"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Grid2x2, Home as HomeIcon, ShoppingCart, MoreVertical, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileBottomNavProps {
  pathname: string | null;
  mounted: boolean;
  getTotalItems: () => number;
  onOpenCart: () => void;
  isLoggedIn: boolean;
  location?: any;
  onOpenLocation?: () => void;
  dbUser?: { role?: string } | null;
  user?: any;
}

export function MobileBottomNav({
  pathname,
  mounted,
  getTotalItems,
  onOpenCart,
  isLoggedIn,
  location,
  onOpenLocation,
  dbUser,
  user,
}: MobileBottomNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close more menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  return (
    <>
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md transition-all duration-300 ${isScrolled ? "backdrop-blur-xl bg-card/80" : ""
          }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-1 py-2">
            <Link
              href="/"
              aria-label="Home"
              className="flex flex-col items-center justify-center gap-1 py-1"
            >
              <HomeIcon
                className={`${pathname === "/"
                  ? "text-primary"
                  : "text-muted-foreground"
                  } h-5 w-5`}
              />
              <span
                className={`text-[11px] ${pathname === "/"
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
                  }`}
              >
                Home
              </span>
            </Link>
            <Link
              href="/category"
              aria-label="Categories"
              className="flex flex-col items-center justify-center gap-1 py-1"
            >
              <Grid2x2
                className={`${pathname?.startsWith("/category") || pathname?.startsWith("/shops")
                  ? "text-primary"
                  : "text-muted-foreground"
                  } h-5 w-5`}
              />
              <span
                className={`text-[11px] ${pathname?.startsWith("/category") || pathname?.startsWith("/shops")
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
                  }`}
              >
                Categories
              </span>
            </Link>
            <button
              type="button"
              onClick={onOpenCart}
              aria-label="Cart"
              className="flex flex-col items-center justify-center gap-1 py-1 relative"
            >
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              {mounted && getTotalItems() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 right-6 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md ring-2 ring-background"
                >
                  {getTotalItems()}
                </motion.span>
              )}
              <span className="text-[11px] text-muted-foreground">
                Cart
              </span>
            </button>
            <div ref={moreMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                aria-label="More options"
                className={`flex flex-col items-center justify-center gap-1 py-1 w-full ${isMoreMenuOpen ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                <MoreVertical className="h-5 w-5" />
                <span className="text-[11px]">More</span>
              </button>
              <AnimatePresence>
                {isMoreMenuOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 z-40 bg-black"
                      onClick={() => setIsMoreMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-full right-0 mb-2 w-64 bg-card border-2 border-border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-foreground">Menu</h3>
                          <button
                            onClick={() => setIsMoreMenuOpen(false)}
                            className="p-1 rounded-lg hover:bg-muted transition-colors"
                            aria-label="Close menu"
                          >
                            <X className="h-4 w-4 text-foreground" />
                          </button>
                        </div>
                      </div>
                      <div className="py-2">
                        {onOpenLocation && (
                          <button
                            onClick={() => {
                              onOpenLocation();
                              setIsMoreMenuOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            <MapPin className="h-4 w-4 mr-3 text-primary" />
                            <div className="text-left flex-1 min-w-0">
                              <div className="text-xs text-muted-foreground">Deliver to</div>
                              <div className="text-sm font-medium truncate">
                                {location
                                  ? `${location.area || location.city || "Your location"}${location.pincode ? `, ${location.pincode}` : ""}`
                                  : "Select Location"}
                              </div>
                            </div>
                          </button>
                        )}
                        {dbUser?.role !== "admin" && (
                          <Link
                            href={user ? "/shopkeeper/apply" : "/shopkeeper/signup"}
                            onClick={() => setIsMoreMenuOpen(false)}
                            className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            <span className="h-4 w-4 mr-3 flex items-center justify-center">🏪</span>
                            <span>Register Your Shop</span>
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


