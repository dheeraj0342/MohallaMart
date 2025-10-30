"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

type DBUser = {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
};

export default function UserProfilePage() {
  const { user } = useAuth();
  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as DBUser | null | undefined;
  const updateUser = useMutation(api.users.updateUser);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<"email" | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "security">("profile");

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
      alert("Profile updated successfully");
    } catch (error) {
      alert("Failed to update profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const copyEmail = async () => {
    if (dbUser?.email) {
      try {
        await navigator.clipboard.writeText(dbUser.email);
        setCopied("email");
        setTimeout(() => setCopied(null), 2000);
      } catch {
        // ignore
      }
    }
  };

  if (user === null || dbUser === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--neutral-50)] to-[var(--neutral-100)] flex items-center justify-center px-4">
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-8 text-center max-w-md w-full shadow-lg">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-3xl font-bold text-[var(--neutral-900)] mb-3">
            Sign In Required
          </h1>
          <p className="text-[var(--neutral-600)] mb-8 text-lg">
            Please sign in to access and manage your profile.
          </p>
          <button className="w-full px-6 py-3 rounded-xl bg-[var(--primary-brand)] hover:bg-[var(--primary-hover)] text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--neutral-50)] to-[var(--neutral-100)]">
      {/* Modern Header with Glass Effect */}
      <div className="relative bg-gradient-to-r from-[var(--primary-brand)] via-[var(--primary-brand)]/90 to-[var(--secondary-brand)] text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar Section */}
              <div className="relative">
                <div className="h-32 w-32 rounded-3xl bg-white/20 border-4 border-white/30 overflow-hidden flex items-center justify-center backdrop-blur-sm shadow-2xl">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">👤</span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-[var(--success-bg-light)] border-4 border-white flex items-center justify-center">
                  <span className="text-[var(--success-fg)] text-sm">✓</span>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {name || "Your Profile"}
                </h1>
                <p className="text-white/90 text-lg mb-4">
                  Welcome back! Manage your account and preferences
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                    Active User
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                    <span>📧</span>
                    {dbUser?.email}
                  </span>
                  {phone && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                      <span>📱</span>
                      {phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm sticky top-8">
              <h3 className="text-lg font-bold text-[var(--neutral-900)] mb-4">Account</h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                    activeTab === "profile"
                      ? "bg-[var(--primary-brand)] text-white shadow-lg"
                      : "text-[var(--neutral-700)] hover:bg-[var(--neutral-50)]"
                  }`}
                >
                  <span className="text-xl">👤</span>
                  <span className="font-medium">Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                    activeTab === "settings"
                      ? "bg-[var(--primary-brand)] text-white shadow-lg"
                      : "text-[var(--neutral-700)] hover:bg-[var(--neutral-50)]"
                  }`}
                >
                  <span className="text-xl">⚙️</span>
                  <span className="font-medium">Settings</span>
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                    activeTab === "security"
                      ? "bg-[var(--primary-brand)] text-white shadow-lg"
                      : "text-[var(--neutral-700)] hover:bg-[var(--neutral-50)]"
                  }`}
                >
                  <span className="text-xl">🔒</span>
                  <span className="font-medium">Security</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Profile Overview Card */}
                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[var(--neutral-900)]">Profile Overview</h2>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] transition">
                        📤 Share
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-[var(--primary-brand)] text-white hover:bg-[var(--primary-hover)] transition">
                        ✏️ Edit
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--neutral-700)] mb-2">
                          Full Name
                        </label>
                        <div className="p-4 bg-[var(--neutral-50)] rounded-xl border border-[var(--color-border)]">
                          <span className="text-[var(--neutral-900)] font-medium">{name || "Not set"}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--neutral-700)] mb-2">
                          Phone Number
                        </label>
                        <div className="p-4 bg-[var(--neutral-50)] rounded-xl border border-[var(--color-border)]">
                          <span className="text-[var(--neutral-900)] font-medium">{phone || "Not set"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--neutral-700)] mb-2">
                          Email Address
                        </label>
                        <div className="p-4 bg-[var(--neutral-50)] rounded-xl border border-[var(--color-border)] flex items-center justify-between">
                          <span className="text-[var(--neutral-900)] font-medium">{dbUser?.email}</span>
                          <button
                            onClick={copyEmail}
                            className="px-3 py-1 rounded-lg bg-white hover:bg-[var(--neutral-100)] border border-[var(--color-border)] text-sm transition"
                          >
                            {copied === "email" ? "✓ Copied" : "📋 Copy"}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--neutral-700)] mb-2">
                          Account Status
                        </label>
                        <div className="p-4 bg-[var(--success-bg-light)] rounded-xl border border-[var(--success-fg)]/20">
                          <span className="text-[var(--success-fg)] font-medium flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[var(--success-fg)] animate-pulse"></span>
                            Active & Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm text-center">
                    <div className="text-3xl mb-2">🛒</div>
                    <div className="text-2xl font-bold text-[var(--neutral-900)] mb-1">0</div>
                    <div className="text-sm text-[var(--neutral-600)]">Total Orders</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm text-center">
                    <div className="text-3xl mb-2">❤️</div>
                    <div className="text-2xl font-bold text-[var(--neutral-900)] mb-1">0</div>
                    <div className="text-sm text-[var(--neutral-600)]">Wishlist Items</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm text-center">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="text-2xl font-bold text-[var(--neutral-900)] mb-1">—</div>
                    <div className="text-sm text-[var(--neutral-600)]">Average Rating</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-[var(--neutral-900)] mb-6">Edit Profile</h2>
                  
                  <form onSubmit={onSave} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--neutral-700)] mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--primary-brand)] focus:ring-2 focus:ring-[var(--primary-brand)]/10 transition bg-white text-[var(--neutral-900)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--neutral-700)] mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--primary-brand)] focus:ring-2 focus:ring-[var(--primary-brand)]/10 transition bg-white text-[var(--neutral-900)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--neutral-700)] mb-2">
                        Avatar URL
                      </label>
                      <input
                        type="url"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://example.com/avatar.png"
                        className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--primary-brand)] focus:ring-2 focus:ring-[var(--primary-brand)]/10 transition bg-white text-[var(--neutral-900)]"
                      />
                      {avatar && (
                        <div className="mt-4 p-4 bg-[var(--neutral-50)] rounded-xl flex items-center gap-4 border border-[var(--color-border)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={avatar}
                            alt="Avatar Preview"
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                          <div>
                            <div className="text-sm text-[var(--neutral-600)] font-semibold">Preview</div>
                            <div className="text-sm text-[var(--neutral-900)] font-medium truncate max-w-xs">
                              {avatar}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-[var(--color-border)] flex gap-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-6 py-3 rounded-xl bg-[var(--primary-brand)] hover:bg-[var(--primary-hover)] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        {saving ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Saving…
                          </>
                        ) : (
                          <>
                            <span>💾</span>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="px-6 py-3 rounded-xl border-2 border-[var(--color-border)] hover:bg-[var(--neutral-50)] text-[var(--neutral-900)] font-semibold transition"
                      >
                        🔄 Reset
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-[var(--neutral-900)] mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-[var(--info-bg-light)] rounded-xl border border-[var(--info-fg)]/20">
                      <div className="flex items-start gap-4">
                        <span className="text-2xl">🔐</span>
                        <div>
                          <h3 className="font-semibold text-[var(--info-fg)] text-lg mb-2">Password Security</h3>
                          <p className="text-[var(--neutral-700)] mb-4">
                            Keep your account secure with a strong password. Change it regularly for better security.
                          </p>
                          <button className="px-4 py-2 rounded-lg bg-[var(--info-fg)] text-white hover:bg-[var(--info-fg)]/90 transition">
                            Change Password
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-[var(--warning-bg-light)] rounded-xl border border-[var(--warning-fg)]/20">
                      <div className="flex items-start gap-4">
                        <span className="text-2xl">📱</span>
                        <div>
                          <h3 className="font-semibold text-[var(--warning-fg)] text-lg mb-2">Two-Factor Authentication</h3>
                          <p className="text-[var(--neutral-700)] mb-4">
                            Add an extra layer of security to your account with 2FA.
                          </p>
                          <button className="px-4 py-2 rounded-lg bg-[var(--warning-fg)] text-white hover:bg-[var(--warning-fg)]/90 transition">
                            Enable 2FA
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-[var(--error-bg-light)] rounded-xl border border-[var(--error-fg)]/20">
                      <div className="flex items-start gap-4">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <h3 className="font-semibold text-[var(--error-fg)] text-lg mb-2">Danger Zone</h3>
                          <p className="text-[var(--neutral-700)] mb-4">
                            Permanently delete your account and all associated data.
                          </p>
                          <button className="px-4 py-2 rounded-lg bg-(--error-fg) text-white hover:bg-[var(--error-fg)]/90 transition">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}