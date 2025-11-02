"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  MapPin,
  Search as SearchIcon,
  Clock,
  Percent,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
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

  const toggleTheme = () => {
    try {
      const next = !isDark;
      setIsDark(next);
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch {
      // noop
    }
  };
  
  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as { role?: string; is_active?: boolean } | null | undefined;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const groceryCategories = [
    { name: "Fruits & Vegetables", href: "#fruits" },
    { name: "Dairy & Bakery", href: "#dairy" },
    { name: "Snacks & Beverages", href: "#snacks" },
    { name: "Personal Care", href: "#personal-care" },
  ];

  return (
    <>
  {/* Top Banner */}
  <div className="bg-linear-to-r from-primary-brand via-[#37c978] to-color-secondary dark:from-[#1f2f25] dark:via-[#24292e] dark:to-[#3b2f22] text-white dark:text-[#f9f6f2] py-2 text-center text-sm transition-colors">
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>10-min delivery</span>
          </div>
          <div className="flex items-center">
            <Percent className="w-4 h-4 mr-1" />
            <span>Free delivery above ₹199</span>
          </div>
          <span className="hidden sm:inline">
            🎉 Get 10% off on first order
          </span>
        </div>
      </div>
    <nav className="bg-[#f9f6f2]/95 text-[#212121] dark:text-[#f9f6f2] dark:bg-[#181c1f]/95 shadow-sm dark:shadow-md sticky top-0 z-50 border-b border-[#e0e0e0] dark:border-[#2d333b] backdrop-blur transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Logo & Location */}
            <div className="flex items-center space-x-4">
              <div className="shrink-0">
                <Link href="/">
                  <div className="flex items-center cursor-pointer group">
                    <div className="text-3xl mr-2">🛒</div>
                    <div>
                      <h1 className="text-xl font-bold text-primary-brand group-hover:text-primary-hover transition-colors">
                        Mohalla
                        <span className="text-secondary-brand">Mart</span>
                      </h1>
                      <p className="text-xs text-[#85786a] -mt-1">
                        Groceries in minutes
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Location Button - Desktop */}
              {mounted && (
                <div className="hidden md:block">
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex items-center bg-[#faffd2] hover:bg-[#f0e88c] dark:bg-[#3b2f22] dark:hover:bg-[#4a3c2b] px-3 py-2 rounded-lg border border-[#e0e0e0] dark:border-[#2d333b] transition-colors group"
                  >
                    <MapPin className="h-4 w-4 mr-2 text-primary-brand transition-colors group-hover:text-[#1f8f4e] dark:text-secondary-brand dark:group-hover:text-secondary-brand/80" />
                    <div className="text-left">
                      <div className="text-xs text-[#85786a] dark:text-[#a2a6b2]">Deliver to</div>
                      <div className="text-sm font-medium text-[#212121] dark:text-[#f9f6f2] max-w-[120px] truncate">
                        {location ? location.area : "Select Location"}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Search Bar - Desktop (only show when search modal is closed) */}
            {!isSearchOpen && (
              <div className="hidden md:flex flex-1 max-w-xl mx-8">
                <div className="relative w-full">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#85786a] dark:text-[#a2a6b2] h-5 w-5 pointer-events-none" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Search for groceries, fruits, vegetables..."
                    className="w-full pl-10 pr-24 py-3 bg-[#ffffff] dark:bg-[#24292e] border-2 border-[#e0e0e0] dark:border-[#2d333b] rounded-xl text-[#212121] dark:text-[#f9f6f2] placeholder:text-[#85786a] dark:placeholder:text-[#a2a6b2] focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand transition-all duration-200 hover:border-[#c8c8c8] dark:hover:border-[#3d444f] cursor-pointer"
                    onClick={() => setSearchOpen(true)}
                    aria-label="Search"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                    <kbd className="px-2 py-1 text-xs font-semibold text-[#594a3a] dark:text-[#f9f6f2] bg-[#ffffff] dark:bg-[#24292e] border border-[#e0e0e0] dark:border-[#2d333b] rounded">
                      M
                    </kbd>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Desktop */}
            {mounted && (
            <div className="hidden md:flex items-center space-x-4">
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
                      <button className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors text-primary-brand border-primary-brand hover:bg-primary-brand hover:text-white">
                        Shopkeeper Dashboard
                      </button>
                    </Link>
                  );
                }
                
                // Pending shopkeeper
                if (userRole === "shop_owner" && !isActive) {
                  return (
                    <span className="px-4 py-2 rounded-lg border text-sm font-medium text-amber-600 border-amber-300 bg-amber-50">
                      ⏳ Application Pending
                    </span>
                  );
                }
                
                // Regular customer or not logged in
                return (
                  <Link href={user ? "/shopkeeper/apply" : "/shopkeeper/signup"}>
                    <button className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors text-[#27ae60] border-[#27ae60] hover:bg-[#27ae60] hover:text-white">
                      Register Your Shop (for store owners)
                    </button>
                  </Link>
                );
              })()}
              {/* User Account */}
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] transition-colors"
                aria-label="Toggle color theme"
                title="Toggle dark / light"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-[#212121]" />
                )}
              </button>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsAccountOpen((v) => !v)}
                    className="flex items-center text-[#212121] dark:text-[#f9f6f2] px-3 py-2 rounded-lg hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] transition-colors"
                    aria-haspopup="menu"
                    aria-expanded={isAccountOpen}
                  >
                    <User className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="text-xs text-[#85786a] dark:text-[#a2a6b2]">Account</div>
                      <div className="text-sm font-medium">{user.name}</div>
                    </div>
                  </button>
                  {isAccountOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#ffffff] dark:bg-[#24292e] border border-[#e0e0e0] dark:border-[#2d333b] rounded-lg shadow-lg z-50">
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
                  <button className="flex items-center text-[#212121] dark:text-[#f9f6f2] hover:text-primary-brand px-3 py-2 rounded-lg hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] transition-colors">
                    <User className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="text-xs text-[#85786a] dark:text-[#a2a6b2]">Account</div>
                      <div className="text-sm font-medium">Sign In</div>
                    </div>
                  </button>
                </Link>
              )}

              {/* Cart Button */}
              <Link href="/cart">
                <button
                  className="bg-primary-brand text-white px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors flex items-center relative shadow-sm hover:shadow-md"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="text-xs opacity-90">My Cart</div>
                    <div className="text-sm font-medium">
                      {mounted && getTotalItems() > 0 ? `${getTotalItems()} items` : "Empty"}
                    </div>
                  </div>
                  {mounted && getTotalItems() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-secondary-brand text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg"
                    >
                      {getTotalItems()}
                    </motion.span>
                  )}
                </button>
              </Link>
            </div>
            )}

            {/* Mobile menu button */}
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-[#212121] dark:text-[#f9f6f2] hover:text-primary-brand dark:hover:text-primary-brand/80 p-2"
                aria-label="Toggle color theme"
                title="Toggle dark / light"
              >
                {isDark ? (
                  <Sun className="h-6 w-6 text-yellow-400" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </button>
              {/* Mobile Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="text-[#212121] hover:text-primary-brand p-2"
                aria-label="Open search"
              >
                <SearchIcon className="h-6 w-6" />
              </button>
              {/* Mobile Cart */}
              <Link href="/cart">
                <button
                  className="relative text-[#212121] hover:text-primary-brand p-2"
                  aria-label="Open cart"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {mounted && getTotalItems() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-secondary-brand text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {getTotalItems()}
                  </motion.span>
                )}
                </button>
              </Link>
              {/* Mobile Menu */}
              <button
                onClick={toggleMenu}
                className="text-[#212121] hover:text-primary-brand p-2"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Category Navigation - Desktop */}
          <div className="hidden md:block border-t border-[#e0e0e0] dark:border-[#2d333b]">
            <div className="flex items-center justify-between py-3">
              <div className="flex space-x-8">
                {groceryCategories.map((category, index) => (
                  <Link
                    key={index}
                    href={category.href}
                    className="text-sm text-[#212121] dark:text-[#f9f6f2] hover:text-primary-brand dark:hover:text-primary-brand font-medium transition-colors relative group"
                  >
                    {category.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-brand transition-all group-hover:w-full"></span>
                  </Link>
                ))}
              </div>
              <div className="text-sm text-[#85786a]">
                <span className="bg-[#ffe066]/80 text-[#3b2f22] px-2 py-1 rounded-full text-xs font-medium">
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
                    className="flex items-center w-full text-left p-3 hover:bg-[#faffd2] dark:hover:bg-[#3b2f22] rounded-lg transition-colors group"
                  >
                    <MapPin className="h-5 w-5 mr-3 text-primary-brand transition-colors group-hover:text-[#1f8f4e] dark:text-secondary-brand dark:group-hover:text-secondary-brand/80" />
                    <div>
                      <div className="text-xs text-[#85786a] dark:text-[#a2a6b2]">Deliver to</div>
                      <div className="text-sm font-medium text-[#212121] dark:text-[#f9f6f2]">
                        {location ? location.area : "Select Location"}
                      </div>
                    </div>
                  </button>

                  {/* Mobile Categories */}
                  <div className="border-t pt-3">
                    <div className="text-xs font-semibold text-[#85786a] uppercase tracking-wide mb-2">
                      Categories
                    </div>
                    {groceryCategories.map((category, index) => (
                      <Link
                        key={index}
                        href={category.href}
                        className="block px-3 py-2 text-[#212121] dark:text-[#f9f6f2] hover:text-primary-brand hover:bg-[#e6f4ec] dark:hover:bg-[#1f2f25] rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
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
