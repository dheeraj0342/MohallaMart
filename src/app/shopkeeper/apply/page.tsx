"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Store, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ShopkeeperApplyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();
  const requestRole = useMutation(api.users.requestShopkeeperRole);
  const [submitting, setSubmitting] = useState(false);

  // Check if registration is complete
  const registration = useQuery(
    api.registrations.getMyRegistration,
    user ? { userId: user.id } : "skip"
  ) as { status?: string } | null | undefined;

  // Redirect to registration if not complete
  useEffect(() => {
    if (user && registration !== undefined) {
      // If no registration exists or status is "draft", redirect to registration
      if (!registration || registration.status === "draft") {
        router.replace("/shopkeeper/registration");
      }
      // If registration is already submitted/reviewing/approved, they can apply
    }
  }, [user, registration, router]);

  const apply = async () => {
    if (submitting) return;
    if (!user) {
      router.push("/shopkeeper/login?next=/shopkeeper/registration");
      return;
    }

    // Check if registration is complete
    if (!registration || registration.status === "draft") {
      error("Please complete your registration first before applying.");
      router.push("/shopkeeper/registration");
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
      } catch { }
      success("Application submitted successfully! Your application is now under admin review.");
      // After applying, show status page (registration page shows status)
      setTimeout(() => {
        router.replace("/shopkeeper/registration");
      }, 2000);
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
                  Submit your application for admin review. Access is enabled after approval.
                </p>
              </div>

              {/* Show warning if registration not complete */}
              {registration === undefined ? (
                <div className="mb-6">
                  <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            Registration Required
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Please complete your registration first before applying.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : !registration || registration.status === "draft" ? (
                <div className="mb-6">
                  <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            Complete Registration First
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 mb-3">
                            You need to complete and submit your registration before applying.
                          </p>
                          <Button
                            onClick={() => router.push("/shopkeeper/registration")}
                            variant="outline"
                            size="sm"
                            className="w-full border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                          >
                            Go to Registration
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-6 text-sm text-[#44525f] dark:text-[#cbd5f5] mb-8">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-none flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                          ✓
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <h3 className="font-semibold text-foreground text-base">Registration Complete</h3>
                        <p className="text-muted-foreground mt-1">Your business details have been submitted.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-none flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-brand text-white flex items-center justify-center font-bold text-sm">2</div>
                        <div className="w-0.5 h-full bg-border mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <h3 className="font-semibold text-foreground text-base">Submit Application</h3>
                        <p className="text-muted-foreground mt-1">Submit your application for admin review.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-none flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground border-2 border-border flex items-center justify-center font-bold text-sm">3</div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-base">Get Verified & Sell</h3>
                        <p className="text-muted-foreground mt-1">Once approved, setup your shop and start receiving orders.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={apply}
                disabled={submitting || !registration || registration.status === "draft"}
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
                <Link href="/shopkeeper/login?next=/shopkeeper/registration">
                  <button className="w-full px-4 py-3 rounded-xl font-semibold border-2 border-primary-brand text-primary-brand hover:bg-primary-brand hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-brand">
                    Sign In
                  </button>
                </Link>
                <Link href="/shopkeeper/signup?next=/shopkeeper/registration">
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
