import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/../convex/_generated/api";

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

    // Get user from Convex
    const dbUser = await fetchQuery(api.users.getUser, {
      id: supabaseUser.id,
    });

    if (!dbUser || dbUser.role !== "shop_owner" || !dbUser.is_active) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category_id = searchParams.get("category_id") || undefined;
    const is_available = searchParams.get("is_available")
      ? searchParams.get("is_available") === "true"
      : undefined;

    // Get products
    const products = await fetchQuery(api.products.getMyProducts, {
      owner_id: dbUser._id,
      search,
      category_id: category_id as any,
      is_available,
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

