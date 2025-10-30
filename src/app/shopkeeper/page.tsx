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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brand mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

