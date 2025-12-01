"use client";

import { useState, useEffect } from "react";
import { supabase, getEmailRedirectUrl, validateSupabaseConfig } from "@/lib/supabase";
import { withRetry } from "@/lib/retry";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ShoppingBag,
  Phone,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export default function LoginForm({
  onSuccess,
  onSwitchToSignup,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { error: errorToast, info, success } = useToast();

  // Validate Supabase configuration on mount
  useEffect(() => {
    const config = validateSupabaseConfig();
    if (!config.valid && config.error) {
      setError(config.error);
      errorToast(config.error);
    }
  }, [errorToast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const m = "Please enter a valid email address";
        setError(m);
        errorToast(m);
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        const m = "Password must be at least 6 characters";
        setError(m);
        errorToast(m);
        setLoading(false);
        return;
      }
      const { data, error } = await withRetry(() =>
        supabase.auth.signInWithPassword({ email, password })
      );

      if (error) {
        setError(error.message);
        errorToast(error.message);
        setLoading(false);
      } else if (data?.user) {
        success("Welcome back! Redirecting...");
        // Role-based redirect will happen in useAuth hook
        // Small delay to ensure user is synced
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      } else {
        setError("Login failed. Please try again.");
        errorToast("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError") ||
            err.message.includes("fetch")
            ? "Unable to connect to the server. Please check your internet connection and ensure Supabase is properly configured."
            : err.message
          : "An unexpected error occurred. Please try again.";

      setError(errorMessage);
      errorToast(errorMessage);
      setLoading(false);
      console.error("Login error:", err);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      errorToast("Please enter your email address first");
      return;
    }

    try {
      const { error } = await withRetry(() =>
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${getEmailRedirectUrl()}?next=/auth/reset-password`,
        })
      );

      if (error) {
        setError(error.message);
        errorToast(error.message);
      } else {
        setError("");
        info("Password reset link sent! Please check your email.");
      }
    } catch {
      setError("Failed to send reset email");
      errorToast("Failed to send reset email");
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
          <h2 className="text-4xl font-bold mb-3">Welcome back!</h2>
          <p className="text-white/90 max-w-md">
            Sign in to continue shopping for fresh groceries and daily essentials.
          </p>
        </div>
        <div className="text-sm text-white/80">© 2025 MohallaMart</div>
      </div>

      {/* Right - Form */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8 md:hidden">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white shadow-lg shadow-primary/30 mb-2">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Sign In</h2>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to access your account
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5 bg-card rounded-3xl p-6 sm:p-7 border border-border shadow-xl"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-muted border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-foreground"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-muted border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  autoComplete="current-password"
                  placeholder="Enter your password"
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

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold shadow-lg hover:bg-primary/90 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" aria-hidden="true" /> Signing
                  in...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Create one
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled
                className="relative h-12 border-2 border-border rounded-xl bg-muted text-foreground cursor-not-allowed opacity-60 flex items-center justify-center gap-2 font-medium text-sm transition-all"
              >
                <Globe className="h-5 w-5" />
                <span>Google</span>
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Soon
                </span>
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
