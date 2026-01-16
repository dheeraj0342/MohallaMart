"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Search,
  ShoppingCart,
  ChevronDown,
  User,
  Moon,
  Sun,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { useThemeContext } from "./ThemeProvider";

const getEmojiForCategory = (name: string) => {
  if (!name) return "📦";
  const n = name.toLowerCase().trim();
  
  // Vegetables & Produce
  if (n.includes("vegetable") || n.includes("veggie") || n.includes("produce")) return "🥦";
  
  // Fruits
  if (n.includes("fruit")) return "🍎";
  
  // Dairy & Milk
  if (n.includes("dairy") || n.includes("milk") || n.includes("cheese") || n.includes("yogurt")) return "🥛";
  
  // Snacks & Chips
  if (n.includes("snack") || n.includes("chip") || n.includes("crisp") || n.includes("namkeen")) return "🍿";
  
  // Beverages & Drinks
  if (n.includes("drink") || n.includes("beverage") || n.includes("juice") || n.includes("soda") || n.includes("water")) return "🥤";
  
  // Bakery & Bread
  if (n.includes("bakery") || n.includes("bread") || n.includes("bun") || n.includes("cake") || n.includes("pastry")) return "🍞";
  
  // Meat & Protein
  if (n.includes("meat") || n.includes("chicken") || n.includes("fish") || n.includes("egg") || n.includes("protein")) return "🍗";
  
  // Personal Care & Hygiene
  if (n.includes("personal") || n.includes("care") || n.includes("hygiene") || n.includes("soap") || n.includes("shampoo")) return "🧴";
  
  // Home & Household
  if (n.includes("home") || n.includes("household") || n.includes("cleaning") || n.includes("detergent")) return "🏠";
  
  // Baby Products
  if (n.includes("baby") || n.includes("infant") || n.includes("diaper")) return "👶";
  
  // Pet Supplies
  if (n.includes("pet") || n.includes("dog") || n.includes("cat")) return "🐾";
  
  // Frozen Foods
  if (n.includes("frozen") || n.includes("ice cream")) return "❄️";
  
  // Electronics & Gadgets
  if (n.includes("electronic") || n.includes("mobile") || n.includes("phone") || n.includes("gadget") || n.includes("laptop")) return "📱";
  
  // Fashion & Clothing
  if (n.includes("fashion") || n.includes("clothing") || n.includes("apparel") || n.includes("wear") || n.includes("shirt")) return "👕";
  
  // Beauty & Cosmetics
  if (n.includes("beauty") || n.includes("cosmetic") || n.includes("makeup")) return "💄";
  
  // Grocery & General
  if (n.includes("grocery") || n.includes("fresh") || n.includes("organic")) return "🛒";
  
  // Cafe & Coffee
  if (n.includes("cafe") || n.includes("coffee") || n.includes("tea")) return "☕";
  
  // Toys & Games
  if (n.includes("toy") || n.includes("game") || n.includes("play")) return "🧸";
  
  // Stationery & Books
  if (n.includes("stationery") || n.includes("book") || n.includes("pen") || n.includes("paper")) return "📚";
  
  // Health & Pharmacy
  if (n.includes("health") || n.includes("pharmacy") || n.includes("medicine") || n.includes("medical")) return "💊";
  
  // All/Everything
  if (n.includes("all") || n === "all") return "🏪";
  
  // Default fallback
  return "📦";
};

export interface MobileHeaderProps {
  onMenuClick: () => void;
  cartCount: number;
  location: string | null;
  onOpenLocation: () => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
}

export function MobileHeader({
  onMenuClick,
  cartCount,
  location,
  onOpenLocation,
  onOpenSearch,
  onOpenCart,
}: MobileHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { location: storeLocation } = useStore();
  const categories = useQuery(api.categories.getAllCategories, { is_active: true });
  const { theme, toggleTheme } = useThemeContext();

  const fallbackCategories = useMemo(
    () => [
      { name: "Vegetables", iconEmoji: "🥦" },
      { name: "Fruits", iconEmoji: "🍎" },
      { name: "Dairy", iconEmoji: "🥛" },
      { name: "Snacks", iconEmoji: "🍿" },
      { name: "Beverages", iconEmoji: "🥤" },
      { name: "Bakery", iconEmoji: "🍞" },
      { name: "Meat", iconEmoji: "🍗" },
      { name: "Personal Care", iconEmoji: "🧴" },
      { name: "Home Care", iconEmoji: "🏠" },
      { name: "Baby Care", iconEmoji: "👶" },
    ],
    [],
  );

  const categoryChips = useMemo(() => {
    if (Array.isArray(categories) && categories.length) {
      return categories.slice(0, 12).map((c) => ({
        name: c.name ?? "",
        iconEmoji: getEmojiForCategory(c.name ?? ""),
      }));
    }
    return fallbackCategories;
  }, [categories, fallbackCategories]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show compact header when scrolling down past 50px
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const deliveryTime = "8 MINS";
  const displayLocation = location || storeLocation?.area || "Select Location";

  if (!mounted) return null;

  return (
    <header 
      className={`lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-all duration-300 ${
        isScrolled ? 'shadow-md border-border' : ''
      }`}
    >
      {/* Top row: Logo, Delivery Status and Icons - Hidden when scrolled */}
      <div 
        className={`px-4 py-3 flex items-center justify-between gap-3 transition-all duration-300 overflow-hidden ${
          isScrolled ? 'max-h-0 py-0 opacity-0' : 'max-h-20 opacity-100'
        }`}
      >
        {/* Left: Logo + Delivery Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="flex flex-col leading-none">
                <h1 className="text-base font-bold poppins-bold">
                  <span className="text-primary">Mohalla</span>
                  <span className="text-secondary">Mart</span>
                </h1>
              </div>
            </div>
          </Link>

          
        </div>

        {/* Right: Theme Toggle, User and Cart Icons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme Toggle Button */}
         
          
          {/* Delivery Info */}
          <button
            onClick={onOpenLocation}
            className="flex flex-col items-start min-w-0 flex-1"
          >
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-extrabold text-foreground uppercase tracking-tight">
                Delivery in {deliveryTime}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-foreground" strokeWidth={3} />
            </div>
            <div className="flex items-center gap-1 w-full">
              <MapPin className="w-3 h-3 text-primary flex-shrink-0" strokeWidth={2.5} />
              <span className="text-[11px] text-muted-foreground truncate font-medium">
                {displayLocation}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Search bar: Always visible */}
      <div className={`px-4 transition-all duration-300 ${isScrolled ? 'py-2' : 'pb-3'}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="relative flex-1 flex items-center gap-3 px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-left transition-all active:scale-[0.98] hover:bg-muted"
          >
            <Search className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" strokeWidth={2.5} />
            <span className="text-[14px] text-muted-foreground font-medium truncate">
              Search "milk", "eggs" or "bread"
            </span>
          </button>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-card hover:bg-muted border border-border hover:border-primary transition-all duration-300 active:scale-95 group flex-shrink-0"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" strokeWidth={2.5} />
            ) : (
              <Sun className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      {/* Categories scroll: Always visible */}
      <div className={`px-4 transition-all duration-300 ${isScrolled ? 'pb-2' : 'pb-3'}`}>
        <div className="flex gap-3 overflow-x-auto no-scrollbar scrollbar-hide py-1">
          {categoryChips.map((cat, idx) => (
            <Link
              key={cat.name + idx}
              href={`/shops?category=${encodeURIComponent(cat.name)}`}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16 active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 bg-green-bg dark:bg-green-bg/20 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-green-primary/10 hover:border-green-primary/30 transition-colors">
                <span>{cat.iconEmoji}</span>
              </div>
              <span className="text-[10px] font-bold text-foreground text-center leading-tight line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
