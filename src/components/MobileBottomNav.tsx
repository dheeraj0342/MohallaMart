"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  Grid2X2,
  ShoppingCart,
  Package,
  User,
} from "lucide-react";

export type NavTab = "home" | "categories" | "cart" | "orders" | "profile";

export interface MobileBottomNavProps {
  activeTab: NavTab;
  cartCount: number;
  onTabChange: (tab: NavTab) => void;
  onOpenCart: () => void;
}

const navItems: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "categories", label: "Categories", icon: Grid2X2 },
  { id: "cart", label: "Cart", icon: ShoppingCart },
  { id: "orders", label: "Orders", icon: Package },
  { id: "profile", label: "Profile", icon: User },
];

export function MobileBottomNav({
  activeTab,
  cartCount,
  onTabChange,
  onOpenCart,
}: MobileBottomNavProps) {
  const [localCartCount, setLocalCartCount] = useState(cartCount);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-[64px] bg-white border-t border-[#E0E0E0] shadow-lg pb-safe">
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCart = item.id === "cart";
          const isActive = activeTab === item.id;
          const count = item.id === "cart" ? cartCount : 0;

          if (isCart) {
            return (
              <button
                key={item.id}
                onClick={onOpenCart}
                className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] rounded-lg active:scale-95 transition-all"
                aria-label={`Cart with ${count} items`}
              >
                <div className="relative">
                  <Icon
                    className={`h-6 w-6 transition-colors ${
                      isActive ? "text-[#0C831F]" : "text-[#666666]"
                    }`}
                  />
                  {count > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 bg-[#FF6B00] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    isActive ? "text-[#0C831F]" : "text-[#666666]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.id === "home" ? "/" : `/${item.id}`}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`h-6 w-6 transition-colors ${
                  isActive ? "text-[#0C831F]" : "text-[#666666]"
                }`}
              />
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isActive ? "text-[#0C831F]" : "text-[#666666]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
