"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Mail, Lock, Loader2, Store } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";

interface ShopkeeperLoginFormProps {
  onSuccess?: () => void;
}

export default function ShopkeeperLoginForm({
  onSuccess,
}: ShopkeeperLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {} = useToast();

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
          <h2 className="text-4xl font-bold mb-3">Welcome back, partner</h2>
          <p className="text-white/90 max-w-md">
            Sign in to manage orders, products, and your shop performance.
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
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-brand text-white shadow-lg shadow-primary-brand/30 mb-2">
              <Store className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Shopkeeper Sign In</h2>
            <p className="text-neutral-600 text-sm">
              Access your shop dashboard
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5 bg-white/95 dark:bg-[#11181d] rounded-3xl p-6 sm:p-7 border border-[#e5efe8] dark:border-[#1f2a33] shadow-xl backdrop-blur-sm"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                  className="w-full pl-12 pr-4 py-3 bg-[#f7faf9] border-2 border-[#dce8e1] rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand focus:bg-white transition-all duration-200"
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
                  className="w-full pl-12 pr-12 py-3 bg-[#f7faf9] border-2 border-[#dce8e1] rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand focus:bg-white transition-all duration-200"
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

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-primary-brand text-white py-3 rounded-xl font-semibold shadow-lg shadow-primary-brand/30 hover:bg-primary-hover transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-brand disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Signing
                  in...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>

            <div className="text-center text-sm">
              Don&apos;t have a shop account?{" "}
              <Link
                href="/shopkeeper/signup"
                className="text-secondary-brand hover:text-[#f97316] font-semibold"
              >
                Create one
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
