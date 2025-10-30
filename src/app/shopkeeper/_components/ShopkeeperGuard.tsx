"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export default function ShopkeeperGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as { role?: string; is_active?: boolean } | null | undefined;

  useEffect(() => {
    if (user === null) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (dbUser === undefined) return;
    if (!dbUser || dbUser.role !== "shop_owner" || dbUser.is_active !== true) {
      router.replace("/");
      return;
    }
  }, [user, dbUser, router]);

  if (
    !user ||
    dbUser === undefined ||
    !dbUser ||
    dbUser.role !== "shop_owner" ||
    dbUser.is_active !== true
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brand mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
