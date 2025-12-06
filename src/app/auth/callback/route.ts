import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { withRetry } from "@/lib/retry";

/**
 * Validates and sanitizes redirect URL based on user role
 * Prevents unauthorized access to role-specific routes
 */
function validateRedirectUrl(url: string, userRole: string | null | undefined): string {
  // Normalize the URL (remove query params and hash for validation)
  const normalizedUrl = url.split("?")[0].split("#")[0];
  
  // Define role-specific route prefixes
  const shopkeeperRoutes = ["/shopkeeper"];
  const adminRoutes = ["/admin"];
  const riderRoutes = ["/rider"];
  const protectedRoutes = [...shopkeeperRoutes, ...adminRoutes, ...riderRoutes];

  // If no role or customer role, block access to protected routes
  if (!userRole || userRole === "customer") {
    // Check if URL is trying to access a protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
      normalizedUrl.startsWith(route)
    );
    
    if (isProtectedRoute) {
      return "/";
    }
  }

  // Shopkeeper can't access admin or rider routes
  if (userRole === "shop_owner") {
    const isAdminRoute = adminRoutes.some((route) =>
      normalizedUrl.startsWith(route)
    );
    const isRiderRoute = riderRoutes.some((route) =>
      normalizedUrl.startsWith(route)
    );
    
    if (isAdminRoute || isRiderRoute) {
      return "/shopkeeper/registration";
    }
  }

  // Admin can't access shopkeeper or rider routes
  if (userRole === "admin") {
    const isShopkeeperRoute = shopkeeperRoutes.some((route) =>
      normalizedUrl.startsWith(route)
    );
    const isRiderRoute = riderRoutes.some((route) =>
      normalizedUrl.startsWith(route)
    );
    
    if (isShopkeeperRoute || isRiderRoute) {
      return "/admin";
    }
  }

  // Rider can't access shopkeeper or admin routes
  if (userRole === "rider") {
    const isShopkeeperRoute = shopkeeperRoutes.some((route) =>
      normalizedUrl.startsWith(route)
    );
    const isAdminRoute = adminRoutes.some((route) =>
      normalizedUrl.startsWith(route)
    );
    
    if (isShopkeeperRoute || isAdminRoute) {
      return "/rider/app";
    }
  }

  // Default: allow the URL if it passes validation
  return url;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";
  const role = requestUrl.searchParams.get("role"); // Get role from query params (for OAuth)

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    try {
      const { data, error } = await withRetry(() => supabase.auth.exchangeCodeForSession(code), {
        retries: 2,
        baseDelayMs: 300,
      });

      if (error) {
        throw error;
      }

      // If role is provided via OAuth and not set in user metadata, update it
      if (data?.user && role && !data.user.user_metadata?.role) {
        await supabase.auth.updateUser({
          data: {
            ...data.user.user_metadata,
            role: role, // Can be "shop_owner" or "customer"
          },
        });
      }

      // Get user role from metadata or query param
      const userRole = data?.user?.user_metadata?.role || role;
      
      // Validate and sanitize redirect URL based on role
      // This prevents customers from being redirected to protected routes (shopkeeper/admin/rider)
      // If a customer signs up with ?next=/shopkeeper/apply, validateRedirectUrl will return "/"
      let redirectUrl = validateRedirectUrl(next, userRole);
      
      // Additional role-based default redirects
      if (userRole === "shop_owner") {
        // Shopkeeper should go to registration page first (new flow: Signup → Registration → Apply → Admin Review → Dashboard)
        if (redirectUrl === "/") {
          redirectUrl = "/shopkeeper/registration";
        }
      }

      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
    } catch (error) {
      console.error("Auth callback error:", error);
      const errorUrl = new URL("/auth", requestUrl.origin);
      errorUrl.searchParams.set("error", "Unable to verify email");
      if (role) {
        errorUrl.searchParams.set("role", role);
      }
      return NextResponse.redirect(errorUrl);
    }
  }

  const fallbackUrl = new URL("/auth", requestUrl.origin);
  if (role) {
    fallbackUrl.searchParams.set("role", role);
  }
  return NextResponse.redirect(fallbackUrl);
}
