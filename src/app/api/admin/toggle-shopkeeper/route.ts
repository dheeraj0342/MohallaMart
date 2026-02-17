import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/../convex/_generated/api";
import { sendEvent } from "@/lib/inngest";
import { isAdminAuthenticated } from "@/lib/adminAuth";

//admin check

export async function POST(request: NextRequest) {
  try {
    // Check if admin is authenticated
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    const { id, makeActive } = await request.json();

    if (!id || typeof makeActive !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request. Missing id or makeActive." },
        { status: 400 }
      );
    }

    // Update shopkeeper status
    await fetchMutation(api.users.setUserActiveStatus, {
      id,
      is_active: makeActive,
    });

    // Send event if activating
    if (makeActive) {
      await sendEvent("shopkeeper/approved", {
        userId: id,
        approvedBy: "admin",
        approvedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling shopkeeper:", error);
    return NextResponse.json(
      { error: "Failed to update shopkeeper status" },
      { status: 500 }
    );
  }
}

