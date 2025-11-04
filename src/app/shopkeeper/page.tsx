"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export default function ShopkeeperPage() {
  const router = useRouter();
  const { user } = useAuth();
  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as { role?: string; is_active?: boolean } | null | undefined;

  useEffect(() => {
    // Wait for auth to initialize
    if (user === null) {
      // Still loading auth state
      return;
    }

    if (!user) {
      // Not logged in
      router.replace("/shopkeeper/login");
      return;
    }

    if (dbUser === undefined) {
      // Still loading user data
      return;
    }
    if (dbUser?.role === "shop_owner" && dbUser?.is_active === true) {
      router.replace("/shopkeeper/dashboard");
    } else if (dbUser?.role === "shop_owner" && dbUser?.is_active === false) {
      router.replace("/shopkeeper/registration");
    } else {
      router.replace("/shopkeeper/apply");
    }
  }, [user, dbUser, router]);
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-[#f9fafb] via-white to-[#f1fff6] dark:from-[#0f1418] dark:via-[#11181d] dark:to-[#1b242b]">
      <div className="text-center space-y-3">
        <div className="relative inline-flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-4 border-primary-brand/20"></span>
          <span className="absolute inset-1 rounded-full border-4 border-transparent border-t-primary-brand animate-spin"></span>
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary-brand/10 text-primary-brand text-lg">
            🛍️
          </span>
        </div>
        <p className="text-sm font-medium text-[#4b5563] dark:text-[#cbd5f5]">
          Routing you to the right shopkeeper experience…
        </p>
      </div>
    </div>
  );
}

