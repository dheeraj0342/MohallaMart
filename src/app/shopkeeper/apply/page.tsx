"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Store } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";

export default function ShopkeeperApplyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();
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
      success("Application submitted! Complete your seller registration next.");
      router.replace("/shopkeeper/registration");
    } catch {
      error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-linear-to-br from-[#f5fbf7] via-[#ffffff] to-[#f0f9f3] dark:from-[#0d1215] dark:via-[#11181d] dark:to-[#1b242b]">
      {/* Left - Branding */}
      <div className="hidden md:flex flex-col justify-between p-12 text-white bg-linear-to-br from-primary-brand via-[#1f8f4e] to-secondary-brand">
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
          <p className="text-white/90 max-w-md leading-relaxed">
            Apply to open your shop on MohallaMart. Once approved, you can start
            receiving orders from nearby customers.
          </p>
        </div>
        <div className="text-sm text-white/80">©️ 2025 MohallaMart</div>
      </div>

      {/* Right - Apply Card */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md bg-white/95 dark:bg-[#11181d] backdrop-blur-sm rounded-3xl shadow-xl p-7 border border-[#e5efe8] dark:border-[#1f2a33]">
          {user ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#1f2a33] dark:text-[#f3f6fb] mb-1">
                  Apply as Shopkeeper
                </h1>
                <p className="text-sm text-[#667085] dark:text-[#9aa6b2]">
                  Submit your application. Access is enabled after admin
                  approval.
                </p>
              </div>
              <div className="space-y-4 text-sm text-[#44525f] dark:text-[#cbd5f5] mb-6">
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
                className="w-full px-4 py-3 rounded-xl font-semibold bg-primary-brand text-white shadow-lg shadow-primary-brand/20 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-brand disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#1f2a33] dark:text-[#f3f6fb] mb-1">
                  Apply as Shopkeeper
                </h1>
                <p className="text-sm text-[#667085] dark:text-[#9aa6b2]">
                  Please sign in or create a shopkeeper account to apply.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/shopkeeper/login">
                  <button className="w-full px-4 py-3 rounded-xl font-semibold border-2 border-primary-brand text-primary-brand hover:bg-primary-brand hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-brand">
                    Sign In
                  </button>
                </Link>
                <Link href="/shopkeeper/signup">
                  <button className="w-full px-4 py-3 rounded-xl font-semibold bg-secondary-brand text-white shadow-lg shadow-secondary-brand/25 hover:bg-[#f97316] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-brand">
                    Create Account
                  </button>
                </Link>
              </div>
            </>
          )}

          <div className="mt-6 text-center text-sm">
            <Link
              href="/"
              className="text-secondary-brand hover:text-[#f97316] font-semibold"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}