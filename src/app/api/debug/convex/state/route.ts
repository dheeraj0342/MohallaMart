import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { fetchQuery } = await import("convex/nextjs");
    const { api } = await import("@/../convex/_generated/api");

    const pendingApps = await fetchQuery(
      api.users.listPendingShopkeeperApplications,
      {},
    ).catch(() => []);
    const inactiveShopOwners = await fetchQuery(api.users.listShopkeepers, {
      is_active: false,
    }).catch(() => []);
    const activeShopOwners = await fetchQuery(api.users.listShopkeepers, {
      is_active: true,
    }).catch(() => []);

    return NextResponse.json({
      ok: true,
      counts: {
        pendingApplications: pendingApps.length,
        inactiveShopOwners: inactiveShopOwners.length,
        activeShopOwners: activeShopOwners.length,
      },
      sample: {
        pendingApplications: pendingApps.slice(0, 5),
        inactiveShopOwners: inactiveShopOwners.slice(0, 5),
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: (e as Error)?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
