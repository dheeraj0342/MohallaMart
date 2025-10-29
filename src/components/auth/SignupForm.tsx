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
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

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
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
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
      } else {
        setError("");
        // Show success message
        alert(
          "Success! Please check your email to confirm your account. Check your spam folder if you don't see it.",
        );
        onSuccess?.();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Gift,
      text: "20% off on first order",
      color: "text-secondary-brand",
    },
    {
      icon: Percent,
      text: "Exclusive member deals",
      color: "text-accent-brand",
    },
    {
      icon: ShoppingBag,
      text: "Free delivery above ₹199",
      color: "text-primary-brand",
    },
    { icon: Star, text: "Earn reward points", color: "text-accent-brand" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-accent-brand to-primary-brand p-12 text-white relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-8xl">🎉</div>
          <div className="absolute top-40 left-20 text-6xl">🎁</div>
          <div className="absolute bottom-20 right-20 text-7xl">🛍️</div>
          <div className="absolute bottom-40 left-10 text-6xl">✨</div>
          <div className="absolute top-1/2 left-1/2 text-5xl">🎊</div>
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full">
          {/* Logo */}
          <div>
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="text-5xl">🛒</div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Mohalla<span className="text-white">Mart</span>
                  </h1>
                  <p className="text-sm opacity-90">
                    Start saving on groceries today
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4">Join MohallaMart!</h2>
              <p className="text-lg opacity-90">
                Create an account and get access to exclusive deals and offers.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <div className="bg-white/20 p-3 rounded-lg">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{benefit.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social proof */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-300">
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
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm opacity-75">
            © 2025 MohallaMart. All rights reserved.
          </div>
        </div>
      </motion.div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md my-8"
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
                Start saving on groceries today
              </p>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                Create Account
              </h2>
              <p className="text-neutral-600">
                Sign up to get started with exclusive offers
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
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
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    required
                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand focus:bg-white transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand focus:bg-white transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-neutral-700 mb-2"
                >
                  Phone Number{" "}
                  <span className="text-neutral-400 font-normal">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand focus:bg-white transition-all duration-200"
                    placeholder="+91 98765 43210"
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
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                    className="w-full pl-12 pr-12 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand focus:bg-white transition-all duration-200"
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
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    required
                    className="w-full pl-12 pr-12 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand focus:bg-white transition-all duration-200"
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

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="h-4 w-4 mt-1 text-primary-brand focus:ring-primary-brand border-neutral-300 rounded"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 text-sm text-neutral-700"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-primary-brand hover:text-primary-hover font-medium"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-primary-brand hover:text-primary-hover font-medium"
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
                className="w-full bg-primary-brand text-white py-4 rounded-xl font-semibold hover:bg-primary-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl text-base"
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
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-neutral-600">
                Already have an account?{" "}
              </span>
              <button
                onClick={onSwitchToLogin}
                className="text-primary-brand hover:text-primary-hover font-semibold"
              >
                Sign In
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500">
                  Or sign up with
                </span>
              </div>
            </div>

            {/* Social Signup */}
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
