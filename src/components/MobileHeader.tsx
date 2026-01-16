"use client";

import { useState } from "react";
import {
  Menu,
  MapPin,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-[60px] bg-white border-b border-[#E0E0E0] shadow-sm">
      <div className="h-full px-4 flex items-center gap-3">
        {/* Menu hamburger button */}
        <button
          onClick={onMenuClick}
          className="p-2.5 -ml-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-[#1A1A1A]" />
        </button>

        {/* Location selector */}
        <button
          onClick={onOpenLocation}
          className="flex items-center gap-1.5 flex-shrink-0 max-w-[160px]"
          aria-label="Select delivery location"
        >
          <MapPin className="h-4 w-4 text-[#0C831F]" />
          <span className="text-sm font-medium text-[#1A1A1A] truncate">
            {location || "Select"}
          </span>
        </button>

        {/* Search bar */}
        <button
          onClick={onOpenSearch}
          className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl active:scale-95 transition-all"
          aria-label="Search products"
        >
          <Search className="h-5 w-5 text-[#666666]" />
          <span className="flex-1 text-sm text-[#666666] text-left">
            Search for products
          </span>
        </button>

        {/* Cart button with badge */}
        <button
          onClick={onOpenCart}
          className="relative p-2.5 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
          aria-label={`Cart with ${cartCount} items`}
        >
          <ShoppingCart className="h-6 w-6 text-[#1A1A1A]" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-[#FF6B00] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
