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
import { api } from "@convex/_generated/api";
import { ZeptoMobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import NotificationBell from "./NotificationBell";
import { useThemeContext } from "./ThemeProvider";
import Image from "next/image";
import { Bebas_Neue } from "next/font/google";

const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400" });

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
  const [showDesktopCategories, setShowDesktopCategories] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  
  // Use centralized theme context
  const { theme, toggleTheme } = useThemeContext();

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

  const handleToggleTheme = () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      toggleTheme();
      info(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`);
    } catch (error) {
      console.error('Theme toggle error:', error);
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
      { name: "All", href: "/category", icon: Grid2x2 },
      ...dbCategories.map((cat) => ({
        name: cat.name,
        href: `/category?category=${encodeURIComponent(cat.name)}`,
        icon: categoryIconMap[cat.name] || Grid2x2,
        id: cat._id,
      })),
    ]
  ), [dbCategories]);

  return (
    <>
      {/* Mobile Header - visible only on small screens */}
      <div className="lg:hidden">
        <ZeptoMobileHeader
          onMenuClick={() => setIsMenuOpen(true)}
          cartCount={getTotalItems()}
          location={location ? `${location.area || ""}, ${location.city || ""}` : null}
          onOpenLocation={() => setIsLocationModalOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
        />
      </div>

      {/* Desktop Navbar */}
      <nav
        role="navigation"
        aria-label="Primary"
        className={`sticky top-0 z-50 bg-background border-b border-border transition-all duration-300 hidden lg:block ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-8">
            {/* Left: Logo & Location */}
            <div className="flex items-center gap-6 shrink-0">
              <Link href="/" className="shrink-0">
                <div className="flex items-center group gap-0.5">
                   <h1 className={`text-3xl font-extrabold tracking-tight leading-none ${bebasNeue.className}`}>
                    <span className="text-primary">MohallaMart</span>
                  </h1>
                </div>
              </Link>
              
              <div className="h-8 w-px bg-border/60" />

              {mounted && (
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex flex-col items-start group min-w-[140px]"
                >
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                    10 Minutes
                  </span>
                  <div className="flex items-center gap-1 max-w-[180px]">
                    <span className="text-sm font-bold text-foreground truncate block leading-tight">
                       {location ? location.area : "Select Location"}
                    </span>
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-y-0.5" />
                  </div>
                </button>
              )}
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-3xl">
              <div 
                className="relative w-full group"
                onClick={() => setSearchOpen(true)}
              >
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors z-10">
                  <SearchIcon className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  readOnly
                  placeholder='Search for "banana"'
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border/50 hover:border-primary/50 hover:shadow-md focus:border-primary rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-all duration-300 cursor-pointer text-sm font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-6 shrink-0">
              {/* Login/Account */}
              {user ? (
                 <div ref={accountRef} className="relative">
                    <button
                      onClick={() => setIsAccountOpen((v) => !v)}
                      className="flex items-center gap-2 group"
                    >
                       {dbUser?.avatar_url || user.avatar_url ? (
                        <Image
                          src={dbUser?.avatar_url || user.avatar_url || ""}
                          alt={user.name || "User"}
                          width={32}
                          height={32}
                          className="rounded-full border border-border group-hover:border-primary transition-colors"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <User className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                      )}
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        Profile
                      </span>
                    </button>
                    {isAccountOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden text-sm font-medium animate-in fade-in zoom-in-95 duration-200">
                        <Link href="/profile" onClick={() => setIsAccountOpen(false)} className="flex items-center px-4 py-3 hover:bg-muted/50 transition-colors">My Profile</Link>
                        <Link href="/wishlist" onClick={() => setIsAccountOpen(false)} className="flex items-center px-4 py-3 hover:bg-muted/50 transition-colors">My Wishlist</Link>
                         <button onClick={() => { setIsAccountOpen(false); logout(); }} className="flex items-center w-full text-left px-4 py-3 text-destructive hover:bg-destructive/10 transition-colors">Logout</button>
                      </div>
                    )}
                 </div>
              ) : (
                <Link href="/auth" className="flex items-center gap-2 group">
                   <User className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                   <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Login</span>
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                <ShoppingCart className="h-5 w-5 stroke-[2.5]" />
                <span className="text-sm font-bold">
                  {mounted && getTotalItems() > 0 ? `${getTotalItems()} items` : "Cart"}
                </span>
              </button>
            </div>
          </div>

          {/* Categories Strip */ }
          {showDesktopCategories && (
            <div className="flex items-center gap-1 pb-1 overflow-x-auto no-scrollbar">
               {groceryCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <Link
                      key={index}
                      href={category.href}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all whitespace-nowrap"
                    >
                      <Icon className="h-4 w-4 opacity-70" />
                      <span>{category.name}</span>
                    </Link>
                  );
                })}
            </div>
          )}

          <div className="lg:hidden mt-2">
            <ZeptoMobileHeader
              onMenuClick={toggleMenu}
              cartCount={getTotalItems()}
              location={location ? `${location.area || ""}, ${location.city || ""}` : null}
              onOpenLocation={() => setIsLocationModalOpen(true)}
              onOpenSearch={() => setSearchOpen(true)}
              onOpenCart={() => setIsCartOpen(true)}
            />
          </div>

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

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileBottomNav
          activeTab="home"
          cartCount={getTotalItems()}
          onTabChange={(tab) => console.log('Tab changed to:', tab)}
          onOpenCart={() => setIsCartOpen(true)}
        />
      </div>

      {/* Cart sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
