import type { ReactNode } from "react";
import ShopkeeperLayoutShell from "./_components/ShopkeeperLayoutShell";
import { Toaster } from "@/components/ui/sonner";

export default function ShopkeeperLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <ShopkeeperLayoutShell>
        {children}
      </ShopkeeperLayoutShell>
      <Toaster />
    </section>
  );
}
