"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ShopkeeperSignupForm from "@/components/auth/shopkeeper/ShopkeeperSignupForm";

function ShopkeeperSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/shopkeeper/apply";
  // After signup, redirect directly to the next page (usually apply)
  // The user will be authenticated via the callback
  const redirectUrl = next;

  return (
    <ShopkeeperSignupForm onSuccess={() => router.push(redirectUrl)} />
  );
}

export default function ShopkeeperSignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ShopkeeperSignupContent />
    </Suspense>
  );
}
