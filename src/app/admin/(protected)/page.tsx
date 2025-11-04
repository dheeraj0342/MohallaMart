import { api } from "@/../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const panelStyles =
  "rounded-3xl border border-[#dce8e1] bg-white/95 p-6 shadow-xl shadow-primary-brand/5 backdrop-blur-sm";
const listItemStyles =
  "flex items-center justify-between rounded-2xl border border-transparent bg-white/85 px-3 py-4 transition-all hover:-translate-y-[1px] hover:border-primary-brand/40 hover:bg-[#eef7f1]";
const emptyStateStyles =
  "rounded-2xl bg-[#f5faf7] px-4 py-6 text-center text-sm text-neutral-500";

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
    <div className="space-y-10">
      <section
        className={`${panelStyles} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary-brand/80">
            MohallaMart Admin
          </p>
          <h1 className="text-3xl font-bold text-[#1f2a33]">
            Marketplace Overview
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Review new applications, activate trusted partners, and keep the marketplace curated.
          </p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-brand/10 text-primary-brand">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className={panelStyles}>
          <h2 className="text-lg font-semibold text-[#1f2a33]">
            Pending Shopkeepers
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Approve trusted sellers or continue reviewing their submissions.
          </p>
          <div className="mt-4">
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
        </div>
        <div className={panelStyles}>
          <h2 className="text-lg font-semibold text-[#1f2a33]">
            Active Shopkeepers
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Monitor performance and disable storefronts that need attention.
          </p>
          <div className="mt-4">
            <ShopkeeperList
              shopkeepers={activeShopkeepers}
              actionLabel="Disable"
              makeActive={false}
            />
          </div>
        </div>
      </section>

      <section className={panelStyles}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1f2a33]">Quick Actions</h2>
            <p className="text-sm text-neutral-500">
              Jump straight to the workflows you use most.
            </p>
          </div>
          <div className="rounded-2xl bg-secondary-brand/10 p-3 text-secondary-brand">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 5h12" />
              <path d="M9 3v2" />
              <path d="M7 9h8" />
              <path d="M5 13h10" />
              <path d="M11 17h6" />
              <path d="M15 21h6" />
            </svg>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/registrations"
            className="group flex items-center gap-4 rounded-2xl border border-[#dce8e1] bg-[#f7faf9] p-4 transition-all hover:-translate-y-1 hover:border-primary-brand/40 hover:shadow-lg"
          >
            <div className="rounded-2xl bg-primary-brand/10 p-3 text-primary-brand transition-colors group-hover:bg-primary-brand/15">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                <path d="M13 5v2" />
                <path d="M13 17v2" />
                <path d="M13 11v2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[#1f2a33]">View Registrations</h3>
              <p className="text-sm text-neutral-500">
                Review and triage shopkeeper applications.
              </p>
            </div>
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f7faf9] px-4 py-3 text-sm text-neutral-600">
          <span>Need to switch users or revoke access?</span>
          <Link
            className="inline-flex items-center gap-2 font-semibold text-secondary-brand transition-colors hover:text-secondary-brand/80"
            href="/admin/login"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Manage session
          </Link>
        </div>
      </section>
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
    <ul className="space-y-3">
      {shopkeepers.length === 0 && (
        <li className={emptyStateStyles}>No records found</li>
      )}
      {shopkeepers.map((u) => (
        <li key={u.id} className={listItemStyles}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-brand/10 text-base font-semibold text-primary-brand">
              {u.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-[#1f2a33]">{u.name}</div>
              <div className="text-sm text-neutral-500">{u.email}</div>
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
    <ul className="space-y-3">
      {apps.length === 0 && <li className={emptyStateStyles}>No records found</li>}
      {apps.map((a) => (
        <li key={a.applicationId} className={listItemStyles}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-brand/10 text-base font-semibold text-secondary-brand">
              {a.applicant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-[#1f2a33]">{a.applicant.name}</div>
              <div className="text-sm text-neutral-500">{a.applicant.email}</div>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Pending approval
              </span>
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
        className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all ${
          makeActive
            ? "bg-primary-brand shadow-lg shadow-primary-brand/20 hover:bg-primary-hover"
            : "bg-secondary-brand shadow-lg shadow-secondary-brand/25 hover:bg-secondary-brand/90"
        }`}
      >
        {label}
      </button>
    </form>
  );
}