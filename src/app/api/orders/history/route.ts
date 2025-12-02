import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/../../convex/_generated/api";
import type { Id } from "@/../../convex/_generated/dataModel";

const STATUS_MAP: Record<string, "pending" | "accepted_by_shopkeeper" | "assigned_to_rider" | "out_for_delivery" | "delivered" | "cancelled"> = {
  PLACED: "pending",
  ACCEPTED: "accepted_by_shopkeeper",
  ACCEPTED_BY_SHOPKEEPER: "accepted_by_shopkeeper",
  ASSIGNED: "assigned_to_rider",
  ASSIGNED_TO_RIDER: "assigned_to_rider",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

function formatStatusDisplay(status: string) {
  switch (status) {
    case "pending":
      return "PLACED";
    case "accepted_by_shopkeeper":
      return "ACCEPTED_BY_SHOPKEEPER";
    case "assigned_to_rider":
      return "ASSIGNED_TO_RIDER";
    case "out_for_delivery":
      return "OUT_FOR_DELIVERY";
    case "delivered":
      return "DELIVERED";
    case "cancelled":
      return "CANCELLED";
    default:
      return status.toUpperCase();
  }
}

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

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const shopParam = searchParams.get("shopId");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const queryArgs: {
      user_id: Id<"users">;
      status?: "pending" | "accepted_by_shopkeeper" | "assigned_to_rider" | "out_for_delivery" | "delivered" | "cancelled";
      shop_id?: Id<"shops">;
      startDate?: number;
      endDate?: number;
    } = {
      user_id: dbUser._id,
    };

    if (statusParam) {
      const mappedStatus = STATUS_MAP[statusParam.toUpperCase()];
      if (mappedStatus) {
        queryArgs.status = mappedStatus;
      }
    }

    if (shopParam) {
      queryArgs.shop_id = shopParam as Id<"shops">;
    }

    if (startDateParam) {
      const start = new Date(startDateParam);
      start.setHours(0, 0, 0, 0);
      queryArgs.startDate = start.getTime();
    }

    if (endDateParam) {
      const end = new Date(endDateParam);
      end.setHours(23, 59, 59, 999);
      queryArgs.endDate = end.getTime();
    }

    const orders = await fetchQuery(api.orders.getOrdersByUser, queryArgs);

    const history = orders.map((order) => ({
      id: order._id,
      orderNumber: order.order_number,
      shopName: (order as any).shop?.name || "Unknown Shop",
      items: order.items,
      totalAmount: order.total_amount,
      status: formatStatusDisplay(order.status),
      createdAt: order.created_at,
      estimatedDelivery: order.delivery_time || null,
    }));

    return NextResponse.json(
      {
        orders: history,
        count: history.length,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Orders History] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order history" },
      { status: 500 },
    );
  }
}


