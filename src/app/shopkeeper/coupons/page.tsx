"use client";

import ShopkeeperGuard from "../_components/ShopkeeperGuard";
import CouponsContent from "./CouponsContent";

export default function CouponsPage() {
  return (
    <ShopkeeperGuard>
      <CouponsContent />
    </ShopkeeperGuard>
  );
}
