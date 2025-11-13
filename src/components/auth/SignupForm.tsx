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
  Percent,
  Gift,
  Star,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: getEmailRedirectUrl(),
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      });

      if (error) {
        setError(error.message);
        errorToast(error.message);
        setLoading(false);
      } else {
        setError("");
        success("Account created! Please check your email to confirm your account.");
        onSuccess?.();
      }
    } catch {
      setError("An unexpected error occurred");
      errorToast("An unexpected error occurred");
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Gift,
      text: "20% off on first order",
      color: "text-orange-500",
    },
    {
      icon: Percent,
      text: "Exclusive member deals",
      color: "text-yellow-500",
    },
    {
      icon: ShoppingBag,
      text: "Free delivery above ₹199",
      color: "text-green-500",
    },
    { icon: Star, text: "Earn reward points", color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 p-12 text-white relative overflow-hidden"
      >

     
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
                    Mohalla<span className="text-white">Mart</span>
                  </h1>
                  <p className="text-sm opacity-90 mt-1">
                    Start saving on groceries today
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
                <Sparkles className="h-6 w-6 text-white" />
                <h2 className="text-5xl font-bold">Join MohallaMart!</h2>
              </div>
              <p className="text-lg opacity-90 leading-relaxed">
                Create an account and get access to exclusive deals and offers.
              </p>
            </motion.div>

            {/* Benefits */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="bg-white/20 p-3 rounded-lg">
                    <benefit.icon className={cn("w-6 h-6", benefit.color)} />
                  </div>
                  <div>
                    <p className="font-semibold">{benefit.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-300 text-lg">
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="font-semibold">4.8/5</span>
              </div>
              <p className="text-sm opacity-90">
                &quot;Best grocery delivery service! Fresh products and fast
                delivery.&quot;
              </p>
              <p className="text-xs mt-2 opacity-75">
                - 10,000+ verified customers
              </p>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-sm opacity-75">
            © 2025 MohallaMart. All rights reserved.
          </div>
        </div>
      </motion.div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 overflow-y-auto">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md my-8"
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
                Start saving on groceries today
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
                Create Account
              </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                Sign up to get started with exclusive offers
              </p>
              </motion.div>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              {error && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex items-start gap-3"
                >
                  <span className="text-lg flex-shrink-0">⚠️</span>
                  <span className="flex-1">{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-neutral-400" />
                  </div>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    required
                    className="pl-12 h-12 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="pl-12 h-12 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Phone Number{" "}
                  <span className="text-neutral-400 dark:text-neutral-500 font-normal text-xs">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-neutral-400" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-12 h-12 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                    className="pl-12 pr-12 h-12 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                    placeholder="Minimum 6 characters"
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

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    required
                    className="pl-12 pr-12 h-12 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
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
                  className="h-4 w-4 mt-1 text-green-600 focus:ring-green-500 border-neutral-300 dark:border-neutral-600 rounded cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
                  >
                    Privacy Policy
                  </button>
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
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Gift className="h-5 w-5 mr-2" />
                    Create Account & Get 20% Off
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-neutral-600 dark:text-neutral-400 text-sm">
                Already have an account?{" "}
              </span>
              <button
                onClick={onSwitchToLogin}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold text-sm transition-colors"
              >
                Sign In
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
                  Or sign up with
                </span>
              </div>
            </div>

            {/* Social Signup */}
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
