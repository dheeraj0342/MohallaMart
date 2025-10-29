import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { fetchMutation, fetchQuery } = await import("convex/nextjs");
    const { api } = await import("@/../convex/_generated/api");
    const body = await req.json().catch(() => ({}));
    let { userId } = body as { userId?: string };

    if (!userId) {
      // Pick any existing user (latest) when no userId provided
      const all = (await fetchQuery(api.users.getAllUsers, { limit: 1 }).catch(
        () => [],
      )) as any[];
      if (all.length === 0) {
        return NextResponse.json(
          { ok: false, error: "No users found to apply as shopkeeper" },
          { status: 400 },
        );
      }
      userId = all[0].id;
    }

    await fetchMutation(api.users.requestShopkeeperRole, {
      id: userId as string,
    });

    return NextResponse.json({ ok: true, userId });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
