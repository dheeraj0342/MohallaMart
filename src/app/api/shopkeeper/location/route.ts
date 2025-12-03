import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

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

    const dbUser = await fetchQuery(api.users.getUser, {
      id: supabaseUser.id,
    });

    if (!dbUser || dbUser.role !== "shop_owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      shopId,
      lat,
      lon,
      accuracy,
      snapped,
      source,
      addressText,
      road,
      suburb,
      city,
      postcode,
      village,
      hamlet,
      county,
      stateDistrict,
      state,
    } = body;

    if (
      !shopId ||
      typeof lat !== "number" ||
      typeof lon !== "number" ||
      typeof accuracy !== "number" ||
      typeof snapped !== "boolean" ||
      typeof source !== "string" ||
      typeof addressText !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid location fields" },
        { status: 400 },
      );
    }

    // Ensure the shop belongs to this shopkeeper
    const shop = await fetchQuery(api.shops.getShop, {
      id: shopId as Id<"shops">,
    });

    if (!shop || shop.owner_id !== dbUser._id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Reuse an existing updateShop mutation for patching
    await fetchMutation(api.shops.updateShop, {
      id: shopId as Id<"shops">,
      location: {
        lat,
        lon,
        accuracy,
        snapped,
        source,
        addressText,
        road,
        suburb,
        city,
        postcode,
        village,
        hamlet,
        county,
        stateDistrict,
        state,
      },
    } as any);

    const updated = await fetchQuery(api.shops.getShop, {
      id: shopId as Id<"shops">,
    });

    return NextResponse.json({ shop: updated }, { status: 200 });
  } catch (error: any) {
    console.error("[Shopkeeper Location PATCH] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update location" },
      { status: 500 },
    );
  }
}


