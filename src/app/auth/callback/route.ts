import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { withRetry } from "@/lib/retry";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    try {
      await withRetry(() => supabase.auth.exchangeCodeForSession(code), {
        retries: 2,
        baseDelayMs: 300,
      });

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch {
      return NextResponse.redirect(
        new URL("/auth?error=Unable to verify email", requestUrl.origin),
      );
    }
  }

  return NextResponse.redirect(new URL("/auth", requestUrl.origin));
}
