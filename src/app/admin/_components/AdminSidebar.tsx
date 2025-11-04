"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Dashboard",
    items: [
      {
        href: "/admin",
        label: "Overview",
        description: "Today's marketplace pulse",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        href: "/admin/registrations",
        label: "Registrations",
        description: "Review incoming sellers",
        icon: ClipboardList,
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-3xl border border-[#dce8e1] bg-white/95 p-6 shadow-2xl shadow-primary-brand/10 backdrop-blur-sm md:max-h-[calc(100vh-6rem)] md:overflow-y-auto lg:sticky lg:top-12 lg:w-72">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-brand/15 text-primary-brand">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-brand/80">
            MohallaMart
          </p>
          <h2 className="text-lg font-bold text-[#1f2a33]">Admin Console</h2>
        </div>
      </div>

      <nav aria-label="Admin navigation" className="mt-8 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
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
                        ? "border-primary-brand/40 bg-primary-brand/10 text-primary-brand shadow-lg shadow-primary-brand/10"
                        : "border-transparent bg-[#f7faf9] text-[#1f2a33] hover:-translate-y-px hover:border-primary-brand/30 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isActive
                            ? "bg-primary-brand text-white"
                            : "bg-white text-primary-brand"
                        }`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-xs text-neutral-500 group-hover:text-neutral-600">
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
        <div className="rounded-2xl bg-[#f5faf7] p-4 text-sm text-neutral-600">
          <p className="font-semibold text-[#1f2a33]">Session controls</p>
          <p className="mt-1 text-xs">
            Need to switch accounts? Manage your admin session from the login screen.
          </p>
          <Link
            href="/admin/login"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-secondary-brand px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-secondary-brand/30 transition-all hover:bg-secondary-brand/90"
          >
            <LogOut className="h-4 w-4" />
            Manage session
          </Link>
        </div>

        <div className="rounded-2xl border border-dashed border-primary-brand/30 p-4 text-xs text-neutral-500">
          <p className="font-semibold text-[#1f2a33]">Need a new tool?</p>
          <p className="mt-1">
            Chat with the product team if you require additional admin capabilities.
          </p>
          <a
            href="mailto:team@mohallamart.com?subject=Admin%20Panel%20Request"
            className="mt-2 inline-flex items-center gap-2 font-semibold text-primary-brand transition-colors hover:text-primary-hover"
          >
            Request update
          </a>
        </div>
      </div>
    </aside>
  );
}
