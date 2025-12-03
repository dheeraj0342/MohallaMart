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
        className={`bg-[#f9f6f2]/95 text-[#212121] dark:text-[#f9f6f2] dark:bg-[#181c1f]/95 shadow-sm dark:shadow-md sticky top-0 z-50 border-b border-[#e0e0e0] dark:border-[#2d333b] backdrop-blur-md transition-all duration-200 ${isScrolled ? "backdrop-saturate-150 shadow-md" : ""
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`hidden lg:flex justify-between items-center transition-all duration-200 ${isScrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
              }`}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="shrink-0">
                <Link href="/">
                  <div className="flex items-center cursor-pointer group">
                    <div className="text-2xl sm:text-3xl mr-1.5 sm:mr-2">🛒</div>
                    <div className="min-w-0">
                      <h1 className="text-lg sm:text-xl font-bold text-primary-brand group-hover:text-primary-hover transition-colors leading-tight">
                        Mohalla<span className="text-secondary-brand">Mart</span>
                      </h1>
                      <p className="text-[10px] sm:text-xs text-[#85786a] dark:text-[#a2a6b2] -mt-0.5 leading-none">
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
                    className="flex items-center bg-white dark:bg-[#24292e] hover:bg-gray-50 dark:hover:bg-[#2d333b] px-3 py-2 rounded-xl border-2 border-[#e0e0e0] dark:border-[#2d333b] hover:border-primary-brand dark:hover:border-primary-brand transition-all duration-200 hover:shadow-sm group"
                  >
                    <MapPin className="h-4 w-4 mr-2 text-primary-brand dark:text-primary-brand transition-colors group-hover:scale-110" />
                    <div className="text-left min-w-0">
                      <div className="text-xs text-[#85786a] dark:text-[#a2a6b2] leading-tight">Deliver to</div>
                      <div className="text-sm font-medium text-[#212121] dark:text-[#f9f6f2] max-w-[140px] truncate leading-tight">
                        {location
                          ? (
                            <>
                              <span>{location.area}</span>
                              {location.pincode && (
                                <span className="ml-1 text-xs text-[#85786a] dark:text-[#a2a6b2] font-normal">
                                  ({location.pincode})
                                </span>
                              )}
                            </>
                          )
                          : "Select Location"}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {!isSearchOpen && (
              <div className="hidden lg:flex flex-1 max-w-2xl mx-6">
                <div className="relative w-full">
                  <SearchIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#85786a] dark:text-[#a2a6b2] h-5 w-5 pointer-events-none" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Search for groceries, fruits, vegetables..."
                    className="w-full pl-11 pr-16 py-3 bg-[#ffffff] dark:bg-[#24292e] border-2 border-[#e0e0e0] dark:border-[#2d333b] rounded-xl text-[#212121] dark:text-[#f9f6f2] placeholder:text-[#85786a] dark:placeholder:text-[#a2a6b2] focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand transition-all duration-200 hover:border-[#c8c8c8] dark:hover:border-[#3d444f] hover:shadow-sm cursor-pointer text-sm"
                    onClick={() => setSearchOpen(true)}
                    aria-label="Search"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                    <kbd className="hidden xl:inline-block px-2 py-1 text-xs font-semibold text-[#594a3a] dark:text-[#f9f6f2] bg-[#ffffff] dark:bg-[#181c1f] border border-[#e0e0e0] dark:border-[#2d333b] rounded shadow-sm">
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
                    <button className="px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all text-primary-brand border-primary-brand hover:bg-primary-brand hover:text-white hover:shadow-md active:scale-95 whitespace-nowrap">
                      🏪 Register Your Shop
                    </button>
                  </Link>
                )}
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-lg hover:bg-muted transition-all hover:scale-110 active:scale-95"
                  aria-label="Toggle color theme"
                  title="Toggle dark / light"
                >
                  {isDark ? (
                    <Sun className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-black" />
                  )}
                </button>
                {/* Notification Bell */}
                {user && <NotificationBell />}
                {/* User Account */}
                {user ? (
                  <div ref={accountRef} className="relative">
                    <button
                      onClick={() => setIsAccountOpen((v) => !v)}
                      className="flex items-center text-[#212121] dark:text-[#f9f6f2] px-3 py-2 rounded-lg hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] transition-all hover:shadow-sm active:scale-95 border border-transparent hover:border-[#e0e0e0] dark:hover:border-[#2d333b]"
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
                        <div className="text-xs text-[#85786a] dark:text-[#a2a6b2] leading-tight">Account</div>
                        <div className="text-sm font-medium leading-tight truncate max-w-[100px]">{user.name}</div>
                      </div>
                    </button>
                    {isAccountOpen && (
                      <div id="account-menu" className="absolute right-0 mt-2 w-48 bg-card border-2 border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <Link
                          href="/profile"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-muted border-b border-border"
                        >
                          <User className="h-4 w-4 mr-2" />
                          My Profile
                        </Link>
                        <button
                          onClick={() => {
                            setIsAccountOpen(false);
                            logout();
                            success("Logged out successfully");
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-[#3c1f18] rounded-b-lg transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/auth">
                    <button className="flex items-center text-[#212121] dark:text-[#f9f6f2] px-4 py-2 rounded-lg border-2 border-[#e0e0e0] dark:border-[#2d333b] hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] transition-all hover:shadow-sm active:scale-95">
                      <User className="h-5 w-5 mr-2" />
                      <div className="text-left min-w-0">
                        <div className="text-xs text-[#85786a] dark:text-[#a2a6b2] leading-tight">Account</div>
                        <div className="text-sm font-medium leading-tight">Sign In</div>
                      </div>
                    </button>
                  </Link>
                )}

                {/* Cart Button (opens sidebar) */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="bg-primary-brand text-white px-5 py-2.5 rounded-lg hover:bg-primary-hover transition-all flex items-center relative shadow-sm hover:shadow-md active:scale-95 border-2 border-transparent hover:border-[#1f8f4e]"
                  aria-label="Open cart"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  <div className="text-left min-w-0">
                    <div className="text-xs opacity-90 leading-tight">My Cart</div>
                    <div className="text-sm font-semibold leading-tight">
                      {mounted && getTotalItems() > 0 ? `${getTotalItems()} items` : "Empty"}
                    </div>
                  </div>
                  {mounted && getTotalItems() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-secondary-brand text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-[#181c1f]"
                    >
                      {getTotalItems()}
                    </motion.span>
                  )}
                </button>
              </div>
            )}
          </div>

          <MobileHeader
            location={location}
            isSearchOpen={isSearchOpen}
            onOpenSearch={() => setSearchOpen(true)}
            onOpenLocation={() => setIsLocationModalOpen(true)}
            toggleTheme={toggleTheme}
            isDark={isDark}
            toggleMenu={toggleMenu}
            isMenuOpen={isMenuOpen}
            groceryCategories={groceryCategories}
            pathname={pathname}
            user={user}
            dbUser={dbUser}
          />

          <AnimatePresence initial={false}>
            {showDesktopCategories && (
              <motion.div
                key="desktop-categories"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="hidden lg:block border-t border-[#e0e0e0] dark:border-[#2d333b] mt-0.5 overflow-hidden"
              >
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex gap-6">
                    {groceryCategories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <Link
                          key={index}
                          href={category.href}
                          className="group relative flex items-center gap-2 py-1 text-sm font-medium text-[#212121] transition-colors hover:text-primary-brand dark:text-[#f9f6f2] dark:hover:text-primary-brand"
                        >
                          <Icon className="size-4 text-[#85786a] transition-colors group-hover:text-primary-brand dark:text-[#a2a6b2]" />
                          <span>{category.name}</span>
                          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 w-0 bg-primary-brand transition-all duration-300 group-hover:w-full" />
                        </Link>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#ffe066]/90 dark:bg-[#3b2f22] text-[#3b2f22] dark:text-[#ffe066] px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-[#ffd700]/30">
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
                  className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-sm bg-[#fffdf5] dark:bg-[#24292e] border-r border-[#e0e0e0] dark:border-[#2d333b] shadow-xl"
                >
                  <div className="px-4 py-4 space-y-3 bg-[#fffdf5] dark:bg-[#24292e]" aria-label="Mobile navigation menu">
                    <div className="flex items-center justify-between mb-2 border-b border-[#e0e0e0] dark:border-[#2d333b] pb-2">
                      <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                        <span className="text-2xl">🛒</span>
                        <span className="text-base font-bold text-[#212121] dark:text-[#f9f6f2]">MohallaMart</span>
                      </Link>
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Close menu"
                        className="p-2 rounded-lg hover:bg-[#faffd2] dark:hover:bg-[#3b2f22]"
                      >
                        <X className="h-5 w-5 text-[#212121] dark:text-[#f9f6f2]" />
                      </button>
                    </div>
                    {/* Mobile Location */}
                    <button
                      onClick={() => {
                        setIsLocationModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left p-3 bg-white dark:bg-[#24292e] hover:bg-gray-50 dark:hover:bg-[#2d333b] rounded-xl border-2 border-[#e0e0e0] dark:border-[#2d333b] hover:border-primary-brand dark:hover:border-primary-brand transition-all duration-200 group"
                    >
                      <MapPin className="h-5 w-5 mr-3 text-primary-brand dark:text-primary-brand transition-colors" />
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">Deliver to</div>
                      <div className="text-sm font-medium text-primary-brand dark:text-primary-brand min-w-[80px] truncate">
                        {location ? (
                          <>
                            <span>{location.area}</span>
                            {location.pincode && (
                              <span className="ml-1 text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                                ({location.pincode})
                              </span>
                            )}
                          </>
                        ) : (
                          "Select Location"
                        )}
                      </div>

                    </button>



                    {/* Mobile Actions - minimal */}
                    <div className="border-t pt-3 space-y-3">
                      {dbUser?.role !== "admin" && (
                        <Link
                          href={user ? "/shopkeeper/apply" : "/shopkeeper/signup"}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <button className="flex items-center w-full text-left p-3 bg-[#27ae60] hover:bg-[#1f8f4e] text-white rounded-lg transition-colors">
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
        pathname={pathname}
        mounted={mounted}
        getTotalItems={getTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        isLoggedIn={Boolean(user)}
        location={location}
        onOpenLocation={() => setIsLocationModalOpen(true)}
        dbUser={dbUser || undefined}
        user={user}
      />

      {/* Cart sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
