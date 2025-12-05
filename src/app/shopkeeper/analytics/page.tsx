"use client";

import ShopkeeperGuard from "../_components/ShopkeeperGuard";
import AnalyticsContent from "./AnalyticsContent";

export default function AnalyticsPage() {
  return (
    <ShopkeeperGuard>
      <AnalyticsContent />
    </ShopkeeperGuard>
  );
}
