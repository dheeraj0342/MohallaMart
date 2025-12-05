"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ShopkeeperLoginForm from "@/components/auth/shopkeeper/ShopkeeperLoginForm";

function ShopkeeperLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/shopkeeper";
  return <ShopkeeperLoginForm onSuccess={() => router.replace(next)} />;
}

export default function ShopkeeperLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ShopkeeperLoginContent />
    </Suspense>
  );
}
