"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LifeBuoy,
  LogOut,
  Store,
  LayoutDashboard,
  User,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Store HQ",
    items: [
      {
        href: "/shopkeeper/dashboard",
        label: "Dashboard",
        description: "Performance snapshots & alerts",
        icon: LayoutDashboard,
      },
      {
        href: "/shopkeeper/profile",
        label: "Profile",
        description: "Business details & storefront",
        icon: Store,
      },
    ],
  },
  {
    title: "Onboarding",
    items: [
      {
        href: "/shopkeeper/registration",
        label: "Registration",
        description: "Finish compliance paperwork",
        icon: ClipboardList,
      },
    ],
  },
];

const supportLinks = [
  {
    label: "Help centre",
    href: "mailto:support@mohallamart.com?subject=Shopkeeper%20Support",
  },
  {
    label: "Community chat",
    href: "https://mohallamart.com/community",
  },
];

export default function ShopkeeperSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-3xl border border-[#e5efe8] bg-white/95 p-6 shadow-2xl shadow-primary-brand/10 backdrop-blur-sm md:max-h-[calc(100vh-6rem)] md:overflow-y-auto lg:sticky lg:top-12 lg:w-72 dark:border-[#1f2a33] dark:bg-[#11181d]">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-brand/15 text-primary-brand">
          <Store className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-brand/80">
            MohallaMart
          </p>
          <h2 className="text-lg font-bold text-[#1f2a33] dark:text-[#f3f6fb]">
            Seller Hub
          </h2>
        </div>
      </div>

      <nav aria-label="Shopkeeper navigation" className="mt-8 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              {section.title}
            </p>
            <div className="space-y-2">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group block rounded-2xl border px-4 py-3 transition-all ${
                      isActive
                        ? "border-primary-brand/40 bg-primary-brand/10 text-primary-brand shadow-lg shadow-primary-brand/15"
                        : "border-transparent bg-[#f7faf9] text-[#1f2a33] hover:-translate-y-px hover:border-primary-brand/30 hover:bg-white dark:bg-[#141c22] dark:text-[#e2e8f0] dark:hover:border-primary-brand/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isActive
                            ? "bg-primary-brand text-white"
                            : "bg-white text-primary-brand dark:bg-[#1b242b]"
                        }`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold">
                          {item.label}
                        </p>
                        <p className="text-xs text-neutral-500 group-hover:text-neutral-600 dark:text-neutral-400 dark:group-hover:text-neutral-300">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-10 space-y-4">
        <div className="rounded-2xl bg-linear-to-br from-primary-brand via-[#1f8f4e] to-secondary-brand p-5 text-white shadow-xl">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <LifeBuoy className="h-4 w-4" />
            Need assistance?
          </div>
          <p className="mt-2 text-xs text-white/80">
            Our seller success team is available 7 days a week.
          </p>
          <ul className="mt-3 space-y-2 text-xs">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="inline-flex items-center gap-2 font-semibold text-white underline-offset-4 transition-colors hover:underline"
                >
                  <User className="h-3.5 w-3.5" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-dashed border-primary-brand/30 p-4 text-xs text-neutral-600 dark:border-primary-brand/40 dark:text-neutral-400">
          <p className="font-semibold text-[#1f2a33] dark:text-[#f3f6fb]">
            Session controls
          </p>
          <p className="mt-1">
            Sign out or switch accounts via the shopkeeper login screen.
          </p>
          <Link
            href="/shopkeeper/login"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary-brand px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-primary-brand/30 transition-all hover:bg-primary-hover"
          >
            <LogOut className="h-4 w-4" />
            Manage session
          </Link>
        </div>
      </div>
    </aside>
  );
}
