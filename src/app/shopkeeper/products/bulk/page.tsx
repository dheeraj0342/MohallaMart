"use client";

import ShopkeeperGuard from "../../_components/ShopkeeperGuard";
import BulkUploadContent from "./BulkUploadContent";

export default function BulkUploadPage() {
  return (
    <ShopkeeperGuard>
      <BulkUploadContent />
    </ShopkeeperGuard>
  );
}
