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
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  initialError?: string;
  role?: string;
}

export default function LoginForm({
  onSuccess,
  onSwitchToSignup,
  initialError,
  role = "customer",
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError || "");
  const { error: errorToast, info, success } = useToast();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const syncUser = useMutation(api.users.syncUserWithSupabase);

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
        throw new Error("Please enter a valid email address");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      
      const { data, error } = await withRetry(() =>
        supabase.auth.signInWithPassword({ email, password })
      );

      if (error) throw error;

      if (data?.user) {
        try {
          await syncUser({
            supabaseUserId: data.user.id,
            name: data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              email.split("@")[0],
            email: data.user.email!,
            phone: data.user.user_metadata?.phone,
            avatar_url: data.user.user_metadata?.avatar_url,
            provider: data.user.app_metadata?.provider || "email",
            role: data.user.user_metadata?.role || "customer",
          });
        } catch (syncError) {
          console.error("Failed to sync user:", syncError);
        }
        success("Welcome back! Redirecting...");
        setTimeout(() => onSuccess?.(), 500);
      } else {
        throw new Error("Login failed. Please try again.");
      }
    } catch (err: any) {
      const message = err.message || "An unexpected error occurred.";
      setError(message);
      errorToast(message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      const msg = "Please enter your email address first";
      setError(msg);
      errorToast(msg);
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
        info("Password reset link sent! Check your email.");
      }
    } catch {
      setError("Failed to send reset email");
      errorToast("Failed to send reset email");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const nextUrl = next || "/";
      const redirectTo = `${getEmailRedirectUrl()}?next=${encodeURIComponent(nextUrl)}&role=customer`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) errorToast(error.message);
    } catch (err) {
      console.error("Google login error:", err);
      errorToast("Failed to initiate Google login");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden bg-background">
      {/* Visual Side */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex relative flex-col justify-between p-16 overflow-hidden bg-[#0A0A0A] text-white"
      >
        {/* Abstract Background with Gradient Mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[100px]" />
          <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[80px]" />
          
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-white/20 to-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">MohallaMart</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl font-bold leading-tight tracking-tight"
          >
            Welcome back to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 animate-gradient-x">
              smarter shopping.
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg text-white/60 leading-relaxed"
          >
            Experience the future of local commerce. Fresh groceries, 
            lightning-fast delivery, and premium quality - all in one place.
          </motion.p>
          
          {/* Feature List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex gap-6 pt-4"
          >
            {[
              { label: "10-20 Min Delivery", icon: "⚡" },
              { label: "Quality Guarantee", icon: "🛡️" },
              { label: "Best Prices", icon: "🏷️" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium text-white/80 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                <span>{feature.icon}</span>
                <span>{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 text-sm text-white/40 font-medium">
          © 2025 MohallaMart Technologies Inc.
        </div>
      </motion.div>

      {/* Login Form Side */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px]"
        >
          <div className="text-center mb-10">
            <div className="lg:hidden inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-primary mb-6">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">Sign In</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100 dark:border-red-900/50"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background border-transparent focus:border-primary/50 transition-all duration-200 rounded-2xl py-3 pl-12 pr-4 outline-none ring-2 ring-transparent focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/70"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background border-transparent focus:border-primary/50 transition-all duration-200 rounded-2xl py-3 pl-12 pr-12 outline-none ring-2 ring-transparent focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/70"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {role === "customer" && (
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/60"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-4 text-muted-foreground font-medium">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleGoogleLogin}
                  className="flex-1 h-12 bg-card hover:bg-secondary/80 border border-border hover:border-border/80 rounded-2xl flex items-center justify-center gap-2 transition-all font-medium text-sm text-foreground"
                >
                  <Globe className="h-4 w-4" />
                  Google
                </button>
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New here?{" "}
            <button
              onClick={onSwitchToSignup}
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Create an account
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
