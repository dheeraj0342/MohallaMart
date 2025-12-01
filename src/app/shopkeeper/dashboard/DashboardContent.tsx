"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Loader2, Package, ShoppingCart, TrendingUp, BarChart3, FileText, Mail, ArrowRight } from "lucide-react";

import StatCard from "./components/StatCard";
import ActionCard from "./components/ActionCard";
import ShopCard from "./components/ShopCard";
import TipsCard from "./components/TipsCard";
import LowStockAlert from "./components/LowStockAlert";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const dbUser = useQuery(api.users.getUser, user ? { id: user.id } : "skip") as
    | { _id?: Id<"users">; role?: string; is_active?: boolean; name?: string; email?: string }
    | null
    | undefined;

  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id, is_active: true } : "skip"
  ) as
    | Array<{
      _id: string;
      name: string;
      address: { city?: string; state?: string };
      rating?: number;
    }>

    | null
    | undefined;

  useEffect(() => {
    if (user === null) return;
    if (!user) {
      router.replace("/shopkeeper/login");
      return;
    }
    if (dbUser === undefined) return;
    if (dbUser && dbUser.role === "shop_owner" && dbUser.is_active) {
      // stay
    } else if (dbUser && dbUser.role === "shop_owner") {
      router.replace("/shopkeeper/registration");
    } else {
      router.replace("/shopkeeper/apply");
    }
  }, [user, dbUser, router]);

  if (!user || !dbUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-green-600" />
      </div>
    );
  }

  const shop = Array.isArray(shops) && shops.length > 0 ? shops[0] : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
        {/* Hero Card - Spans 2 columns on md+, full width on mobile */}
        <div className="md:col-span-2 lg:col-span-3 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-green-600 via-green-500 to-green-400 text-white shadow-xl dark:shadow-green-900/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 h-full">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome back, {dbUser.name || "Shopkeeper"} 👋
              </h1>
              <p className="text-sm sm:text-base opacity-90">
                Here&apos;s a quick snapshot of your store performance
              </p>
            </div>
            <Link
              href="/shopkeeper/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-colors whitespace-nowrap"
            >
              Manage account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Quick Stats Card - Compact */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 dark:bg-blue-400/10">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium">Quick Stats</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">4 Metrics</p>
              </div>
            </div>
            <p className="text-xs text-blue-600/60 dark:text-blue-400/60">View all below</p>
          </div>
        </div>

        {/* Stat Cards - 4 cards in grid */}
        <StatCard
          icon={<Package className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Active Products"
          value="0"
          meta="+12% this month"
          accent="green"
        />
        <StatCard
          icon={<ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Orders Today"
          value="0"
          meta="0 pending"
          accent="blue"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Revenue"
          value="₹0"
          meta="No sales yet"
          accent="purple"
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Rating"
          value={shop?.rating ? `${shop.rating.toFixed(1)}/5` : "N/A"}
          meta="No reviews yet"
          accent="amber"
        />

        {/* Shop Card - Spans 2 columns on lg+ */}
        <div className="md:col-span-2 lg:col-span-2">
          <ShopCard shop={shop} />
        </div>

        {/* Tips Card - Spans 1 column, taller */}
        <div className="md:col-span-1 lg:col-span-1 md:row-span-2">
          <TipsCard />
        </div>

        {/* Low Stock Alert */}
        <div className="md:col-span-2">
          <LowStockAlert />
        </div>

        {/* Support Card - Compact */}
        <div className="rounded-3xl p-5 sm:p-6 border bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 dark:border-neutral-800 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
              <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm sm:text-base mb-1 text-neutral-900 dark:text-neutral-100">
                Support
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Need help? Reach out to{" "}
                <a
                  href="mailto:support@mohallamart.com"
                  className="text-green-600 dark:text-green-400 hover:underline font-medium"
                >
                  support@mohallamart.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards - 3 cards in a row */}
        <div className="md:col-span-1">
          <ActionCard
            icon={<FileText className="h-6 w-6 sm:h-7 sm:w-7" />}
            title="Registration"
            description="Business compliance"
            href="/shopkeeper/registration"
            color="green"
          />
        </div>
        <div className="md:col-span-1">
          <ActionCard
            icon={<ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />}
            title="View Orders"
            description="Track purchases"
            href="/shopkeeper/profile"
            color="blue"
          />
        </div>
        <div className="md:col-span-1">
          <ActionCard
            icon={<Package className="h-6 w-6 sm:h-7 sm:w-7" />}
            title="Manage Products"
            description="Add/Edit items"
            href="/shopkeeper/shop/products"
            color="purple"
          />
        </div>
      </div>
    </div>
  );
}
