"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Bell,
  Search,
  Store,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

export default function ShopkeeperHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { success } = useToast();
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize theme
  useEffect(() => {
    setMounted(true);
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
    user ? { id: user.id } : "skip"
  ) as
    | {
        _id?: string;
        name?: string;
        email?: string;
        avatar_url?: string;
        role?: string;
      }
    | null
    | undefined;

  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id as Id<"users">, is_active: true } : "skip"
  ) as
    | Array<{
        _id: string;
        name: string;
        address?: { city?: string; state?: string };
      }>
    | null
    | undefined;

  const shop = Array.isArray(shops) && shops.length > 0 ? shops[0] : null;

  const handleLogout = async () => {
    await logout();
    success("Logged out successfully");
    router.push("/");
  };

  // Type guard to check if user is from store (has name property)
  const storeUser = user && "name" in user ? user : null;
  const displayName = dbUser?.name || storeUser?.name || "Shopkeeper";
  const displayEmail = dbUser?.email || storeUser?.email || user?.email || "";
  const avatarUrl = dbUser?.avatar_url || storeUser?.avatar_url;

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center gap-2 sm:gap-4 px-2 sm:px-4">
        {/* Sidebar Trigger */}
        <SidebarTrigger />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Shop Info (if available) */}
        {shop && (
          <div className="hidden lg:flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-green-600/10 border border-green-600/20 min-w-0">
            <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
            <div className="text-xs sm:text-sm min-w-0">
              <p className="font-semibold text-green-700 dark:text-green-300 truncate">
                {shop.name}
              </p>
              {shop.address?.city && (
                <p className="text-xs text-muted-foreground truncate">
                  {shop.address.city}
                  {shop.address.state && `, ${shop.address.state}`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-600" />
        </Button>

        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-yellow-400" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 h-8 sm:h-9"
            >
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-green-600/10 flex items-center justify-center text-green-600 overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </div>
              <div className="hidden md:block text-left text-sm min-w-0">
                <p className="font-medium leading-none truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {displayEmail}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground hidden md:block flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{displayEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/shopkeeper/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/shopkeeper/profile" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

