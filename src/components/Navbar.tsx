"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Coffee,
  Grid2x2,
  Laptop,
  Leaf,
  LogOut,
  MapPin,
  Moon,
  Search as SearchIcon,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Sun,
  ToyBrick,
  User,
  X,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import LocationModal from "./LocationModal";
import CartSidebar from "./cart/CartSidebar";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import NotificationBell from "./NotificationBell";

const categoryIconMap: Record<string, LucideIcon> = {
  All: Grid2x2,
  Cafe: Coffee,
  Home: Grid2x2,
  Toys: ToyBrick,
  "Fresh Grocery": Leaf,
  Electronics: Laptop,
  Mobiles: Smartphone,
  Beauty: Sparkles,
  Fashion: Shirt,
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpenState] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [showDesktopCategories, setShowDesktopCategories] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const { location, getTotalItems, user, setSearchOpen } = useStore();
  const { logout } = useAuth();
  const { success, info } = useToast();
  const [prevLocation, setPrevLocation] = useState(location);

  useEffect(() => {
    setIsSearchOpenState(useStore.getState().isSearchOpen);
    const unsubscribe = useStore.subscribe(
      (state) => {
        setIsSearchOpenState(state.isSearchOpen);
      }
    );
    setMounted(true);
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        setIsDark(true);
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else if (saved === "light") {
        setIsDark(false);
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        setIsDark(prefersDark);
        if (prefersDark) {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        } else {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
        }
      }
    } catch {
      // ignore (SSR safety)
    }
    return unsubscribe;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAccountOpen(false);
        setIsMenuOpen(false);
        setIsLocationModalOpen(false);
        setSearchOpen(false);
        setIsCartOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setSearchOpen]);

  useEffect(() => {
    setShowDesktopCategories(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 8) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close account dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  useEffect(() => {
    if (mounted && location) {
      const locationChanged =
        !prevLocation ||
        prevLocation.area !== location.area ||
        prevLocation.city !== location.city;

      if (locationChanged && prevLocation) {
        success(`Delivery location updated to ${location.area}, ${location.city}`);
      }
      setPrevLocation(location);
    }
  }, [location, prevLocation, mounted, success]);

  const toggleTheme = () => {
    try {
      const next = !isDark;
      setIsDark(next);
      if (next) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        localStorage.setItem("theme", "dark");
        info("Dark mode enabled");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
        info("Light mode enabled");
      }
    } catch {
      // noop
    }
  };

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as { role?: string; is_active?: boolean; avatar_url?: string } | null | undefined;

  const categories = useQuery(
    api.categories.getAllCategories,
    { is_active: true },
  ) as { _id: string; name: string }[] | null | undefined;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  type Category = {
    name: string;
    href: string;
    icon: LucideIcon;
    id?: string;
  };

  const dbCategories = useMemo(
    () => (categories || []).filter((cat) => cat.name.toLowerCase() !== "all"),
    [categories]
  );

  const groceryCategories: Category[] = useMemo(() => (
    [
      { name: "All", href: "/shops", icon: Grid2x2 },
      ...dbCategories.map((cat) => ({
        name: cat.name,
        href: `/shops?category=${encodeURIComponent(cat.name)}`,
        icon: categoryIconMap[cat.name] || Grid2x2,
        id: cat._id,
      })),
    ]
  ), [dbCategories]);

  return (
    <>
      <nav
        role="navigation"
        aria-label="Primary"
        className={`sticky top-0 z-50 bg-background/95 backdrop-blur-xl backdrop-saturate-150 border-b border-border transition-all duration-300 ${
          isScrolled ? "shadow-lg" : "shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`hidden lg:flex justify-between items-center transition-all duration-200 ${
              isScrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="shrink-0">
                <Link href="/">
                  <div className="flex items-center cursor-pointer group">
                    <div className="text-2xl sm:text-3xl mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform">🛒</div>
                    <div className="min-w-0">
                      <h1 className="text-lg sm:text-xl font-bold group-hover:opacity-80 transition-opacity leading-tight poppins-bold">
                        <span className="text-primary">Mohalla</span>
                        <span className="text-secondary">Mart</span>
                      </h1>
                      <p className="text-[10px] sm:text-xs text-muted-foreground -mt-0.5 leading-none inter-regular">
                        Groceries in minutes
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Location Button - Desktop */}
              {mounted && (
                <div className="hidden lg:block">
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex items-center bg-card hover:bg-muted px-3 py-2.5 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-md group active:scale-95"
                  >
                    <MapPin className="h-4 w-4 mr-2 text-primary transition-transform group-hover:scale-110" />
                    <div className="text-left min-w-0">
                      <div className="text-xs text-muted-foreground leading-tight inter-regular">Deliver to</div>
                      <div className="text-sm font-medium text-foreground max-w-[140px] truncate leading-tight inter-semibold">
                        {location ? `${location.area || ""}, ${location.city || ""}` : "Select Location"}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {!isSearchOpen && (
              <div className="hidden lg:flex flex-1 max-w-2xl mx-6">
                <div className="relative w-full">
                  <SearchIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 pointer-events-none" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Search for groceries, fruits, vegetables..."
                    className="w-full pl-11 pr-16 py-3 bg-card border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 hover:border-primary/50 hover:shadow-lg cursor-pointer text-sm inter-regular"
                    onClick={() => setSearchOpen(true)}
                    aria-label="Search"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                    <kbd className="hidden xl:inline-block px-2 py-1 text-xs font-semibold text-foreground bg-card border border-border rounded shadow-sm inter-medium">
                      ⌘M
                    </kbd>
                  </div>
                </div>
              </div>
            )}

            {mounted && (
              <div className="hidden lg:flex items-center gap-3">
                {dbUser?.role !== "admin" && (
                  <Link href={user ? "/shopkeeper/apply" : "/shopkeeper/signup"}>
                    <button className="px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-300 text-primary border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg active:scale-95 whitespace-nowrap poppins-semibold">
                       Register Your Shop
                    </button>
                  </Link>
                )}
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-lg hover:bg-muted transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-md"
                  aria-label="Toggle color theme"
                  title="Toggle dark / light"
                >
                  {isDark ? (
                    <Sun className="h-5 w-5 text-secondary" />
                  ) : (
                    <Moon className="h-5 w-5 text-foreground" />
                  )}
                </button>
                {/* Notification Bell */}
                {user && <NotificationBell />}
                {/* User Account */}
                {user ? (
                  <div ref={accountRef} className="relative">
                    <button
                      onClick={() => setIsAccountOpen((v) => !v)}
                      className="flex items-center text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-all duration-300 hover:shadow-md active:scale-95 border border-transparent hover:border-border"
                      aria-haspopup="menu"
                      aria-expanded={isAccountOpen}
                      aria-controls="account-menu"
                    >
                      {dbUser?.avatar_url || user.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={dbUser?.avatar_url || user.avatar_url || ""}
                          alt={user.name || "User"}
                          className="h-8 w-8 rounded-full object-cover mr-2 border-2 border-border"
                        />
                      ) : (
                        <User className="h-5 w-5 mr-2" />
                      )}
                      <div className="text-left min-w-0">
                        <div className="text-xs text-muted-foreground leading-tight inter-regular">Account</div>
                        <div className="text-sm font-medium leading-tight truncate max-w-[100px] inter-semibold">{user.name}</div>
                      </div>
                    </button>
                    {isAccountOpen && (
                      <div id="account-menu" className="absolute right-0 mt-2 w-48 bg-card border-2 border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <Link
                          href="/profile"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-muted border-b border-border transition-colors inter-medium"
                        >
                          <User className="h-4 w-4 mr-2" />
                          My Profile
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-muted border-b border-border transition-colors inter-medium"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          My Wishlist
                        </Link>
                        <button
                          onClick={() => {
                            setIsAccountOpen(false);
                            logout();
                            success("Logged out successfully");
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-b-lg transition-colors inter-medium"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/auth">
                    <button className="flex items-center text-foreground px-4 py-2 rounded-lg border-2 border-border hover:bg-muted transition-all duration-300 hover:shadow-md active:scale-95">
                      <User className="h-5 w-5 mr-2" />
                      <div className="text-left min-w-0">
                        <div className="text-xs text-muted-foreground leading-tight inter-regular">Account</div>
                        <div className="text-sm font-medium leading-tight inter-semibold">Sign In</div>
                      </div>
                    </button>
                  </Link>
                )}

                {/* Cart Button (opens sidebar) */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all duration-300 flex items-center relative shadow-md hover:shadow-lg active:scale-95 border-2 border-transparent hover:border-primary/50 poppins-semibold"
                  aria-label="Open cart"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  <div className="text-left min-w-0">
                    <div className="text-xs opacity-90 leading-tight inter-regular">My Cart</div>
                    <div className="text-sm font-semibold leading-tight poppins-semibold">
                      {mounted && getTotalItems() > 0 ? `${getTotalItems()} items` : "Empty"}
                    </div>
                  </div>
                  {mounted && getTotalItems() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg ring-2 ring-card inter-bold"
                    >
                      {getTotalItems()}
                    </motion.span>
                  )}
                </button>
              </div>
            )}
          </div>

<MobileHeader
            onMenuClick={toggleMenu}
            cartCount={getTotalItems()}
            location={location ? `${location.area || ""}, ${location.city || ""}` : null}
            onOpenLocation={() => setIsLocationModalOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            onOpenCart={() => setIsCartOpen(true)}
          />

          <AnimatePresence initial={false}>
            {showDesktopCategories && (
              <motion.div
                key="desktop-categories"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="hidden lg:block border-t border-border/50 mt-0.5 overflow-hidden"
              >
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex gap-6">
                    {groceryCategories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <Link
                          key={index}
                          href={category.href}
                          className="group relative flex items-center gap-2 py-1 text-sm font-medium text-foreground transition-colors hover:text-primary inter-medium"
                        >
                          <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                          <span>{category.name}</span>
                          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                        </Link>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-secondary/20 poppins-semibold">
                      🎯 Same Day Delivery Available
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="md:hidden fixed inset-0 z-50 bg-black"
                  onClick={() => setIsMenuOpen(false)}
                  aria-hidden="true"
                />
                {/* Sidebar Panel */}
                <motion.div
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  id="mobile-menu"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Mobile navigation"
                  className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-sm bg-card border-r border-border shadow-2xl"
                >
                  <div className="px-4 py-4 space-y-3 bg-card" aria-label="Mobile navigation menu">
                    <div className="flex items-center justify-between mb-2 border-b border-border pb-2">
                      <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                        <span className="text-2xl">🛒</span>
                        <span className="text-base font-bold poppins-bold">
                          <span className="text-primary">Mohalla</span>
                          <span className="text-secondary">Mart</span>
                        </span>
                      </Link>
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Close menu"
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <X className="h-5 w-5 text-foreground" />
                      </button>
                    </div>
                    {/* Mobile Location */}
                    <button
                      onClick={() => {
                        setIsLocationModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left p-3 bg-background hover:bg-muted rounded-xl border-2 border-border hover:border-primary transition-all duration-300 group active:scale-95"
                    >
                      <MapPin className="h-5 w-5 mr-3 text-primary transition-transform group-hover:scale-110" />
                      <div>
                        <div className="text-xs text-muted-foreground inter-regular">Deliver to</div>
                        <div className="text-sm font-medium text-primary min-w-[80px] truncate inter-semibold">
                        {location ? `${location.area || ""}, ${location.city || ""}` : "Select Location"}
                      </div>
                      </div>
                    </button>

                    {/* Mobile Actions - minimal */}
                    <div className="border-t border-border pt-3 space-y-3">
                      {dbUser?.role !== "admin" && (
                        <Link
                          href={user ? "/shopkeeper/apply" : "/shopkeeper/signup"}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <button className="flex items-center w-full text-left p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 poppins-semibold">
                            <div className="h-5 w-5 mr-3">🏪</div>
                            <div className="text-sm font-medium">Register Your Shop</div>
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Modals */}
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
        />
      </nav>
<MobileBottomNav
        activeTab="home"
        cartCount={getTotalItems()}
        onTabChange={(tab) => console.log('Tab changed to:', tab)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Cart sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}