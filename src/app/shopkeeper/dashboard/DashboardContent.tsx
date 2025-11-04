"use client";

import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import Link from "next/link";
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  BarChart3,
  User,
  FileText
} from "lucide-react";

export default function DashboardContent() {
  const { user } = useAuth();
  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as { _id?: Id<"users">; role?: string; is_active?: boolean; name?: string; email?: string } | null | undefined;

  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id, is_active: true } : "skip",
  ) as Array<{
    _id: string;
    name: string;
    address: { city?: string; state?: string };
    rating?: number;
  }> | null | undefined;

  // Guard handles loading and auth checks, so we can safely assume user and dbUser exist here
  if (!user || !dbUser) {
    return null;
  }

  const shop = Array.isArray(shops) && shops.length > 0 ? shops[0] : null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-[#1f2a33] dark:text-[#f3f6fb] mb-2">
          Welcome back, {dbUser.name || "Shopkeeper"}! 👋
        </h1>
        <p className="text-[#667085] dark:text-[#9aa6b2]">
          Here&apos;s what&apos;s happening with your shop today.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Package className="h-6 w-6" />}
          label="Active Products"
          value="0"
          trend="+12% this month"
          color="blue"
        />
        <StatCard
          icon={<ShoppingCart className="h-6 w-6" />}
          label="Orders Today"
          value="0"
          trend="0 pending"
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Revenue"
          value="₹0"
          trend="No sales yet"
          color="purple"
        />
        <StatCard
          icon={<BarChart3 className="h-6 w-6" />}
          label="Rating"
          value={shop?.rating ? `${shop.rating.toFixed(1)}/5` : "N/A"}
          trend="No reviews yet"
          color="amber"
        />
      </section>

      <section>
        {shop ? (
          <div className="bg-white/95 dark:bg-[#11181d] rounded-3xl shadow-xl border border-[#e5efe8] dark:border-[#1f2a33] p-6 backdrop-blur-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1f2a33] dark:text-[#f3f6fb] mb-2">
                  {shop.name}
                </h2>
                <p className="text-[#667085] dark:text-[#9aa6b2]">
                  📍 {shop.address?.city || "Unknown"}, {shop.address?.state || "Unknown"}
                </p>
                {shop.rating && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <span className="font-semibold">{shop.rating.toFixed(1)}</span>
                    <span className="text-sm text-neutral-500">/ 5.0</span>
                  </div>
                )}
              </div>
              <Link href="/shopkeeper/profile">
                <button className="inline-flex items-center gap-2 rounded-xl bg-primary-brand px-6 py-3 font-semibold text-white shadow-lg shadow-primary-brand/20 transition-colors hover:bg-primary-hover">
                  <User className="h-5 w-5" />
                  Manage Profile
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-8 text-center">
            <div className="mb-4 text-5xl">🏪</div>
            <h2 className="mb-2 text-xl font-bold text-amber-900">
              No Shop Found
            </h2>
            <p className="mb-4 text-amber-700">
              You need to complete your shop registration to start receiving orders.
            </p>
            <Link href="/shopkeeper/registration">
              <button className="rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-700">
                Complete Registration
              </button>
            </Link>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ActionCard
          icon={<Package className="h-8 w-8" />}
          title="Manage Products"
          description="Add, edit, or remove products from your shop"
          href="/shopkeeper/profile"
          color="blue"
        />
        <ActionCard
          icon={<ShoppingCart className="h-8 w-8" />}
          title="View Orders"
          description="Track and manage customer orders"
          href="/shopkeeper/profile"
          color="green"
        />
        <ActionCard
          icon={<FileText className="h-8 w-8" />}
          title="Registration"
          description="Complete your business registration"
          href="/shopkeeper/registration"
          color="purple"
        />
      </section>

      <section className="rounded-3xl bg-linear-to-r from-primary-brand via-[#1f8f4e] to-secondary-brand p-6 text-white shadow-xl">
        <h3 className="text-xl font-bold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm">
          <li>✓ Keep your product information updated for better visibility</li>
          <li>✓ Respond to customer inquiries within 24 hours</li>
          <li>✓ Maintain high ratings to get featured in search results</li>
          <li>✓ Offer competitive pricing to attract more customers</li>
        </ul>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  color: "blue" | "green" | "purple" | "amber";
}) {
  const colorClasses = {
    blue: "bg-[#e6f4ec] text-primary-brand border-primary-brand/20",
    green: "bg-[#fff5e6] text-[#c2410c] border-[#fed7aa]",
    purple: "bg-[#e8f2ff] text-[#1d4ed8] border-[#bfdbfe]",
    amber: "bg-[#fff7e6] text-[#b45309] border-[#fbbf24]/40",
  };

  return (
    <div className="bg-white/95 dark:bg-[#11181d] rounded-3xl shadow-xl border border-[#e5efe8] dark:border-[#1f2a33] p-6 hover:shadow-2xl transition-shadow backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} shadow-inner`}> 
          {icon}
        </div>
      </div>
      <div className="text-sm font-medium text-[#667085] dark:text-[#9aa6b2] mb-1">
        {label}
      </div>
      <div className="text-3xl font-bold text-[#1f2a33] dark:text-[#f3f6fb] mb-1">
        {value}
      </div>
      <div className="text-xs text-[#98a2b3] dark:text-[#7f8ea3]">
        {trend}
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: "blue" | "green" | "purple" | "amber";
}) {
  const colorClasses = {
    blue: "bg-[#e6f4ec] text-primary-brand",
    green: "bg-[#fff5e6] text-[#c2410c]",
    purple: "bg-[#e8f2ff] text-[#1d4ed8]",
    amber: "bg-[#fff7e6] text-[#b45309]",
  };

  return (
    <Link href={href}>
      <div className="bg-white/95 dark:bg-[#11181d] rounded-3xl shadow-xl border border-[#e5efe8] dark:border-[#1f2a33] p-6 hover:shadow-2xl hover:border-primary-brand/60 transition-all cursor-pointer group backdrop-blur-sm">
        <div className={`p-4 rounded-xl ${colorClasses[color]} w-fit mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-[#1f2a33] dark:text-[#f3f6fb] mb-2 group-hover:text-primary-brand transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[#667085] dark:text-[#9aa6b2]">
          {description}
        </p>
      </div>
    </Link>
  );
}

