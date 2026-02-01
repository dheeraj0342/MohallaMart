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
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { withRetry } from "@/lib/retry";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  initialError?: string;
  role?: string;
}

export default function SignupForm({
  onSuccess,
  onSwitchToLogin,
  initialError,
  role = "customer",
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
  const [error, setError] = useState(initialError || "");
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

    if (formData.password !== formData.confirmPassword) {
      const m = "Passwords do not match";
      setError(m);
      errorToast(m);
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      const m = "Password must be at least 6 characters";
      setError(m);
      errorToast(m);
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      const m = "Please agree to the Terms of Service & Privacy Policy";
      setError(m);
      errorToast(m);
      setLoading(false);
      return;
    }

    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error("Please enter a valid email address");
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
              role: "customer",
            },
          },
        })
      );

      if (error) throw error;

      if (data?.user) {
        try {
          await syncUser({
            supabaseUserId: data.user.id,
            name: formData.fullName || formData.email.split("@")[0],
            email: formData.email,
            phone: formData.phone || undefined,
            avatar_url: data.user.user_metadata?.avatar_url,
            role: "customer",
          });
        } catch (syncError) {
          console.error("Failed to sync user:", syncError);
        }

        if (data.user.email_confirmed_at) {
          success("Account created successfully! Redirecting...");
          setTimeout(() => onSuccess?.(), 500);
        } else {
          setError("");
          success("Account created! Verifying...");
          setTimeout(() => onSuccess?.(), 1500);
        }
      }
    } catch (err: any) {
      const message = err.message || "An unexpected error occurred";
      setError(message);
      errorToast(message);
      setLoading(false);
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
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-emerald-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-teal-600/10 blur-[100px]" />
          
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-medium text-emerald-300"
          >
            <Sparkles className="h-4 w-4" />
            <span>Join thousands of happy shoppers</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl font-bold leading-tight tracking-tight"
          >
            Start your journey <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-emerald-300 animate-gradient-x">
              with premium benefits.
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-white/60 leading-relaxed"
          >
            Create an account to unlock exclusive deals, track your orders 
            in real-time, and get personalized recommendations.
          </motion.p>
        </div>

        <div className="relative z-10 text-sm text-white/40 font-medium">
          © 2025 MohallaMart Technologies Inc.
        </div>
      </motion.div>

      {/* Signup Form Side */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-background overflow-y-auto max-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[480px] my-auto"
        >
          <div className="text-center mb-8">
            <div className="lg:hidden inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-primary mb-6">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">Create Account</h1>
            <p className="text-muted-foreground">
              Sign up to get started ensuring fresh deliveries
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4" noValidate>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-foreground ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background border-transparent focus:border-primary/50 transition-all duration-200 rounded-2xl py-3 pl-12 pr-4 outline-none ring-2 ring-transparent focus:ring-primary/20 text-foreground"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-foreground ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background border-transparent focus:border-primary/50 transition-all duration-200 rounded-2xl py-3 pl-12 pr-4 outline-none ring-2 ring-transparent focus:ring-primary/20 text-foreground"
                    placeholder="you@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-foreground ml-1">Phone <span className="text-muted-foreground font-normal text-xs">(Optional)</span></label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background border-transparent focus:border-primary/50 transition-all duration-200 rounded-2xl py-3 pl-12 pr-4 outline-none ring-2 ring-transparent focus:ring-primary/20 text-foreground"
                    placeholder="+91 98765..."
                  />
                </div>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-foreground ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background border-transparent focus:border-primary/50 transition-all duration-200 rounded-2xl py-3 pl-12 pr-12 outline-none ring-2 ring-transparent focus:ring-primary/20 text-foreground"
                    placeholder="••••••"
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

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-foreground ml-1">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background border-transparent focus:border-primary/50 transition-all duration-200 rounded-2xl py-3 pl-12 pr-12 outline-none ring-2 ring-transparent focus:ring-primary/20 text-foreground"
                    placeholder="••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 px-1">
              <div className="relative flex items-center pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-5 w-5 text-primary focus:ring-primary border-2 border-muted-foreground/30 rounded cursor-pointer transition-all"
                />
              </div>
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer select-none">
                I agree to the <span className="text-foreground font-medium hover:underline">Terms of Service</span> and <span className="text-foreground font-medium hover:underline">Privacy Policy</span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>

            {role === "customer" && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground font-medium">Or sign up with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full h-12 bg-card hover:bg-secondary/80 border border-border hover:border-border/80 rounded-2xl flex items-center justify-center gap-2 transition-all font-medium text-sm text-foreground"
                  >
                    <Globe className="h-4 w-4" />
                    Google
                  </button>
                </div>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Sign In
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
