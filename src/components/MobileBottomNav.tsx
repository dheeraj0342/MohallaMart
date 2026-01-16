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
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-primary/5 via-green-primary/5 to-purple-primary/5 dark:from-purple-primary/10 dark:via-green-primary/10 dark:to-purple-primary/10 backdrop-blur-xl border-t border-border shadow-2xl pb-safe">
      <div className="h-16 flex items-center justify-around px-2">
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
                className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[68px] rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive 
                    ? "bg-primary/10" 
                    : "hover:bg-muted"
                }`}
                aria-label={`Cart with ${count} items`}
              >
                <div className="relative">
                  <Icon
                    className={`h-6 w-6 transition-colors duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {count > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-background animate-in zoom-in">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.id === "home" ? "/" : `/${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[68px] rounded-xl transition-all duration-200 active:scale-95 ${
                isActive 
                  ? "bg-primary/10" 
                  : "hover:bg-muted"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`h-6 w-6 transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[11px] font-semibold transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
