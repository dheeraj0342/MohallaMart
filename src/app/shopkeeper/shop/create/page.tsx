"use client";

import ShopkeeperGuard from "../../_components/ShopkeeperGuard";
import CreateShopContent from "./CreateShopContent";

export default function CreateShopPage() {
  return (
    <ShopkeeperGuard>
      <CreateShopContent />
    </ShopkeeperGuard>
  );
}

