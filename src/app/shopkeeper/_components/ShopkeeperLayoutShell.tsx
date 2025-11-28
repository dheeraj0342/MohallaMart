"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import ShopkeeperSidebar from "./ShopkeeperSidebar";
import ShopkeeperHeader from "./ShopkeeperHeader";

const SIDEBAR_PATHS = [
  "/shopkeeper/dashboard",
  "/shopkeeper/profile",
  "/shopkeeper/products",
  "/shopkeeper/registration",
  "/shopkeeper/shop",
];

export default function ShopkeeperLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = SIDEBAR_PATHS.some((p) => pathname.startsWith(p));

  if (!showSidebar) return <>{children}</>;

  return (
    <SidebarProvider>
      <ShopkeeperSidebar />

      <SidebarInset>
        <ShopkeeperHeader />

        <main className="p-3 sm:p-4 pt-4 sm:pt-6 flex flex-col gap-4 sm:gap-6 min-w-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
