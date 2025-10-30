"use client";

import { useState } from "react";
import { supabase, getEmailRedirectUrl } from "@/lib/supabase";
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
  const { error: errorToast, info } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // Immediately redirect without waiting
        onSuccess?.();
        // Don't set loading to false here - let redirect happen
      }
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getEmailRedirectUrl()}?next=/auth/reset-password`,
      });

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
    { icon: Clock, text: "10-minute delivery" },
    { icon: Shield, text: "100% genuine products" },
    { icon: Truck, text: "Free delivery above ₹199" },
    { icon: ShoppingBag, text: "5000+ products" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary-brand to-accent-brand p-12 text-white relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🥬</div>
          <div className="absolute top-40 right-20 text-6xl">🍎</div>
          <div className="absolute bottom-20 left-20 text-7xl">🥛</div>
          <div className="absolute bottom-40 right-10 text-6xl">🍞</div>
          <div className="absolute top-1/2 left-1/3 text-5xl">🥕</div>
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full">
          {/* Logo */}
          <div>
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="text-5xl">🛒</div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Mohalla<span className="text-accent-brand">Mart</span>
                  </h1>
                  <p className="text-sm opacity-90">
                    Fresh groceries at your doorstep
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4">Welcome back!</h2>
              <p className="text-lg opacity-90">
                Sign in to continue shopping for fresh groceries and daily
                essentials.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <feature.icon className="w-8 h-8 mb-2" />
                  <p className="text-sm font-medium">{feature.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-6 text-sm opacity-75">
              <div>⭐⭐⭐⭐⭐</div>
              <div>10K+ Happy Customers</div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm opacity-75">
            © 2025 MohallaMart. All rights reserved.
          </div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <div className="flex items-center justify-center space-x-2 cursor-pointer mb-2">
                <div className="text-4xl">🛒</div>
                <h1 className="text-2xl font-bold text-primary-brand">
                  Mohalla<span className="text-secondary-brand">Mart</span>
                </h1>
              </div>
              <p className="text-sm text-neutral-600">
                Fresh groceries at your doorstep
              </p>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                Sign In
              </h2>
              <p className="text-neutral-600">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-error-bg border border-error-border text-error-text px-4 py-3 rounded-xl text-sm flex items-start space-x-2"
                >
                  <span className="text-lg">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-neutral-700 mb-2"
                >
                  Email Address
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
                    className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand focus:bg-white transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-neutral-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-primary-brand hover:text-primary-hover font-medium"
                  >
                    Forgot?
                  </button>
                </div>
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
                    className="w-full pl-12 pr-12 py-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand focus:bg-white transition-all duration-200"
                    placeholder="Enter your password"
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-primary-brand focus:ring-primary-brand border-neutral-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-neutral-700"
                >
                  Remember me for 30 days
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full bg-primary-brand text-white py-4 rounded-xl font-semibold hover:bg-primary-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-neutral-600">
                Don&apos;t have an account?{" "}
              </span>
              <button
                onClick={onSwitchToSignup}
                className="text-primary-brand hover:text-primary-hover font-semibold"
              >
                Create Account
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled
                className="relative flex items-center justify-center space-x-2 px-4 py-3 border-2 border-neutral-200 rounded-xl bg-neutral-50 cursor-not-allowed opacity-60"
              >
                <span className="text-xl">🔍</span>
                <span className="text-sm font-medium text-neutral-700">
                  Google
                </span>
                <span className="absolute -top-2 -right-2 bg-accent-brand text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </button>
              <button
                disabled
                className="relative flex items-center justify-center space-x-2 px-4 py-3 border-2 border-neutral-200 rounded-xl bg-neutral-50 cursor-not-allowed opacity-60"
              >
                <span className="text-xl">📱</span>
                <span className="text-sm font-medium text-neutral-700">
                  Phone
                </span>
                <span className="absolute -top-2 -right-2 bg-accent-brand text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
