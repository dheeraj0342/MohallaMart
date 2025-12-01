import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/../convex/_generated/api";

export async function POST(request: NextRequest) {
  try {
    // Get auth token from request headers
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

    const body = await request.json();
    const {
      name,
      description,
      shop_id,
      category_id,
      price,
      original_price,
      stock_quantity,
      min_order_quantity,
      max_order_quantity,
      unit,
      images,
      tags,
      is_featured,
    } = body;

    // Validation
    if (!name || !shop_id || !category_id || price === undefined || stock_quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user from Convex
    const dbUser = await fetchQuery(api.users.getUser, {
      id: supabaseUser.id,
    });

    if (!dbUser || dbUser.role !== "shop_owner" || !dbUser.is_active) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create product
    const productId = await fetchMutation(api.products.createProduct, {
      name,
      description,
      shop_id: shop_id as any,
      owner_id: dbUser._id,
      category_id: category_id as any,
      price: Number(price),
      original_price: original_price ? Number(original_price) : undefined,
      stock_quantity: Number(stock_quantity),
      min_order_quantity: Number(min_order_quantity) || 1,
      max_order_quantity: Number(max_order_quantity) || 10,
      unit: unit || "piece",
      images: Array.isArray(images) ? images : [],
      tags: Array.isArray(tags) ? tags : [],
      is_featured: Boolean(is_featured),
    });

    return NextResponse.json({ success: true, productId }, { status: 201 });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

