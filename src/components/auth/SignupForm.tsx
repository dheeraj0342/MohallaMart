"use client";

import { useState } from "react";
import { supabase, getEmailRedirectUrl } from "@/lib/supabase";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  ShoppingBag,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { withRetry } from "@/lib/retry";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function SignupForm({
  onSuccess,
  onSwitchToLogin,
}: SignupFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { success, error: errorToast } = useToast();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const syncUser = useMutation(api.users.syncUserWithSupabase);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      errorToast("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      errorToast("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      errorToast("Please agree to the Terms of Service and Privacy Policy");
      setLoading(false);
      return;
    }

    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        const m = "Please enter a valid email address";
        setError(m);
        errorToast(m);
        setLoading(false);
        return;
      }
      const { data, error } = await withRetry(() =>
        supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${getEmailRedirectUrl()}${next ? `?next=${encodeURIComponent(next)}` : ""}`,
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              role: "customer", // Set role in user metadata
            },
          },
        })
      );

      if (error) {
        setError(error.message);
        errorToast(error.message);
        setLoading(false);
      } else if (data?.user) {
        // Sync user to Convex with customer role
        try {
          await syncUser({
            supabaseUserId: data.user.id,
            name: formData.fullName || formData.email.split("@")[0],
            email: formData.email,
            phone: formData.phone || undefined,
            avatar_url: data.user.user_metadata?.avatar_url,
            role: "customer", // Explicitly set role
          });
        } catch (syncError) {
          console.error("Failed to sync user:", syncError);
          // Continue anyway - sync can happen later
        }

        // If email confirmation is required, show message
        if (data.user.email_confirmed_at) {
          success("Account created successfully! Redirecting...");
          setTimeout(() => {
            onSuccess?.();
          }, 500);
        } else {
          setError("");
          success("Account created! Please check your email to confirm your account.");
          // Still redirect - they can use the app after email confirmation
          setTimeout(() => {
            onSuccess?.();
          }, 2000);
        }
      }
    } catch {
      setError("An unexpected error occurred");
      errorToast("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const nextUrl = next || "/";
      // Include role in the redirect URL so callback can set it
      const redirectTo = `${getEmailRedirectUrl()}?next=${encodeURIComponent(nextUrl)}&role=customer`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (error) {
        errorToast(error.message);
      }
    } catch (err) {
      console.error("Google login error:", err);
      errorToast("Failed to initiate Google login");
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Left - Branding */}
      <div className="hidden md:flex flex-col justify-between p-12 text-primary-foreground bg-primary">
        <div>
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-2xl font-semibold">MohallaMart</span>
          </Link>
        </div>
        <div>
          <h2 className="text-4xl font-bold mb-3">Join MohallaMart!</h2>
          <p className="text-white/90 max-w-md">
            Create an account and get access to exclusive deals, offers, and faster checkout.
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
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white shadow-lg shadow-primary/30 mb-3">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
            <p className="text-muted-foreground text-sm">
              Sign up to get started with exclusive offers
            </p>
          </div>

          <form
            onSubmit={handleSignup}
            className="space-y-4 bg-card rounded-3xl p-6 sm:p-7 border border-border shadow-xl"
            aria-busy={loading}
            noValidate
          >
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm" aria-live="assertive">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  required
                  className="w-full pl-12 pr-4 py-3 bg-muted border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  autoComplete="name"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-muted border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Phone Number{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (Optional)
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                  className="w-full pl-12 pr-12 py-3 bg-muted border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary transition-colors"
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
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  required
                  className="w-full pl-12 pr-12 py-3 bg-muted border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 mt-1 text-primary focus:ring-primary border-border rounded cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-sm text-foreground cursor-pointer"
              >
                I agree to the{" "}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Privacy Policy
                </button>
              </label>
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

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Sign In
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">
                  Or sign up with
                </span>
              </div>
            </div>

            {/* Social Signup */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="relative h-12 border-2 border-border rounded-xl bg-card hover:bg-muted text-foreground flex items-center justify-center gap-2 font-medium text-sm transition-all"
              >
                <Globe className="h-5 w-5" />
                <span>Google</span>
              </button>
              <button
                type="button"
                disabled
                className="relative h-12 border-2 border-border rounded-xl bg-muted text-foreground cursor-not-allowed opacity-60 flex items-center justify-center gap-2 font-medium text-sm transition-all"
              >
                <Phone className="h-5 w-5" />
                <span>Phone</span>
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
