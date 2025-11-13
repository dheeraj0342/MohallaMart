"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const SIDEBAR_PATHS = [
  "/admin",
  "/admin/registrations",
  "/admin/users",
  "/admin/login",
];

export default function AdminLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = SIDEBAR_PATHS.some((p) => pathname.startsWith(p));

  if (!showSidebar) return <>{children}</>;

  return (
    <SidebarProvider>
      <AdminSidebar />

      <SidebarInset>
        <AdminHeader />

        <main className="p-3 sm:p-4 pt-4 sm:pt-6 flex flex-col gap-4 sm:gap-6 min-w-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

