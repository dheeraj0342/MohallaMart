"use client";

import ShopkeeperGuard from "../../_components/ShopkeeperGuard";
import ShopProductsContent from "./ShopProductsContent";

export default function ShopProductsPage() {
  return (
    <ShopkeeperGuard>
      <ShopProductsContent />
    </ShopkeeperGuard>
  );
}

