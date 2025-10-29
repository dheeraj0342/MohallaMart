"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
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
  const { user: profile } = useStore();
  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as any;

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
    return null;
  }

  return <>{children}</>;
}
