"use client";

import ShopkeeperGuard from "../_components/ShopkeeperGuard";
import DashboardContent from "./DashboardContent";

export default function ShopkeeperDashboardPage() {
  return (
    <ShopkeeperGuard>
      <DashboardContent />
    </ShopkeeperGuard>
  );
}

