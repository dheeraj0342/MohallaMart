import { api } from "@/../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  UserX, 
  ClipboardList, 
  LogOut,
  AlertCircle
} from "lucide-react";
import ShopkeeperToggleDialog from "./_components/ShopkeeperToggleDialog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const totalPending = pendingApplications.length > 0 ? pendingApplications.length : pendingShopkeepers.length;
  const totalActive = activeShopkeepers.length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">Admin Dashboard</CardTitle>
              <CardDescription className="mt-2 text-base">
                Review applications, manage shopkeepers, and oversee the marketplace.
              </CardDescription>
            </div>
            <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-xl bg-primary-brand/10 dark:bg-primary-brand/20 text-primary-brand">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting review and approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shopkeepers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActive}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active on platform
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shopkeepers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending + totalActive}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All shopkeepers combined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shopkeeper Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-amber-500" />
              <CardTitle>Pending Shopkeepers</CardTitle>
            </div>
            <CardDescription>
              Approve trusted sellers or continue reviewing their submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingApplications.length > 0 ? (
              <PendingApplicationsList apps={pendingApplications} />
            ) : (
              <ShopkeeperList
                shopkeepers={pendingShopkeepers}
                actionLabel="Approve"
                makeActive={true}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <CardTitle>Active Shopkeepers</CardTitle>
            </div>
            <CardDescription>
              Monitor performance and disable storefronts that need attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShopkeeperList
              shopkeepers={activeShopkeepers}
              actionLabel="Disable"
              makeActive={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Jump straight to the workflows you use most.
              </CardDescription>
            </div>
            <div className="hidden sm:flex rounded-xl bg-secondary-brand/10 dark:bg-secondary-brand/20 p-3 text-secondary-brand">
              <ClipboardList className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/registrations">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-2 hover:border-primary-brand/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary-brand/10 dark:bg-primary-brand/20 p-3 text-primary-brand">
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">View Registrations</CardTitle>
                      <CardDescription className="text-sm">
                        Review and triage applications
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Need to switch users or revoke access?
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/login" className="gap-2">
                <LogOut className="h-4 w-4" />
                Manage session
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
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
  if (shopkeepers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No records found</p>
        <p className="text-xs text-muted-foreground mt-1">
          {makeActive ? "No pending shopkeepers" : "No active shopkeepers"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {shopkeepers.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary-brand/50"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-brand/10 dark:bg-primary-brand/20 text-sm font-semibold text-primary-brand">
              {u.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-foreground truncate">{u.name}</div>
              <div className="text-sm text-muted-foreground truncate">{u.email}</div>
            </div>
          </div>
          <ShopkeeperToggle
            id={u.id}
            makeActive={makeActive}
            label={actionLabel}
          />
        </div>
      ))}
    </div>
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
  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No applications found</p>
        <p className="text-xs text-muted-foreground mt-1">
          No pending applications to review
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {apps.map((a) => (
        <div
          key={a.applicationId}
          className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary-brand/50"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-sm font-semibold text-amber-700 dark:text-amber-400">
              {a.applicant.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-foreground truncate">{a.applicant.name}</div>
              <div className="text-sm text-muted-foreground truncate">{a.applicant.email}</div>
              <Badge variant="warning" className="mt-1.5">
                <AlertCircle className="h-3 w-3 mr-1" />
                Pending approval
              </Badge>
            </div>
          </div>
          <ShopkeeperToggle
            id={a.applicant.id}
            makeActive={true}
            label="Approve"
          />
        </div>
      ))}
    </div>
  );
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
  return <ShopkeeperToggleDialog id={id} label={label} makeActive={makeActive} />;
}
