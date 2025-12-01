import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/../../convex/_generated/api";

/**
 * POST /api/notifications/create
 * Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, title, message, type, data } = body;

    const notificationId = await fetchMutation(api.notifications.createNotification, {
      user_id: user_id as any,
      title,
      message,
      type: type as "ORDER" | "DELIVERY" | "PAYMENT" | "SYSTEM",
      data,
    });

    return NextResponse.json({
      success: true,
      notificationId,
    });
  } catch (err: any) {
    console.error("[Notification Create] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}

