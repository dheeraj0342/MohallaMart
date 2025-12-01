import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/../convex/_generated/api";

export async function DELETE(request: NextRequest) {
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

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    // Get user from Convex
    const dbUser = await fetchQuery(api.users.getUser, {
      id: supabaseUser.id,
    });

    if (!dbUser || dbUser.role !== "shop_owner" || !dbUser.is_active) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete product
    await fetchMutation(api.products.deleteProduct, {
      id: id as any,
      owner_id: dbUser._id,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}

