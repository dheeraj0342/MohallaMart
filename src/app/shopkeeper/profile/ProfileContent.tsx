"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { useToast } from "@/hooks/useToast";

type ShopAddress = {
  city?: string;
  state?: string;
  street?: string;
  pincode?: string;
};

type Shop = {
  _id: Id<"shops">;
  name: string;
  address: ShopAddress;
  rating: number;
  logo_url?: string;
};

type ShopStats = {
  total_orders: number;
  cancelled_orders: number;
  delivered_orders: number;
  average_order_value: number;
};

type Product = {
  _id: Id<"products">;
  is_available: boolean;
};

type Registration = {
  pan?: string;
  gstin?: string;
  business?: { type?: string };
  status?: "approved" | "pending" | "rejected";
  address?: ShopAddress;
  pickup_address?: ShopAddress;
};

type DBUser = {
  _id: Id<"users">;
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
};

export default function ProfileContent() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as DBUser | null | undefined;
  const updateUser = useMutation(api.users.updateUser);
  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser ? { owner_id: dbUser._id, is_active: true } : "skip",
  ) as Shop[] | null | undefined;
  const shop = Array.isArray(shops) && shops.length > 0 ? shops[0] : null;
  const shopStats = useQuery(
    api.shops.getShopStats,
    shop ? { id: shop._id } : "skip",
  ) as ShopStats | null | undefined;
  const products = useQuery(
    api.products.getProductsByShop,
    shop ? { shop_id: shop._id } : "skip",
  ) as Product[] | null | undefined;
  const registration = useQuery(
    api.registrations.getMyRegistration,
    user ? { userId: user.id } : "skip",
  ) as Registration | null | undefined;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "seller" | "registration"
  >("overview");

  useEffect(() => {
    if (dbUser) {
      setName(dbUser.name || "");
      setPhone(dbUser.phone || "");
      setAvatar(dbUser.avatar_url || "");
    }
  }, [dbUser]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateUser({ id: user.id, name, phone, avatar_url: avatar });
      success("Profile updated successfully");
    } catch (err) {
      error("Failed to update profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Guard handles loading and auth checks, so we can safely assume user and dbUser exist here
  if (!user || !dbUser) {
    return null;
  }

  const totalOrders = shopStats?.total_orders || 0;
  const cancelledOrders = shopStats?.cancelled_orders || 0;
  const deliveredOrders = shopStats?.delivered_orders || 0;
  const fulfilmentRate =
    totalOrders > 0
      ? Math.round(((totalOrders - cancelledOrders) / totalOrders) * 100)
      : 0;
  const cancellationRate =
    totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;
  const avgOrderValue = shopStats?.average_order_value
    ? Math.round(shopStats.average_order_value)
    : 0;
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const activeProducts = Array.isArray(products)
    ? products.filter((p) => p.is_available).length
    : 0;
  const inactiveProducts = totalProducts - activeProducts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--neutral-50)] to-[var(--neutral-100)]">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[var(--primary-brand)] to-[var(--primary-brand)]/80 text-white pt-12 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-start justify-between gap-6 mb-8">
            {/* Shop info */}
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-2xl bg-white/20 border-2 border-white/40 overflow-hidden flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt="Shop Logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">🏪</span>
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {shop?.name || name || "Your Shop"}
                </h1>
                <p className="text-white/80 mt-1">
                  {shop?.address?.city || "City"},{" "}
                  {shop?.address?.state || "State"}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  {dbUser?.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-400/30 text-emerald-100 border border-emerald-400/50">
                      <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse"></span>
                      Verified Seller
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400/30 text-amber-100 border border-amber-400/50">
                      ⏳ Pending Approval
                    </span>
                  )}
                  {shop?.rating ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-400/30 text-blue-100 border border-blue-400/50">
                      ⭐ {shop.rating.toFixed(1)} / 5.0
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-col gap-2">
              <button className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium text-sm backdrop-blur-sm border border-white/30 transition">
                📊 Analytics
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium text-sm backdrop-blur-sm border border-white/30 transition">
                ⚙️ Settings
              </button>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 border-b border-white/20">
            {(["overview", "seller", "registration"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition ${
                  activeTab === tab
                    ? "border-white text-white"
                    : "border-transparent text-white/70 hover:text-white"
                }`}
              >
                {tab === "overview" && "📊 Overview"}
                {tab === "seller" && "👤 Seller Info"}
                {tab === "registration" && "📋 Registration"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* KPI Cards */}
            <div>
              <h2 className="text-lg font-semibold text-[var(--neutral-900)] mb-4 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Performance Metrics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  label="Total Orders"
                  value={totalOrders}
                  icon="📦"
                />
                <MetricCard
                  label="Delivered"
                  value={deliveredOrders}
                  icon="✅"
                />
                <MetricCard
                  label="Fulfilment Rate"
                  value={`${fulfilmentRate}%`}
                  icon="🎯"
                  color={fulfilmentRate < 90 ? "warning" : "success"}
                />
                <MetricCard
                  label="Cancellation Rate"
                  value={`${cancellationRate}%`}
                  icon="⚠️"
                  color="error"
                />
                <MetricCard
                  label="Avg Order Value"
                  value={`₹${avgOrderValue}`}
                  icon="💰"
                />
                <MetricCard
                  label="Active Products"
                  value={activeProducts}
                  icon="📷"
                  color="success"
                />
                <MetricCard
                  label="Inactive Products"
                  value={inactiveProducts}
                  icon="🔒"
                  color="warning"
                />
                <MetricCard
                  label="Rating"
                  value={shop?.rating?.toFixed(1) ?? "—"}
                  icon="⭐"
                />
              </div>
            </div>

            {/* Account Health & Store Info */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--neutral-900)] mb-4 flex items-center gap-2">
                  <span>🏬</span> Public Store Info
                </h3>
                <div className="space-y-3">
                  <InfoRow
                    label="Store Name"
                    value={shop?.name || name || "—"}
                  />
                  <InfoRow
                    label="Location"
                    value={`${shop?.address?.city || "—"}, ${shop?.address?.state || "—"}`}
                  />
                  <InfoRow
                    label="Rating"
                    value={`${shop?.rating?.toFixed?.(1) ?? "—"} / 5.0`}
                  />
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <button className="text-sm text-[var(--primary-brand)] hover:underline font-medium">
                      → Edit Store Info
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--neutral-900)] mb-4 flex items-center gap-2">
                  <span>❤️</span> Account Health
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--neutral-600)]">
                      Fulfilment Rate
                    </span>
                    <HealthBadge
                      value={fulfilmentRate}
                      format={(v) => `${v}%`}
                      threshold={90}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--neutral-600)]">
                      Cancellation Rate
                    </span>
                    <HealthBadge
                      value={cancellationRate}
                      format={(v) => `${v}%`}
                      threshold={5}
                      inverse
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                    <span className="text-[var(--neutral-600)]">
                      Verification
                    </span>
                    <span
                      className={`font-semibold text-sm ${
                        dbUser?.is_active
                          ? "text-[var(--success-fg)]"
                          : "text-[var(--warning-fg)]"
                      }`}
                    >
                      {dbUser?.is_active ? "✓ Verified" : "⏳ Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seller Info Tab */}
        {activeTab === "seller" && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-sm max-w-2xl">
              <h2 className="text-2xl font-bold text-[var(--neutral-900)] mb-6">
                Seller Details
              </h2>
              <form onSubmit={onSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[var(--neutral-700)] mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your seller name"
                    className="w-full px-4 py-2.5 border-2 border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition text-[var(--neutral-900)] bg-[var(--neutral-50)] placeholder:text-[var(--neutral-400)]"
                    style={{
                      color: "var(--neutral-900)",
                      backgroundColor: "var(--neutral-50)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--neutral-700)] mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2.5 border-2 border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition text-[var(--neutral-900)] bg-[var(--neutral-50)] placeholder:text-[var(--neutral-400)]"
                    style={{
                      color: "var(--neutral-900)",
                      backgroundColor: "var(--neutral-50)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--neutral-700)] mb-2">
                    Logo / Avatar URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2.5 border-2 border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition text-[var(--neutral-900)] bg-[var(--neutral-50)] placeholder:text-[var(--neutral-400)]"
                    style={{
                      color: "var(--neutral-900)",
                      backgroundColor: "var(--neutral-50)",
                    }}
                  />
                  {avatar && (
                    <div className="mt-3 p-3 bg-[var(--neutral-50)] rounded-lg flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatar}
                        alt="Preview"
                        className="h-12 w-12 rounded object-cover"
                      />
                      <span className="text-sm text-[var(--neutral-600)]">
                        Preview
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <div className="text-sm text-[var(--neutral-600)] mb-4">
                    <strong>Email:</strong> {dbUser?.email}
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {saving ? "⏳ Saving…" : "💾 Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Registration Tab */}
        {activeTab === "registration" && (
          <div className="animate-in fade-in duration-300">
            {registration ? (
              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[var(--neutral-900)] flex items-center gap-2">
                    <span>📋</span> Registration Details
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5 ${
                      registration.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : registration.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {registration.status === "approved" && "✓ Approved"}
                    {registration.status === "rejected" && "✗ Rejected"}
                    {registration.status === "pending" && "⏳ Pending"}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div className="bg-[var(--neutral-50)] rounded-lg p-4 border border-[var(--color-border)]">
                      <div className="text-xs text-[var(--neutral-600)] font-semibold uppercase tracking-wider mb-1">
                        PAN
                      </div>
                      <div className="text-lg font-semibold text-[var(--neutral-900)]">
                        {registration.pan || (
                          <span className="text-[var(--neutral-400)]">—</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-[var(--neutral-50)] rounded-lg p-4 border border-[var(--color-border)]">
                      <div className="text-xs text-[var(--neutral-600)] font-semibold uppercase tracking-wider mb-1">
                        GSTIN
                      </div>
                      <div className="text-lg font-semibold text-[var(--neutral-900)]">
                        {registration.gstin || (
                          <span className="text-[var(--neutral-400)]">—</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-[var(--neutral-50)] rounded-lg p-4 border border-[var(--color-border)]">
                      <div className="text-xs text-[var(--neutral-600)] font-semibold uppercase tracking-wider mb-1">
                        Business Type
                      </div>
                      <div className="text-lg font-semibold capitalize text-[var(--neutral-900)]">
                        {registration.business?.type || (
                          <span className="text-[var(--neutral-400)]">—</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right column - Addresses */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-semibold text-[var(--neutral-900)] mb-2 flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-[var(--secondary-brand)]"></span>
                        Business Address
                      </div>
                      <div className="bg-[var(--neutral-50)] rounded-lg p-4 border border-[var(--color-border)] space-y-1">
                        <div className="font-medium text-[var(--neutral-900)]">
                          {registration.address?.street || (
                            <span className="text-[var(--neutral-400)]">—</span>
                          )}
                        </div>
                        <div className="text-sm text-[var(--neutral-600)]">
                          {registration.address?.city || "—"},{" "}
                          {registration.address?.state || "—"}{" "}
                          {registration.address?.pincode || ""}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--neutral-900)] mb-2 flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-[var(--accent-brand)]"></span>
                        Pickup Address
                      </div>
                      <div className="bg-[var(--neutral-50)] rounded-lg p-4 border border-[var(--color-border)] space-y-1">
                        <div className="font-medium text-[var(--neutral-900)]">
                          {registration.pickup_address?.street || (
                            <span className="text-[var(--neutral-400)]">—</span>
                          )}
                        </div>
                        <div className="text-sm text-[var(--neutral-600)]">
                          {registration.pickup_address?.city || "—"},{" "}
                          {registration.pickup_address?.state || "—"}{" "}
                          {registration.pickup_address?.pincode || ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                  <button className="px-4 py-2 rounded-lg bg-[var(--primary-brand)] hover:bg-[var(--primary-brand)]/90 text-white font-semibold text-sm transition">
                    ✎ Edit Registration
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-lg font-semibold text-[var(--neutral-900)] mb-2">
                  No Registration Found
                </h3>
                <p className="text-[var(--neutral-600)] mb-4">
                  Complete your business registration to unlock seller features.
                </p>
                <button className="px-4 py-2 rounded-lg bg-[var(--primary-brand)] hover:bg-[var(--primary-brand)]/90 text-white font-semibold">
                  Start Registration
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* Helper Components */

function MetricCard({
  label,
  value,
  icon,
  color = "default",
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: "success" | "warning" | "error" | "default";
}) {
  const colorClasses = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
    error: "bg-red-50 border-red-200 text-red-700",
    default: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div
      className={`rounded-xl border-2 p-4 ${colorClasses[color]} transition hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider opacity-75">
            {label}
          </div>
          <div className="text-2xl md:text-3xl font-bold mt-2">{value}</div>
        </div>
        <span className="text-2xl opacity-75">{icon}</span>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[var(--neutral-600)]">{label}</span>
      <span className="font-semibold text-[var(--neutral-900)]">{value}</span>
    </div>
  );
}

function HealthBadge({
  value,
  format,
  threshold,
  inverse = false,
}: {
  value: number;
  format: (v: number) => string;
  threshold: number;
  inverse?: boolean;
}) {
  const isHealthy = inverse ? value <= threshold : value >= threshold;
  return (
    <span
      className={`font-semibold text-sm ${
        isHealthy ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {format(value)}
    </span>
  );
}