"use client";

import React, { useState, useEffect, Component, ReactNode, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

class AuthErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">Please refresh the page or try again later.</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function AuthPageContent() {
  const search = useSearchParams();
  const initialMode = (search?.get("mode") || "login").toLowerCase();
  const next = search?.get("next") || "/";
  const [isLogin, setIsLogin] = useState(initialMode !== "signup");
  const router = useRouter();
  const { isLoggedIn } = useStore();
  const { dbUser } = useAuth();

  useEffect(() => {
    if (isLoggedIn() && dbUser !== undefined) {
      // Role-based redirect
      const userRole = dbUser?.role;

      if (userRole === "shop_owner") {
        // Shopkeeper should go to apply page or shopkeeper route
        if (next === "/" || !next.startsWith("/shopkeeper")) {
          router.replace("/shopkeeper/apply");
        } else {
          router.replace(next);
        }
      } else {
        // Customer or no role - use next or home
        router.replace(next);
      }
    }
  }, [isLoggedIn, dbUser, router, next]);

  const handleAuthSuccess = () => {
    // Check if this is a shopkeeper signup by checking the next URL or role
    const isShopkeeperFlow = next?.startsWith("/shopkeeper") || search?.get("role") === "shop_owner";

    if (isShopkeeperFlow) {
      // Shopkeeper should go to apply page or shopkeeper route
      if (next === "/" || !next.startsWith("/shopkeeper")) {
        router.replace("/shopkeeper/apply");
      } else {
        router.replace(next);
      }
    } else {
      // Customer or no role - use next or home
      router.replace(next);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <LoginForm
              key="login"
              onSuccess={handleAuthSuccess}
              onSwitchToSignup={() => setIsLogin(false)}
            />
          ) : (
            <SignupForm
              key="signup"
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <AuthErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-xl font-semibold text-foreground">Loading...</h1>
              <p className="mt-2 text-sm text-muted-foreground">Preparing authentication</p>
            </div>
          </div>
        }
      >
        <AuthPageContent />
      </Suspense>
    </AuthErrorBoundary>
  );
}
