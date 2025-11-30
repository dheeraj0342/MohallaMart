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
  Truck,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  const [rememberMe, setRememberMe] = useState(false);
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
        onSuccess?.();
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

  const features = [
    { icon: Clock, text: "10-minute delivery", color: "text-blue-500" },
    { icon: Shield, text: "100% genuine products", color: "text-green-500" },
    { icon: Truck, text: "Free delivery above ₹199", color: "text-orange-500" },
    { icon: ShoppingBag, text: "5000+ products", color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-500 to-green-400 p-12 text-white relative overflow-hidden"
      >

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-600/50 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between w-full h-full">
          {/* Logo */}
          <div>
            <Link href="/" className="group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <div className="text-5xl group-hover:rotate-12 transition-transform duration-300">
                  🛒
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Mohalla<span className="text-yellow-300">Mart</span>
                  </h1>
                  <p className="text-sm opacity-90 mt-1">
                    Fresh groceries at your doorstep
                  </p>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Main content */}
          <div className="space-y-8 my-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-yellow-300" />
                <h2 className="text-5xl font-bold">Welcome back!</h2>
              </div>
              <p className="text-lg opacity-90 leading-relaxed">
                Sign in to continue shopping for fresh groceries and daily
                essentials.
              </p>
            </motion.div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <feature.icon className={cn("w-8 h-8 mb-3", feature.color)} />
                  <p className="text-sm font-semibold">{feature.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-6 text-sm"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-300 text-lg">
                    ⭐
                  </span>
                ))}
            </div>
              <div className="opacity-90 font-medium">10K+ Happy Customers</div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-sm opacity-75">
            © 2025 MohallaMart. All rights reserved.
          </div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center space-x-2 cursor-pointer mb-2"
              >
                <div className="text-4xl group-hover:rotate-12 transition-transform duration-300">
                  🛒
                </div>
                <h1 className="text-2xl font-bold text-green-600 dark:text-green-500">
                  Mohalla<span className="text-yellow-500">Mart</span>
                </h1>
              </motion.div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Fresh groceries at your doorstep
              </p>
            </Link>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-800">
            <div className="mb-8">
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Sign In
              </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                Enter your credentials to access your account
              </p>
              </motion.div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6" aria-busy={loading} noValidate>
              {error && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex items-start gap-3"
                  aria-live="assertive"
                >
                  <span className="text-lg flex-shrink-0">⚠️</span>
                  <span className="flex-1">{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-12 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                    autoComplete="email"
                    aria-invalid={!!error && !password}
                    aria-describedby={error ? "login-error" : undefined}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 h-12 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                    autoComplete={rememberMe ? "current-password" : "off"}
                    aria-invalid={!!error && !!password}
                    aria-describedby={error ? "login-error" : undefined}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-neutral-300 dark:border-neutral-600 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" aria-hidden="true" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-neutral-600 dark:text-neutral-400 text-sm">
                Don&apos;t have an account?{" "}
              </span>
              <button
                onClick={onSwitchToSignup}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold text-sm transition-colors"
              >
                Create Account
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled
                className="relative h-12 border-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 cursor-not-allowed opacity-60"
              >
                <span className="text-xl mr-2">🔍</span>
                <span className="text-sm font-medium">Google</span>
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled
                className="relative h-12 border-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 cursor-not-allowed opacity-60"
              >
                <span className="text-xl mr-2">📱</span>
                <span className="text-sm font-medium">Phone</span>
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
