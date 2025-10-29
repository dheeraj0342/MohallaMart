import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { fetchMutation, fetchQuery } = await import("convex/nextjs");
    const { api } = await import("@/../convex/_generated/api");

    const id = `debug-${Date.now()}`;
    // Try writing a debug user to Convex
    await fetchMutation(api.users.createUser, {
      id,
      name: "Debug User",
      email: `${id}@example.com`,
    });

    // Read back a few users to confirm connectivity
    const users = await fetchQuery(api.users.getAllUsers, { limit: 5 }).catch(
      () => [],
    );

    return NextResponse.json({ ok: true, wroteId: id, usersSample: users });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
