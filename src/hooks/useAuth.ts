"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { supabaseUser, setSupabaseUser, setUser, signOut, user: storeUser } = useStore();
  const syncUser = useMutation(api.users.syncUserWithSupabase);
  
  // Get user role from Convex
  const dbUser = useQuery(
    api.users.getUser,
    storeUser || supabaseUser ? { id: (storeUser || supabaseUser)?.id || "" } : "skip"
  ) as { role?: string; is_active?: boolean } | null | undefined;

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setSupabaseUser(session.user);

        // Update user profile if we have user metadata
        const { user_metadata, email } = session.user;
        if (email) {
          setUser({
            id: session.user.id,
            name:
              user_metadata?.full_name ||
              user_metadata?.name ||
              email.split("@")[0],
            email: email,
            phone: user_metadata?.phone,
            avatar_url: user_metadata?.avatar_url,
          });
          // Sync user to Convex in background (don't await)
          syncUser({
            supabaseUserId: session.user.id,
            name:
              user_metadata?.full_name ||
              user_metadata?.name ||
              email.split("@")[0],
            email,
            phone: user_metadata?.phone,
            avatar_url: user_metadata?.avatar_url,
            provider: session.user.app_metadata?.provider || "email",
            role: user_metadata?.role,
          }).catch(() => {
            // Silently fail - sync can happen in background
          });
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);

        const { user_metadata, email } = session.user;
        if (email) {
          setUser({
            id: session.user.id,
            name:
              user_metadata?.full_name ||
              user_metadata?.name ||
              email.split("@")[0],
            email: email,
            phone: user_metadata?.phone,
            avatar_url: user_metadata?.avatar_url,
          });
          // Sync user to Convex in background (don't await)
          syncUser({
            supabaseUserId: session.user.id,
            name:
              user_metadata?.full_name ||
              user_metadata?.name ||
              email.split("@")[0],
            email,
            phone: user_metadata?.phone,
            avatar_url: user_metadata?.avatar_url,
            provider: session.user.app_metadata?.provider || "email",
            role: user_metadata?.role,
          }).catch(() => {
            // Silently fail - sync can happen in background
          });
        }
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSupabaseUser, setUser, syncUser]);

  // Role-based redirect after login
  useEffect(() => {
    if (!storeUser && !supabaseUser) return;
    if (!dbUser) return;
    
    // Don't redirect if on auth pages or already on correct role page
    if (pathname === "/auth" || pathname === "/login" || pathname === "/register") return;
    if (pathname.startsWith("/shopkeeper/login") || pathname.startsWith("/shopkeeper/signup")) return;
    if (pathname.startsWith("/admin/login")) return;
    if (pathname.startsWith("/rider/login")) return;

    const userRole = dbUser.role;
    const isActive = dbUser.is_active;

    // Redirect based on role
    if (userRole === "admin" && isActive) {
      if (!pathname.startsWith("/admin")) {
        router.push("/admin");
      }
    } else if (userRole === "shop_owner" && isActive) {
      if (!pathname.startsWith("/shopkeeper")) {
        router.push("/shopkeeper/dashboard");
      }
    } else if (userRole === "rider" && isActive) {
      if (!pathname.startsWith("/rider")) {
        router.push("/rider/app");
      }
    } else if (userRole === "customer") {
      // Customers should not access admin/shopkeeper/rider pages
      if (pathname.startsWith("/admin") || pathname.startsWith("/shopkeeper") || pathname.startsWith("/rider")) {
        router.push("/");
      }
    }
  }, [storeUser, supabaseUser, dbUser, pathname, router]);

  const logout = async () => {
    try {
      // Try to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("Supabase signOut error (non-critical):", error);
        // Continue with local logout even if Supabase signOut fails
      }
    } catch (err) {
      console.warn("Error during Supabase signOut (non-critical):", err);
      // Continue with local logout even if Supabase signOut fails
    }
    
    // Always clear local state regardless of Supabase response
    signOut();
    router.push("/");
  };

  // Return store user if available (faster), otherwise supabase user
  return {
    user: storeUser || supabaseUser,
    dbUser, // Include Convex user data with role
    logout,
  };
};
