"use client";

import { useRouter } from "next/navigation";
import ShopkeeperLoginForm from "@/components/auth/shopkeeper/ShopkeeperLoginForm";

export default function ShopkeeperLoginPage() {
  const router = useRouter();
  return <ShopkeeperLoginForm onSuccess={() => router.replace("/shopkeeper")} />;
}
