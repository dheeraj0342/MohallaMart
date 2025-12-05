import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withRetry } from "@/lib/retry";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";
  const role = requestUrl.searchParams.get("role"); // Get role from query params (for OAuth)

  if (code) {
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

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch {
      return NextResponse.redirect(
        new URL("/auth?error=Unable to verify email", requestUrl.origin),
      );
    }
  }

  return NextResponse.redirect(new URL("/auth", requestUrl.origin));
}
