"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  MapPin,
  Search,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { useStore } from "@/store/useStore";

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
  const { location: storeLocation } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock delivery time - in production, this would come from API/store
  const deliveryTime = "8 minutes";
  const displayLocation = location || "Select Location";

  if (!mounted) return null;

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-[56px] bg-white border-b border-[#E0E0E0] shadow-sm">
      <div className="h-full px-4 flex items-center gap-3">
        {/* Menu hamburger button */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-[#1A1A1A]" />
        </button>

        {/* Location Section - Primary Focus (Blinkit Style) */}
        <button
          onClick={onOpenLocation}
          className="flex-1 flex items-start gap-2 hover:opacity-80 transition-opacity"
          aria-label="Select delivery location"
        >
          {/* Location Icon and Info */}
          <div className="pt-0.5">
            <MapPin className="h-5 w-5 text-[#54B226] flex-shrink-0" />
          </div>
          <div className="flex-1 text-left min-w-0">
            {/* Location Name with Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-[#1A1A1A] truncate">
                {displayLocation.split(",")[0]}
              </span>
              <span className="text-[#1A1A1A] text-xs">▼</span>
            </div>
            {/* Delivery Time */}
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="h-3.5 w-3.5 text-[#54B226] flex-shrink-0" />
              <span className="text-xs text-[#666666] font-medium">
                Delivery in {deliveryTime}
              </span>
            </div>
          </div>
        </button>

        {/* Search Icon */}
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all flex-shrink-0"
          aria-label="Search products"
        >
          <Search className="h-6 w-6 text-[#1A1A1A]" />
        </button>

        {/* Cart Icon with Badge */}
        <button
          onClick={onOpenCart}
          className="relative p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all flex-shrink-0"
          aria-label={`Cart with ${cartCount} items`}
        >
          <ShoppingCart className="h-6 w-6 text-[#1A1A1A]" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#E23744] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
