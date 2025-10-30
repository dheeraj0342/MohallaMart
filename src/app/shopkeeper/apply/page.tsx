"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Store } from "lucide-react";
import Link from "next/link";

export default function ShopkeeperApplyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const requestRole = useMutation(api.users.requestShopkeeperRole);
  const [submitting, setSubmitting] = useState(false);

  const apply = async () => {
    if (submitting) return;
    if (!user) {
      router.push("/shopkeeper/login");
      return;
    }
    setSubmitting(true);
    try {
      const activeUser = user;
      await requestRole({ id: activeUser.id });
      try {
        await fetch("/api/shopkeeper/applied", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: activeUser.id,
            email: (activeUser as { email?: string }).email,
            name:
              (activeUser as { user_metadata?: { full_name?: string; name?: string } }).user_metadata?.full_name ||
              (activeUser as { user_metadata?: { full_name?: string; name?: string } }).user_metadata?.name,
          }),
        });
      } catch {}
      alert("Application submitted! Complete your seller registration next.");
      router.replace("/shopkeeper/registration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left - Branding */}
      <div className="hidden md:flex flex-col justify-between p-12 text-white bg-linear-to-br from-primary-brand to-secondary-brand">
        <div>
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-2xl font-semibold">MohallaMart</span>
          </Link>
        </div>
        <div>
          <h2 className="text-4xl font-bold mb-3">Become a partner</h2>
          <p className="text-white/90 max-w-md">
            Apply to open your shop on MohallaMart. Once approved, you can start
            receiving orders from nearby customers.
          </p>
        </div>
        <div className="text-sm text-white/80">©️ 2025 MohallaMart</div>
      </div>

      {/* Right - Apply Card */}
      <div className="flex items-center justify-center p-8 bg-neutral-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 border border-neutral-100">
          {user ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">Apply as Shopkeeper</h1>
                <p className="text-sm text-neutral-600">
                  Submit your application. Access is enabled after admin
                  approval.
                </p>
              </div>
              <div className="space-y-4 text-sm text-neutral-700 mb-6">
                <div className="flex items-start space-x-2">
                  <span className="mt-0.5">✅</span>
                  <span>
                    We will verify your account and enable access when approved.
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="mt-0.5">🚚</span>
                  <span>
                    Once approved, manage products, orders, and deliveries in
                    your dashboard.
                  </span>
                </div>
              </div>
              <button
                onClick={apply}
                disabled={submitting}
                className="w-full px-4 py-3 rounded-xl font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">Apply as Shopkeeper</h1>
                <p className="text-sm text-neutral-600">
                  Please sign in or create a shopkeeper account to apply.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/shopkeeper/login">
                  <button className="w-full px-4 py-3 rounded-xl font-semibold border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/shopkeeper/signup">
                  <button className="w-full px-4 py-3 rounded-xl font-semibold bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-hover)] transition-colors">
                    Create Account
                  </button>
                </Link>
              </div>
            </>
          )}

          <div className="mt-6 text-center text-sm">
            <Link
              href="/"
              className="text-[var(--color-secondary)] hover:text-[var(--color-secondary-hover)] font-semibold"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}