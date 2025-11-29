"use client";

import { useState, useEffect } from "react";
import {
  Coffee,
  Clock,
  Grid2x2,
  Home as HomeIcon,
  Laptop,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Percent,
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
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpenState] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState<boolean | null>(null);

  const { location, getTotalItems, user, setSearchOpen } = useStore();
  const { logout } = useAuth();
  const { success, info } = useToast();
  const [prevLocation, setPrevLocation] = useState(location);

  // Sync search state with store
  useEffect(() => {
    setIsSearchOpenState(useStore.getState().isSearchOpen);
    const unsubscribe = useStore.subscribe(
      (state) => {
        setIsSearchOpenState(state.isSearchOpen);
      }
    );
    // mark mounted after first paint so client and server HTML match
    setMounted(true);
    // initialize theme from localStorage or system preference
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      } else if (saved === "light") {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
      } else {
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        setIsDark(prefersDark);
        if (prefersDark) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }
    } catch {
      // ignore (SSR safety)
    }
    return unsubscribe;
  }, []);

  // Watch for location changes and show toast
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
        localStorage.setItem("theme", "dark");
        info("Dark mode enabled");
      } else {
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
  ) as { role?: string; is_active?: boolean } | null | undefined;

  // Fetch categories from database
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

  // Map category names to icons
  const categoryIconMap: Record<string, LucideIcon> = {
    All: Grid2x2,
    Cafe: Coffee,
    Home: HomeIcon,
    Toys: ToyBrick,
    "Fresh Grocery": Leaf,
    Electronics: Laptop,
    Mobiles: Smartphone,
    Beauty: Sparkles,
    Fashion: Shirt,
  };

  // Build categories list from database, with "All" first
  // Filter out "All" from database categories since we add it manually
  const dbCategories = (categories || []).filter((cat) => cat.name.toLowerCase() !== "all");

  const groceryCategories: Category[] = [
    { name: "All", href: "/shops", icon: Grid2x2 },
    ...dbCategories.map((cat) => ({
      name: cat.name,
      href: `/shops?category=${encodeURIComponent(cat.name)}`,
      icon: categoryIconMap[cat.name] || Grid2x2,
      id: cat._id,
    })),
  ];

  return (
    <>
      {/* Top Banner */}
      <div className="bg-linear-to-r from-primary-brand via-[#37c978] to-secondary-brand dark:from-[#1f2f25] dark:via-[#24292e] dark:to-[#3b2f22] text-white dark:text-[#f9f6f2] py-2.5 text-center text-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">10-min delivery</span>
            </div>
            <div className="hidden xs:flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Free delivery above ₹199</span>
            </div>
            <span className="hidden sm:inline text-xs sm:text-sm font-medium">
              🎉 Get 10% off on first order
            </span>
          </div>
        </div>
      </div>
      <nav className="bg-[#f9f6f2]/95 text-[#212121] dark:text-[#f9f6f2] dark:bg-[#181c1f]/95 shadow-sm dark:shadow-md sticky top-0 z-50 border-b border-[#e0e0e0] dark:border-[#2d333b] backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            {/* Logo & Location */}
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

            {/* Search Bar - Desktop (only show when search modal is closed) */}
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

            {/* Action Buttons - Desktop */}
            {mounted && (
              <div className="hidden lg:flex items-center gap-3">
                {(() => {
                  const userRole = dbUser?.role;
                  const isActive = dbUser?.is_active === true;

                  // Don't show shopkeeper options for admin users
                  if (userRole === "admin") {
                    return null;
                  }

                  // Active shopkeeper
                  if (userRole === "shop_owner" && isActive) {
                    return (
                      <Link href="/shopkeeper">
                        <button className="px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all text-primary-brand border-primary-brand hover:bg-primary-brand hover:text-white hover:shadow-md active:scale-95">
                          Shopkeeper Dashboard
                        </button>
                      </Link>
                    );
                  }

                  // Pending shopkeeper
                  if (userRole === "shop_owner" && !isActive) {
                    return (
                      <span className="px-4 py-2 rounded-lg border-2 text-sm font-semibold text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-400 cursor-not-allowed">
                        ⏳ Application Pending
                      </span>
                    );
                  }

                  // Regular customer or not logged in
                  return (
                    <Link href={user ? "/shopkeeper/apply" : "/shopkeeper/signup"}>
                      <button className="px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all text-primary-brand border-primary-brand hover:bg-primary-brand hover:text-white hover:shadow-md active:scale-95 whitespace-nowrap">
                        🏪 Register Your Shop
                      </button>
                    </Link>
                  );
                })()}
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
                {/* User Account */}
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsAccountOpen((v) => !v)}
                      className="flex items-center text-[#212121] dark:text-[#f9f6f2] px-3 py-2 rounded-lg hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] transition-all hover:shadow-sm active:scale-95 border border-transparent hover:border-[#e0e0e0] dark:hover:border-[#2d333b]"
                      aria-haspopup="menu"
                      aria-expanded={isAccountOpen}
                    >
                      <User className="h-5 w-5 mr-2" />
                      <div className="text-left min-w-0">
                        <div className="text-xs text-[#85786a] dark:text-[#a2a6b2] leading-tight">Account</div>
                        <div className="text-sm font-medium leading-tight truncate max-w-[100px]">{user.name}</div>
                      </div>
                    </button>
                    {isAccountOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#ffffff] dark:bg-[#24292e] border-2 border-[#e0e0e0] dark:border-[#2d333b] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Role-based profile links */}
                        {dbUser?.role === "admin" ? (
                          <>
                            <Link
                              href="/admin"
                              onClick={() => setIsAccountOpen(false)}
                              className="flex items-center w-full px-4 py-3 text-sm text-[#212121] dark:text-[#f9f6f2] hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] rounded-t-lg border-b border-[#e0e0e0] dark:border-[#2d333b]"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Admin Dashboard
                            </Link>
                            <Link
                              href="/profile"
                              onClick={() => setIsAccountOpen(false)}
                              className="flex items-center w-full px-4 py-3 text-sm text-[#212121] dark:text-[#f9f6f2] hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] border-b border-[#e0e0e0] dark:border-[#2d333b]"
                            >
                              <User className="h-4 w-4 mr-2" />
                              My Profile
                            </Link>
                          </>
                        ) : dbUser?.role === "shop_owner" && dbUser?.is_active === true ? (
                          <>
                            <Link
                              href="/shopkeeper"
                              onClick={() => setIsAccountOpen(false)}
                              className="flex items-center w-full px-4 py-3 text-sm text-[#212121] dark:text-[#f9f6f2] hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] rounded-t-lg border-b border-[#e0e0e0] dark:border-[#2d333b]"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Shopkeeper Dashboard
                            </Link>
                            <Link
                              href="/shopkeeper/profile"
                              onClick={() => setIsAccountOpen(false)}
                              className="flex items-center w-full px-4 py-3 text-sm text-[#212121] dark:text-[#f9f6f2] hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] border-b border-[#e0e0e0] dark:border-[#2d333b]"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Shopkeeper Profile
                            </Link>
                          </>
                        ) : (
                          <Link
                            href="/profile"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex items-center w-full px-4 py-3 text-sm text-[#212121] dark:text-[#f9f6f2] hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] rounded-t-lg border-b border-[#e0e0e0] dark:border-[#2d333b]"
                          >
                            <User className="h-4 w-4 mr-2" />
                            My Profile
                          </Link>
                        )}

                        {/* Role indicator */}
                        <div className="px-4 py-2 border-b bg-[#faffd2] dark:bg-[#3b2f22] border-[#e0e0e0] dark:border-[#2d333b]">
                          <div className="text-xs font-semibold text-[#85786a] dark:text-[#a2a6b2] uppercase">
                            Role
                          </div>
                          <div className="text-sm font-medium text-[#212121] dark:text-[#f9f6f2] mt-1">
                            {dbUser?.role === "admin" ? "👑 Admin" :
                              dbUser?.role === "shop_owner" && dbUser?.is_active === true ? "🏪 Active Shopkeeper" :
                                dbUser?.role === "shop_owner" && dbUser?.is_active === false ? "⏳ Pending Shopkeeper" :
                                  "🛒 Customer"}
                          </div>
                        </div>

                        {/* Logout button */}
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

                {/* Cart Button */}
                <Link href="/cart">
                  <button
                    className="bg-primary-brand text-white px-5 py-2.5 rounded-lg hover:bg-primary-hover transition-all flex items-center relative shadow-sm hover:shadow-md active:scale-95 border-2 border-transparent hover:border-[#1f8f4e]"
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
                </Link>
              </div>
            )}

            {/* Mobile menu buttons */}
            <div className="lg:hidden flex items-center gap-2">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-[#212121] dark:text-[#f9f6f2] hover:text-primary-brand dark:hover:text-primary-brand/80 p-2 rounded-lg hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] transition-all"
                aria-label="Toggle color theme"
                title="Toggle dark / light"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
              {/* Mobile Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="text-[#212121] dark:text-[#f9f6f2] hover:text-primary-brand p-2 rounded-lg hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] transition-all"
                aria-label="Open search"
              >
                <SearchIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              {/* Mobile Cart */}
              <Link href="/cart">
                <button
                  className="relative text-[#212121] dark:text-[#f9f6f2] hover:text-primary-brand p-2 rounded-lg hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] transition-all"
                  aria-label="Open cart"
                >
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                  {mounted && getTotalItems() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-secondary-brand text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-[#181c1f]"
                    >
                      {getTotalItems()}
                    </motion.span>
                  )}
                </button>
              </Link>
              {/* Mobile Menu */}
              <button
                onClick={toggleMenu}
                className="text-[#212121] dark:text-[#f9f6f2] hover:text-primary-brand p-2 rounded-lg hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] transition-all"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Category Navigation - Desktop */}
          <div className="hidden lg:block border-t border-[#e0e0e0] dark:border-[#2d333b] mt-0.5">
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
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden border-t border-[#e0e0e0] dark:border-[#2d333b] overflow-hidden"
              >
                <div className="px-4 py-4 space-y-3 bg-[#fffdf5] dark:bg-[#24292e]"
                  aria-label="Mobile navigation menu">
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

                  {/* Mobile Categories */}
                  <div className="border-t pt-3">
                    <div className="text-xs font-semibold text-[#85786a] uppercase tracking-wide mb-2">
                      Categories
                    </div>
                    {groceryCategories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <Link
                          key={index}
                          href={category.href}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[#212121] transition-colors hover:bg-[#e6f4ec] hover:text-primary-brand dark:text-[#f9f6f2] dark:hover:bg-[#1f2f25]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Icon className="size-4 text-[#85786a] dark:text-[#a2a6b2]" />
                          <span>{category.name}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Mobile User Account */}
                  <div className="border-t pt-3 space-y-3">
                    {/* Become Shopkeeper Button - only show if not admin and not active shopkeeper */}
                    {dbUser?.role !== "admin" && !(dbUser?.role === "shop_owner" && dbUser?.is_active === true) && (
                      <Link
                        href={user ? "/shopkeeper/apply" : "/shopkeeper/signup"}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <button className="flex items-center w-full text-left p-3 bg-[#27ae60] hover:bg-[#1f8f4e] text-white rounded-lg transition-colors">
                          <div className="h-5 w-5 mr-3">🏪</div>
                          <div>
                            <div className="text-xs text-[#ffe066]">
                              {dbUser?.role === "shop_owner" && !dbUser?.is_active
                                ? "Pending Application"
                                : "Grow with us"}
                            </div>
                            <div className="text-sm font-medium text-white">
                              {dbUser?.role === "shop_owner" && !dbUser?.is_active
                                ? "⏳ Application Pending"
                                : "Register Your Shop (for store owners)"}
                            </div>
                          </div>
                        </button>
                      </Link>
                    )}

                    {user ? (
                      <div className="space-y-2">
                        {/* User Info */}
                        <div className="flex items-center w-full text-left p-3 bg-[#faffd2] dark:bg-[#3b2f22] rounded-lg border border-[#e0e0e0] dark:border-[#2d333b]">
                          <User className="h-5 w-5 mr-3 text-[#85786a] dark:text-[#f9f6f2]" />
                          <div className="flex-1">
                            <div className="text-xs text-[#85786a] dark:text-[#a2a6b2]">Account</div>
                            <div className="text-sm font-medium text-[#212121] dark:text-[#f9f6f2]">
                              {user.name}
                            </div>
                          </div>
                          <div className="text-xs font-semibold px-2 py-1 rounded bg-primary-brand/10 text-primary-brand">
                            {dbUser?.role === "admin" ? "Admin" :
                              dbUser?.role === "shop_owner" && dbUser?.is_active === true ? "Shopkeeper" :
                                dbUser?.role === "shop_owner" && dbUser?.is_active === false ? "Pending" :
                                  "Customer"}
                          </div>
                        </div>

                        {/* Profile Links */}
                        {dbUser?.role === "admin" ? (
                          <Link
                            href="/admin"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <button className="flex items-center w-full text-left p-3 hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] bg-[#fffdf5] dark:bg-[#24292e] rounded-lg transition-colors text-[#212121] dark:text-[#f9f6f2] border border-[#e0e0e0] dark:border-[#2d333b]">
                              <User className="h-5 w-5 mr-3" />
                              <div>
                                <div className="text-sm font-medium">
                                  Admin Dashboard
                                </div>
                              </div>
                            </button>
                          </Link>
                        ) : dbUser?.role === "shop_owner" && dbUser?.is_active === true ? (
                          <>
                            <Link
                              href="/shopkeeper"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <button className="flex items-center w-full text-left p-3 hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] bg-[#fffdf5] dark:bg-[#24292e] rounded-lg transition-colors text-[#212121] dark:text-[#f9f6f2] border border-[#e0e0e0] dark:border-[#2d333b]">
                                <User className="h-5 w-5 mr-3" />
                                <div>
                                  <div className="text-xs text-[#85786a]">Shopkeeper</div>
                                  <div className="text-sm font-medium text-[#212121] dark:text-[#f9f6f2]">Dashboard</div>
                                </div>
                              </button>
                            </Link>
                            <Link
                              href="/shopkeeper/profile"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <button className="flex items-center w-full text-left p-3 hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] bg-[#fffdf5] dark:bg-[#24292e] rounded-lg transition-colors text-[#212121] dark:text-[#f9f6f2] border border-[#e0e0e0] dark:border-[#2d333b]">
                                <User className="h-5 w-5 mr-3" />
                                <div>
                                  <div className="text-xs text-[#85786a]">Shopkeeper</div>
                                  <div className="text-sm font-medium text-[#212121] dark:text-[#f9f6f2]">Profile</div>
                                </div>
                              </button>
                            </Link>
                          </>
                        ) : (
                          <Link
                            href="/profile"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <button className="flex items-center w-full text-left p-3 hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] bg-[#fffdf5] dark:bg-[#24292e] rounded-lg transition-colors text-[#212121] dark:text-[#f9f6f2] border border-[#e0e0e0] dark:border-[#2d333b]">
                              <User className="h-5 w-5 mr-3" />
                              <div>
                                <div className="text-xs text-[#85786a]">Your</div>
                                <div className="text-sm font-medium text-[#212121] dark:text-[#f9f6f2]">Profile</div>
                              </div>
                            </button>
                          </Link>
                        )}

                        {/* Logout Button */}
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                            success("Logged out successfully");
                          }}
                          className="flex items-center w-full text-left p-3 hover:bg-[#fff1eb] dark:hover:bg-[#3c1f18] bg-[#fffdf5] dark:bg-[#24292e] rounded-lg transition-colors text-red-600 border border-[#ffb199]"
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          <div>
                            <div className="text-xs text-red-600">Sign Out</div>
                            <div className="text-sm font-medium">Logout</div>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                        <button className="flex items-center w-full text-left p-3 hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] rounded-lg transition-colors border border-[#e0e0e0] dark:border-[#2d333b] bg-[#fffdf5] dark:bg-[#24292e]">
                          <User className="h-5 w-5 mr-3 text-[#85786a] dark:text-[#f9f6f2]" />
                          <div>
                            <div className="text-xs text-[#85786a] dark:text-[#a2a6b2]">Account</div>
                            <div className="text-sm font-medium text-[#212121] dark:text-[#f9f6f2]">
                              Sign In / Sign Up
                            </div>
                          </div>
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modals */}
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
        />
      </nav>
    </>
  );
}
