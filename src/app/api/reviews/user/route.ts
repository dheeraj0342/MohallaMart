import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await fetchQuery(api.users.getUser, {
      id: supabaseUser.id,
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reviews = await fetchQuery(api.reviews.getReviewsByUser, {
      user_id: dbUser._id as Id<"users">,
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error: any) {
    console.error("[Reviews User] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user reviews" },
      { status: 500 },
    );
  }
}


