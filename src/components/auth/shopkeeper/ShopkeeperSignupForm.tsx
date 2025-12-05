"use client";

import { useState } from "react";
import { supabase, getEmailRedirectUrl } from "@/lib/supabase";
import { withRetry } from "@/lib/retry";
import { Eye, EyeOff, Mail, Lock, Loader2, User, Store } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

interface ShopkeeperSignupFormProps {
  onSuccess?: () => void;
}

export default function ShopkeeperSignupForm({
  onSuccess,
}: ShopkeeperSignupFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { success, error: errorToast } = useToast();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const syncUser = useMutation(api.users.syncUserWithSupabase);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      const nextUrl = next || "/shopkeeper/apply";
      // Include role in the redirect URL so callback can redirect correctly
      const emailRedirectTo = `${getEmailRedirectUrl()}?next=${encodeURIComponent(nextUrl)}&role=shop_owner`;
      
      const { data, error } = await withRetry(() =>
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo,
            data: {
              full_name: fullName,
              role: "shop_owner", // Set role in user metadata
            },
          },
        })
      );

      if (error) {
        setError(error.message);
        errorToast(error.message);
      } else if (data?.user) {
        // Sync user to Convex with shop_owner role
        try {
          await syncUser({
            supabaseUserId: data.user.id,
            name: fullName || email.split("@")[0],
            email: email,
            phone: data.user.user_metadata?.phone,
            avatar_url: data.user.user_metadata?.avatar_url,
            role: "shop_owner", // Explicitly set role
          });
        } catch (syncError) {
          console.error("Failed to sync user:", syncError);
          // Continue anyway - sync can happen later
        }

        // If email confirmation is required, show message
        if (data.user.email_confirmed_at) {
          success("Account created successfully! Redirecting...");
          // Small delay to ensure state is updated
          setTimeout(() => {
            onSuccess?.();
          }, 500);
        } else {
          success("Account created! Please check your email to confirm your account. After confirmation, you'll be redirected to apply.");
          // Still redirect to apply page - they can apply after email confirmation
          setTimeout(() => {
            onSuccess?.();
          }, 2000);
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Left - Branding */}
      <div className="hidden md:flex flex-col justify-between p-12 text-primary-foreground bg-primary">
        <div>
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-2xl font-semibold">MohallaMart</span>
          </Link>
        </div>
        <div>
          <h2 className="text-4xl font-bold mb-3">Grow with MohallaMart</h2>
          <p className="text-white/90 max-w-md">
            Create your shop account and request admin approval to start
            selling.
          </p>
        </div>
        <div className="text-sm text-white/80">© 2025 MohallaMart</div>
      </div>

      {/* Right - Form */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8 md:hidden">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-brand text-white shadow-lg shadow-primary-brand/30 mb-3">
              <Store className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Create Shopkeeper Account</h2>
            <p className="text-neutral-600 text-sm">
              Sign up and then apply for admin approval
            </p>
          </div>

          <form
            onSubmit={handleSignup}
            className="space-y-4 bg-card rounded-3xl p-6 sm:p-7 border border-border shadow-xl"
            aria-busy={loading}
            noValidate
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm" aria-live="assertive">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-muted border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  autoComplete="name"
                  placeholder="Shop owner name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-muted border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  autoComplete="email"
                  placeholder="you@shop.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-muted border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-primary-brand transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-muted border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-primary-brand transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold shadow-lg hover:bg-primary/90 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" aria-hidden="true" /> Creating
                  account...
                </span>
              ) : (
                "Create Account"
              )}
            </motion.button>

            <div className="text-center text-sm">
              Already a shopkeeper?{" "}
              <Link
                href="/shopkeeper/login"
                className="text-secondary-brand hover:text-[#f97316] font-semibold"
              >
                Sign In
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
