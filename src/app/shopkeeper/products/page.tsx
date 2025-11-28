"use client";

import ShopkeeperGuard from "../_components/ShopkeeperGuard";
import ProductsContent from "./ProductsContent";

export default function ShopkeeperProductsPage() {
  return (
    <ShopkeeperGuard>
      <div className="p-4 sm:p-6 lg:p-8">
        <ProductsContent />
      </div>
    </ShopkeeperGuard>
  );
}

