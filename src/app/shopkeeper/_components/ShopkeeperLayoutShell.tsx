"use client";

import { usePathname } from "next/navigation";
import ShopkeeperSidebar from "./ShopkeeperSidebar";

const sidebarPaths = [
  "/shopkeeper/dashboard",
  "/shopkeeper/profile",
  "/shopkeeper/registration",
];

type Props = {
  children: React.ReactNode;
};

export default function ShopkeeperLayoutShell({ children }: Props) {
  const pathname = usePathname();
  const showSidebar = sidebarPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      <div className="flex flex-col gap-6 lg:flex-row">
        <ShopkeeperSidebar />
        <main className="flex-1 rounded-3xl border border-[#e5efe8] bg-white/95 p-6 sm:p-8 shadow-2xl shadow-primary-brand/10 backdrop-blur-sm dark:border-[#1f2a33] dark:bg-[#11181d]">
          {children}
        </main>
      </div>
    </div>
  );
}
