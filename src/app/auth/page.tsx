"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { isLoggedIn } = useStore();

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  const handleAuthSuccess = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
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
  );
}
