"use client";

import { CheckCircle2, Clock, ShoppingCart, Store, ShieldCheck, Truck, Bell } from "lucide-react";

interface Feature {
  name: string;
  status: "implemented" | "pending";
  description?: string;
}

interface FeatureCategory {
  category: string;
  icon: React.ReactNode;
  features: Feature[];
}

const featureData: FeatureCategory[] = [
  {
    category: "User Side (Customer)",
    icon: <ShoppingCart className="h-6 w-6" />,
    features: [
      { name: "User Registration & Login", status: "implemented", description: "OTP-based authentication via Supabase" },
      { name: "Browse Shops", status: "implemented", description: "View all shops with filtering" },
      { name: "Shop Details Page", status: "implemented", description: "View shop info, products, and details" },
      { name: "Product Browsing", status: "implemented", description: "Browse products by category and shop" },
      { name: "Shopping Cart", status: "implemented", description: "Add/remove items, view cart" },
      { name: "Search Products & Shops", status: "implemented", description: "Search functionality with Typesense" },
      { name: "Category Filtering", status: "implemented", description: "Filter shops by hierarchical categories" },
      { name: "Location-based Shop Discovery", status: "implemented", description: "Find nearby shops by location" },
      { name: "Image Modal/Viewer", status: "implemented", description: "View images in full-screen modal" },
      { name: "Dark/Light Theme", status: "implemented", description: "Theme switching support" },
      { name: "User Profile", status: "implemented", description: "View and edit profile" },
      { name: "Checkout & Payment", status: "implemented", description: "Complete checkout flow with address, payment method selection, and order creation" },
      { name: "Order Tracking", status: "implemented", description: "Real-time order tracking with live map, status timeline, and ETA updates" },
      { name: "Delivery ETA System", status: "implemented", description: "Blinkit-style ETA calculation with distance, peak hours, and store capacity" },
      { name: "Notifications", status: "implemented", description: "In-app notifications with bell icon, real-time updates via Convex, email/SMS placeholders" },
      { name: "Delivery Address Management", status: "implemented", description: "Location selection with Leaflet map, address form, and geocoding" },
      { name: "Order History", status: "pending", description: "View past orders with filters" },
      { name: "Wishlist/Favorites", status: "pending", description: "Save favorite products/shops" },
      { name: "Product Reviews & Ratings", status: "pending", description: "Rate and review products" },
    ],
  },
  {
    category: "Shopkeeper Side",
    icon: <Store className="h-6 w-6" />,
    features: [
      { name: "Shopkeeper Registration", status: "implemented", description: "Apply to become a shopkeeper" },
      { name: "Shopkeeper Login", status: "implemented", description: "Authentication for shopkeepers" },
      { name: "Shop Creation", status: "implemented", description: "Create and manage shop details" },
      { name: "Shop Profile Management", status: "implemented", description: "Edit shop name, description, address" },
      { name: "Business Hours Setup", status: "implemented", description: "Set opening/closing times" },
      { name: "Shop Logo Upload", status: "implemented", description: "Upload shop logo/image" },
      { name: "Category Selection", status: "implemented", description: "Select multiple shop categories" },
      { name: "Product Management", status: "implemented", description: "Add, edit, delete products" },
      { name: "Product Image Upload", status: "implemented", description: "Direct image upload with optimization" },
      { name: "Hierarchical Category Selection", status: "implemented", description: "Select categories with sub-categories" },
      { name: "Product Stock Management", status: "implemented", description: "Track inventory and stock levels" },
      { name: "Product Pricing", status: "implemented", description: "Set prices with discounts" },
      { name: "Shop Dashboard", status: "implemented", description: "View shop statistics and overview" },
      { name: "Shop Products View", status: "implemented", description: "View all products in shop" },
      { name: "Product Availability Toggle", status: "implemented", description: "Show/hide products" },
      { name: "Shopkeeper Profile", status: "implemented", description: "Manage shopkeeper profile" },
      { name: "Order Management", status: "implemented", description: "View orders, accept orders, assign riders, and manage order status" },
      { name: "Inventory Management", status: "implemented", description: "Complete inventory system with stock tracking, low stock alerts, and auto-deduction" },
      { name: "Inventory Alerts", status: "implemented", description: "Low stock and out-of-stock notifications on dashboard" },
      { name: "Rider Assignment", status: "implemented", description: "Manually assign riders to orders with availability checking" },
      { name: "Sales Analytics", status: "pending", description: "View sales reports and analytics" },
      { name: "Bulk Product Operations", status: "pending", description: "Import/export products" },
      { name: "Product Variants", status: "pending", description: "Manage product sizes, colors, etc." },
      { name: "Delivery Zone Management", status: "pending", description: "Set delivery areas and charges" },
    ],
  },
  {
    category: "Admin Side",
    icon: <ShieldCheck className="h-6 w-6" />,
    features: [
      { name: "Admin Login", status: "implemented", description: "Secure admin authentication" },
      { name: "Admin Dashboard", status: "implemented", description: "Overview of platform statistics" },
      { name: "User Management", status: "implemented", description: "View all users, change roles" },
      { name: "User Activation/Deactivation", status: "implemented", description: "Enable/disable user accounts" },
      { name: "Registration Review", status: "implemented", description: "Review shopkeeper applications" },
      { name: "Approve/Reject Registrations", status: "implemented", description: "Manage registration status" },
      { name: "View All Registrations", status: "implemented", description: "Filter by status, view details" },
      { name: "Shopkeeper Management", status: "implemented", description: "Approve/disable shopkeepers" },
      { name: "Audit Logs", status: "implemented", description: "Track admin actions" },
      { name: "Order Management", status: "implemented", description: "View and manage all orders across the platform" },
      { name: "Rider Management", status: "implemented", description: "View and manage delivery riders" },
      { name: "Shop Management", status: "pending", description: "Edit/delete shops directly" },
      { name: "Product Moderation", status: "pending", description: "Review and approve products" },
      { name: "Category Management", status: "pending", description: "Create/edit/delete categories" },
      { name: "Content Moderation", status: "pending", description: "Review shop/product content" },
      { name: "Analytics Dashboard", status: "pending", description: "Advanced analytics and reports" },
      { name: "Bulk Operations", status: "pending", description: "Bulk approve/reject operations" },
      { name: "Email Notifications", status: "pending", description: "Send notifications to users" },
      { name: "System Configuration", status: "pending", description: "Manage platform settings" },
    ],
  },
  {
    category: "Rider Side (Delivery Partners)",
    icon: <Truck className="h-6 w-6" />,
    features: [
      { name: "Rider Registration", status: "implemented", description: "Create rider profile linked to user account" },
      { name: "Rider Login", status: "implemented", description: "Authentication for delivery riders" },
      { name: "Rider Dashboard", status: "implemented", description: "View assigned orders and manage delivery status" },
      { name: "Live Location Tracking", status: "implemented", description: "Auto-update location every 5 seconds when online" },
      { name: "Order Status Updates", status: "implemented", description: "Update order status: Start Pickup, Out for Delivery, Delivered" },
      { name: "Online/Offline Toggle", status: "implemented", description: "Toggle availability status" },
      { name: "Real-time Notifications", status: "implemented", description: "Receive notifications for new order assignments" },
      { name: "Delivery History", status: "pending", description: "View past deliveries and earnings" },
      { name: "Earnings Dashboard", status: "pending", description: "Track earnings and payments" },
    ],
  },
  {
    category: "Core Systems",
    icon: <Bell className="h-6 w-6" />,
    features: [
      { name: "Notification System", status: "implemented", description: "Complete notification system with DB, WebSocket (Convex), email/SMS placeholders" },
      { name: "Order Lifecycle Management", status: "implemented", description: "Full order flow: PLACED → ACCEPTED → ASSIGNED → OUT_FOR_DELIVERY → DELIVERED" },
      { name: "Stock Management", status: "implemented", description: "Auto stock deduction on order, stock validation, low stock alerts" },
      { name: "Location & ETA System", status: "implemented", description: "Haversine distance calculation, Blinkit-style ETA, peak hour detection" },
      { name: "Real-time Updates", status: "implemented", description: "Convex subscriptions for real-time data sync" },
      { name: "WebSocket/SSE Location Tracking", status: "implemented", description: "Server-Sent Events for real-time rider location broadcasting" },
      { name: "Multi-tenant Architecture", status: "implemented", description: "Shopkeeper-based multi-tenant system" },
      { name: "Role-Based Access Control", status: "implemented", description: "USER, SHOPKEEPER, ADMIN, RIDER roles with permissions" },
      { name: "Background Jobs (Inngest)", status: "implemented", description: "Event-driven background jobs for notifications and sync" },
    ],
  },
];

export default function FeaturesPage() {
  const getStatusIcon = (status: "implemented" | "pending") => {
    if (status === "implemented") {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    return <Clock className="h-5 w-5 text-red-600" />;
  };

  const getStatusBadge = (status: "implemented" | "pending") => {
    if (status === "implemented") {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 border border-green-300">
          IMPLEMENTED
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800 border border-red-300">
        PENDING
      </span>
    );
  };

  const totalImplemented = featureData.reduce(
    (sum, cat) => sum + cat.features.filter((f) => f.status === "implemented").length,
    0
  );
  const totalPending = featureData.reduce(
    (sum, cat) => sum + cat.features.filter((f) => f.status === "pending").length,
    0
  );
  const totalFeatures = totalImplemented + totalPending;
  const implementationRate = ((totalImplemented / totalFeatures) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Feature Implementation Status</h1>
          <p className="text-lg text-muted-foreground mb-8">MohallaMart Platform Features</p>

          {/* Statistics */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="bg-[var(--success-bg-light)] border-2 border-green-300 dark:border-green-700 rounded-lg px-6 py-4">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalImplemented}</div>
              <div className="text-sm text-green-700 dark:text-green-300 font-medium">Implemented</div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-700 rounded-lg px-6 py-4">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{totalPending}</div>
              <div className="text-sm text-red-700 dark:text-red-300 font-medium">Pending</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg px-6 py-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalFeatures}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Features</div>
            </div>
            <div className="bg-muted border-2 border-border rounded-lg px-6 py-4">
              <div className="text-3xl font-bold text-foreground">{implementationRate}%</div>
              <div className="text-sm text-muted-foreground font-medium">Complete</div>
            </div>
          </div>
        </div>

        {/* Features by Category */}
        <div className="space-y-8">
          {featureData.map((category, categoryIndex) => {
            const implementedCount = category.features.filter((f) => f.status === "implemented").length;
            const pendingCount = category.features.filter((f) => f.status === "pending").length;

            return (
              <div key={categoryIndex} className="border-2 border-border rounded-lg overflow-hidden">
                {/* Category Header */}
                <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-primary-foreground">{category.icon}</div>
                    <h2 className="text-2xl font-bold">{category.category}</h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-green-600 dark:bg-green-500 px-3 py-1 rounded">{implementedCount} Done</span>
                    <span className="bg-red-600 dark:bg-red-500 px-3 py-1 rounded">{pendingCount} Pending</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="bg-card divide-y divide-border">
                  {category.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className={`px-6 py-4 flex items-start gap-4 ${feature.status === "implemented"
                        ? "bg-green-50/30 dark:bg-green-950/10"
                        : "bg-red-50/30 dark:bg-red-950/10"
                        }`}
                    >
                      <div className="mt-0.5">{getStatusIcon(feature.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <h3 className="font-semibold text-foreground text-lg">{feature.name}</h3>
                          {getStatusBadge(feature.status)}
                        </div>
                        {feature.description && (
                          <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()} | Status: Active Development
          </p>
        </div>
      </div>
    </div>
  );
}

