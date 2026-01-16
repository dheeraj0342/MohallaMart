"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  MapPin,
  Search,
  ShoppingCart,
  Clock,
  ChevronDown,
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

  // Delivery time copy (could be wired to ETA service)
  const deliveryTime = "8 minutes";
  const displayLocation = location || storeLocation?.area || "Select Location";

  if (!mounted) return null;

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-[#E0E0E0]">
      {/* Top row */}
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Menu */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-[#1A1A1A]" strokeWidth={2} />
        </button>

        {/* Location */}
        <button
          onClick={onOpenLocation}
          className="flex items-start gap-2 flex-1 mx-3 py-1 hover:bg-gray-50 rounded-lg px-2 transition-colors"
          aria-label="Select delivery location"
        >
          <MapPin
            className="w-5 h-5 text-[#54B226] mt-0.5 flex-shrink-0"
            strokeWidth={2}
            fill="#54B226"
          />
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-[#1A1A1A] truncate">
                {displayLocation}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" strokeWidth={2} />
            </div>
            <p className="text-[11px] text-[#666666] font-medium flex items-center gap-1 mt-0.5">
              <Clock className="h-3.5 w-3.5 text-[#54B226]" strokeWidth={2} />
              Delivery in {deliveryTime}
            </p>
          </div>
        </button>

        {/* Search & Cart */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform flex-shrink-0"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2} />
          </button>

          <button
            onClick={onOpenCart}
            className="p-2 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform relative flex-shrink-0"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingCart className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E23744] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-3 pt-1">
        <button
          onClick={onOpenSearch}
          className="relative w-full text-left"
          aria-label="Search products"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
          <span className="block w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm text-[#1A1A1A] placeholder-gray-500 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#54B226] focus:bg-white transition-all">
            Search for "milk"
          </span>
        </button>
      </div>
    </header>
  );
}
