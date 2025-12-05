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
  const errorMsg = search?.get("error") || undefined;
  const [isLogin, setIsLogin] = useState(initialMode !== "signup");
  const router = useRouter();
  const { isLoggedIn } = useStore();
  const { dbUser } = useAuth();

  useEffect(() => {
    // Call isLoggedIn() inside the effect instead of including it in dependencies
    // This prevents the effect from running on every render due to function reference changes
    const loggedIn = isLoggedIn();

    if (loggedIn && dbUser !== undefined) {
      // Role-based redirect with validation
      const userRole = dbUser?.role;

      // Validate next URL based on role
      let redirectUrl = next;

      // Block customers from accessing protected routes
      if (!userRole || userRole === "customer") {
        if (next.startsWith("/shopkeeper") ||
          next.startsWith("/admin") ||
          next.startsWith("/rider")) {
          redirectUrl = "/";
        }
      }

      // Block shopkeepers from accessing admin/rider routes
      if (userRole === "shop_owner") {
        if (next.startsWith("/admin") || next.startsWith("/rider")) {
          redirectUrl = "/shopkeeper/apply";
        } else if (next === "/" || !next.startsWith("/shopkeeper")) {
          redirectUrl = "/shopkeeper/apply";
        }
      }

      router.replace(redirectUrl);
    }
  }, [dbUser, router, next]);

  const handleAuthSuccess = () => {
    // Use actual user role from dbUser if available, otherwise fall back to URL params
    // This prevents customers from being redirected to shopkeeper routes based on URL alone
    const actualUserRole = dbUser?.role;
    const roleFromUrl = search?.get("role");

    // Determine user role: prioritize actual role from database, then URL param
    const userRole = actualUserRole || roleFromUrl || null;

    // Validate redirect URL based on actual role, not just URL parameters
    let redirectUrl = next;

    // Block customers from accessing protected routes (even if URL suggests shopkeeper flow)
    if (!userRole || userRole === "customer") {
      if (next.startsWith("/shopkeeper") ||
        next.startsWith("/admin") ||
        next.startsWith("/rider")) {
        redirectUrl = "/";
      }
      // For customers, just redirect to home or the safe next URL
      router.replace(redirectUrl);
      return;
    }

    // Shopkeeper flow - only if actual role is shop_owner
    if (userRole === "shop_owner") {
      if (next.startsWith("/admin") || next.startsWith("/rider")) {
        redirectUrl = "/shopkeeper/apply";
      } else if (next === "/" || !next.startsWith("/shopkeeper")) {
        redirectUrl = "/shopkeeper/apply";
      } else {
        redirectUrl = next;
      }
    } else {
      // Other roles (admin, rider) - validate their routes
      if (userRole === "admin") {
        if (next.startsWith("/shopkeeper") || next.startsWith("/rider")) {
          redirectUrl = "/admin";
        }
      } else if (userRole === "rider") {
        if (next.startsWith("/shopkeeper") || next.startsWith("/admin")) {
          redirectUrl = "/rider/app";
        }
      }
    }

    router.replace(redirectUrl);
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
              initialError={errorMsg}
            />
          ) : (
            <SignupForm
              key="signup"
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setIsLogin(true)}
              initialError={errorMsg}
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
