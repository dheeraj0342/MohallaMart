export default function ShopkeeperDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">
        Shopkeeper Dashboard
      </h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Orders Today</div>
          <div className="text-2xl font-semibold">0</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Active Products</div>
          <div className="text-2xl font-semibold">0</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Revenue</div>
          <div className="text-2xl font-semibold text-[var(--color-secondary)]">
            ₹0
          </div>
        </div>
      </div>
    </div>
  );
}
