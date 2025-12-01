import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/../convex/_generated/api";

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const {
      id,
      name,
      description,
      price,
      original_price,
      stock_quantity,
      min_order_quantity,
      max_order_quantity,
      unit,
      images,
      tags,
      is_available,
      is_featured,
    } = body;

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

    // Update product
    await fetchMutation(api.products.updateProduct, {
      id: id as any,
      owner_id: dbUser._id,
      name,
      description,
      price: price !== undefined ? Number(price) : undefined,
      original_price: original_price !== undefined ? Number(original_price) : undefined,
      stock_quantity: stock_quantity !== undefined ? Number(stock_quantity) : undefined,
      min_order_quantity: min_order_quantity !== undefined ? Number(min_order_quantity) : undefined,
      max_order_quantity: max_order_quantity !== undefined ? Number(max_order_quantity) : undefined,
      unit,
      images: Array.isArray(images) ? images : undefined,
      tags: Array.isArray(tags) ? tags : undefined,
      is_available,
      is_featured,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

