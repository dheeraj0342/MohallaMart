"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ShopkeeperSignupForm from "@/components/auth/shopkeeper/ShopkeeperSignupForm";

function ShopkeeperSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const loginUrl = next ? `/shopkeeper/login?next=${encodeURIComponent(next)}` : "/shopkeeper/login";

  return (
    <ShopkeeperSignupForm onSuccess={() => router.push(loginUrl)} />
  );
}

export default function ShopkeeperSignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ShopkeeperSignupContent />
    </Suspense>
  );
}
