import { NextRequest, NextResponse } from "next/server";
import { sendEvent } from "@/lib/inngest";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, name } = body || {};
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    await sendEvent("shopkeeper/applied", {
      userId,
      email,
      name,
      appliedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
