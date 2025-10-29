"use client";

import { useRouter } from "next/navigation";
import ShopkeeperSignupForm from "@/components/auth/shopkeeper/ShopkeeperSignupForm";

export default function ShopkeeperSignupPage() {
  const router = useRouter();
  return (
    <ShopkeeperSignupForm onSuccess={() => router.push("/shopkeeper/login")} />
  );
}
