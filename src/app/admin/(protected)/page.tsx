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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-brand">
          Admin Dashboard
        </h1>
        <div className="bg-primary-brand/10 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-brand w-6 h-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-secondary-brand">
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
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-secondary-brand">
            Active Shopkeepers
          </h2>
          <ShopkeeperList
            shopkeepers={activeShopkeepers}
            actionLabel="Disable"
            makeActive={false}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <Link
          className="text-secondary-brand hover:text-secondary-brand/80 font-medium flex items-center gap-2"
          href="/admin/login"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
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
    <ul className="divide-y divide-gray-100">
      {shopkeepers.length === 0 && (
        <li className="py-4 text-sm text-gray-500 text-center italic">No records found</li>
      )}
      {shopkeepers.map((u) => (
        <li key={u.id} className="py-4 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-primary-brand/10 w-10 h-10 rounded-full flex items-center justify-center text-primary-brand font-medium">
              {u.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-900">{u.name}</div>
              <div className="text-sm text-gray-500">{u.email}</div>
            </div>
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
    <ul className="divide-y divide-gray-100">
      {apps.length === 0 && (
        <li className="py-4 text-sm text-gray-500 text-center italic">No records found</li>
      )}
      {apps.map((a) => (
        <li
          key={a.applicationId}
          className="py-4 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-secondary-brand/10 w-10 h-10 rounded-full flex items-center justify-center text-secondary-brand font-medium">
              {a.applicant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-900">{a.applicant.name}</div>
              <div className="text-sm text-gray-500">{a.applicant.email}</div>
              <div className="text-xs mt-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full inline-block">Pending Approval</div>
            </div>
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
        className={`px-4 py-2 rounded-lg shadow-sm text-white text-sm font-medium transition-all ${
          makeActive 
            ? "bg-primary-brand hover:bg-primary-brand/90" 
            : "bg-secondary-brand hover:bg-secondary-brand/90"
        }`}
      >
        {label}
      </button>
    </form>
  );
}