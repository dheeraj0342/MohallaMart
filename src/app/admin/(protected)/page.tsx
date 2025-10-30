import { api } from "@/../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const pendingApplications = (await fetchQuery(
    api.users.listPendingShopkeeperApplications,
    {},
  ).catch(() => [])) as Array<{
    applicationId: string;
    applicant: { id: string; name: string; email: string };
  }>;
  const pendingShopkeepers = await fetchQuery(api.users.listShopkeepers, {
    is_active: false,
  }).catch(() => []);
  const activeShopkeepers = await fetchQuery(api.users.listShopkeepers, {
    is_active: true,
  }).catch(() => []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-3 text-[var(--color-secondary)]">
            Pending Shopkeepers
          </h2>
          {pendingApplications.length > 0 ? (
            <PendingApplicationsList apps={pendingApplications} />
          ) : (
            <ShopkeeperList
              shopkeepers={pendingShopkeepers}
              actionLabel="Approve"
              makeActive={true}
            />
          )}
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-3 text-[var(--color-secondary)]">
            Active Shopkeepers
          </h2>
          <ShopkeeperList
            shopkeepers={activeShopkeepers}
            actionLabel="Disable"
            makeActive={false}
          />
        </div>
      </div>

      <div>
        <Link
          className="text-[var(--color-secondary)] underline"
          href="/admin/login"
        >
          Manage session
        </Link>
      </div>
    </div>
  );
}

function ShopkeeperList({
  shopkeepers,
  actionLabel,
  makeActive,
}: {
  shopkeepers: Array<{ id: string; name: string; email: string }>;
  actionLabel: string;
  makeActive: boolean;
}) {
  return (
    <ul className="divide-y">
      {shopkeepers.length === 0 && (
        <li className="py-3 text-sm text-gray-500">No records</li>
      )}
      {shopkeepers.map((u) => (
        <li key={u.id} className="py-3 flex items-center justify-between">
          <div>
            <div className="font-medium">{u.name}</div>
            <div className="text-sm text-gray-500">{u.email}</div>
          </div>
          <ShopkeeperToggle
            id={u.id}
            makeActive={makeActive}
            label={actionLabel}
          />
        </li>
      ))}
    </ul>
  );
}

function PendingApplicationsList({
  apps,
}: {
  apps: Array<{
    applicationId: string;
    applicant: { id: string; name: string; email: string };
  }>;
}) {
  return (
    <ul className="divide-y">
      {apps.length === 0 && (
        <li className="py-3 text-sm text-gray-500">No records</li>
      )}
      {apps.map((a) => (
        <li
          key={a.applicationId}
          className="py-3 flex items-center justify-between"
        >
          <div>
            <div className="font-medium">{a.applicant.name}</div>
            <div className="text-sm text-gray-500">{a.applicant.email}</div>
          </div>
          <ShopkeeperToggle
            id={a.applicant.id}
            makeActive={true}
            label="Approve"
          />
        </li>
      ))}
    </ul>
  );
}

async function toggleShopkeeper(id: string, makeActive: boolean) {
  "use server";
  const { fetchMutation } = await import("convex/nextjs");
  const { api } = await import("@/../convex/_generated/api");
  await fetchMutation(api.users.setUserActiveStatus, {
    id,
    is_active: makeActive,
  });
  if (makeActive) {
    const { sendEvent } = await import("@/lib/inngest");
    await sendEvent("shopkeeper/approved", {
      userId: id,
      approvedBy: "admin",
      approvedAt: new Date().toISOString(),
    });
  }
}

function ShopkeeperToggle({
  id,
  label,
  makeActive,
}: {
  id: string;
  label: string;
  makeActive: boolean;
}) {
  const action = toggleShopkeeper.bind(null, id, makeActive);
  return (
    <form action={action}>
      <button
        type="submit"
        className="px-3 py-1 rounded bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm"
      >
        {label}
      </button>
    </form>
  );
}