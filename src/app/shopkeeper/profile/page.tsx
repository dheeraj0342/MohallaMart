"use client";

import ShopkeeperGuard from "../_components/ShopkeeperGuard";
import ProfileContent from "./ProfileContent";

export default function ShopkeeperProfilePage() {
  return (
    <ShopkeeperGuard>
      <ProfileContent />
    </ShopkeeperGuard>
  );
}

