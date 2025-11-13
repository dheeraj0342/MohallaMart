"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Loader2 } from "lucide-react";

/**
 * ShopkeeperPage: Auth/role-based router for /shopkeeper root route
 */
export default function ShopkeeperPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Load the shopkeeper db user (if signed in)
  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip"
  ) as { role?: string; is_active?: boolean } | null | undefined;

  useEffect(() => {
    if (user === null) return; // Still initializing auth
    if (!user) {
      router.replace("/shopkeeper/login");
      return;
    }
    if (dbUser === undefined) return; // Still loading user profile

    // Redirect logic
    if (dbUser?.role === "shop_owner" && dbUser.is_active) {
      router.replace("/shopkeeper/dashboard");
    } else if (dbUser?.role === "shop_owner") {
      router.replace("/shopkeeper/registration");
    } else {
      router.replace("/shopkeeper/apply");
    }
  }, [user, dbUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#f9fafb] via-white to-[#f1fff6] dark:from-[#0f1418] dark:via-[#11181d] dark:to-[#1b242b]">
      <div className="text-center space-y-4">
        <div className="relative inline-flex items-center justify-center h-16 w-16 mx-auto">
          <span className="absolute inset-0 rounded-full border-4 border-green-600/20"></span>
          <span className="absolute inset-1 rounded-full border-4 border-transparent border-t-green-500 animate-spin"></span>
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-green-600/10 text-green-600 text-2xl">
            🛍️
          </span>
        </div>
        <div className="flex items-center gap-2 justify-center text-neutral-700 dark:text-neutral-200">
          <Loader2 className="animate-spin h-5 w-5 text-green-500" />
          <span className="text-base font-medium">
            Routing you to your shopkeeper workspace…
          </span>
        </div>
      </div>
    </div>
  );
}

