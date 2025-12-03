# 📋 MohallaMart Codebase Functionality Summary

## 🎯 Overview

MohallaMart is a **multi-tenant, realtime, mobile-first** hyperlocal e-commerce platform connecting neighborhood shops with customers. The platform supports **4 user roles**: Customers, Shopkeepers, Riders (Delivery Partners), and Admins.

---

## 🏗️ **Core Architecture**

### **Tech Stack**
- **Frontend**: Next.js 15.5.3 (App Router), TypeScript, Tailwind CSS 4, Shadcn UI
- **Backend**: Convex (realtime database), tRPC (type-safe APIs)
- **Database**: Convex (primary), Supabase PostgreSQL (auth), Redis (caching)
- **Maps**: Leaflet + OpenStreetMap (Nominatim for geocoding, OSRM for snap-to-road)
- **Search**: Typesense (fast, typo-tolerant search)
- **Payments**: Razorpay integration
- **Notifications**: Convex realtime + OneSignal (push) + Twilio/MSG91 (SMS placeholders)
- **Background Jobs**: Inngest (event-driven automation)
- **State Management**: Zustand (with persistence)

---

## 👥 **User Roles & Permissions**

### **1. Customer (USER)**
- Role: `customer` in database
- Access: Browse shops, products, cart, checkout, order tracking

### **2. Shopkeeper (SHOP_OWNER)**
- Role: `shop_owner` in database
- Access: Dashboard, product management, order management, shop settings
- Registration: Multi-step application process with admin approval

### **3. Rider (RIDER)**
- Role: `rider` in database
- Access: Delivery dashboard, order assignments, live location tracking
- Features: Online/offline toggle, order status updates, real-time location broadcasting

### **4. Admin (ADMIN)**
- Role: `admin` in database
- Access: User management, shopkeeper approval, order oversight, rider management

---

## 🛍️ **Customer Features (Implemented)**

### **Authentication & Profile**
- ✅ OTP-based login/signup via Supabase Auth
- ✅ User profile management (name, phone, avatar)
- ✅ Dark/Light theme support

### **Shopping Experience**
- ✅ **Shop Browsing**: View all shops with filtering by category, city, pincode
- ✅ **Shop Details Page**: Shop info, products, ratings, business hours
- ✅ **Product Browsing**: Browse by category, shop, search
- ✅ **Product Detail Page**: Full product info, images, reviews, add to cart
- ✅ **Shopping Cart**: Persistent cart with realtime sync (Zustand + Convex)
- ✅ **Search**: Typesense-powered search with typo tolerance
- ✅ **Category Filtering**: Hierarchical category selection
- ✅ **Image Modal**: Full-screen image viewer

### **Location & Delivery**
- ✅ **Location Selection**: Leaflet map with GPS detection, search, manual pick
- ✅ **Location-based Discovery**: Find nearby shops by distance
- ✅ **Delivery ETA System**: Blinkit-style ETA calculation
  - Distance-based (Haversine formula)
  - Peak hour detection (7-10 AM, 6-10 PM)
  - Store capacity consideration
  - Dynamic ETA display: `12-22 mins`
- ✅ **Delivery Address Management**: Multiple saved addresses

### **Order Management**
- ✅ **Checkout Flow**: Address selection, payment method, order creation
- ✅ **Order Placement**: Stock validation, auto stock deduction
- ✅ **Order Tracking**: Real-time tracking page with:
  - Live map with rider location (SSE)
  - Order status timeline
  - ETA updates
  - Order details
- ✅ **Order History**: Filter by status, shop, date range
- ✅ **Product Reviews**: Add reviews after order completion (verified purchase badge)

### **Notifications**
- ✅ In-app notification bell with unread count
- ✅ Real-time notifications via Convex subscriptions
- ✅ Email/SMS placeholders (Inngest integration ready)

---

## 🏪 **Shopkeeper Features (Implemented)**

### **Registration & Onboarding**
- ✅ **Shopkeeper Signup**: Create account with email/phone
- ✅ **Application Form**: Multi-step registration with:
  - PAN, GSTIN, bank details
  - Business address, pickup address
  - Identity verification
  - Business type selection
  - First product info
- ✅ **Registration Status**: View application status (draft/submitted/reviewing/approved/rejected)
- ✅ **Admin Approval**: Admin reviews and approves/rejects applications

### **Shop Management**
- ✅ **Shop Creation**: Create shop with name, description, logo, categories
- ✅ **Shop Profile**: Edit shop details, business hours, contact info
- ✅ **Shop Categories**: Select multiple hierarchical categories
- ✅ **Accurate Location System** (NEW):
  - High-accuracy GPS detection
  - OSRM snap-to-road (snaps GPS to nearest road)
  - Manual marker adjustment on Leaflet map
  - Nominatim reverse geocoding (address lookup)
  - Saves comprehensive location object:
    ```typescript
    {
      lat, lon, accuracy, snapped,
      source: "gps" | "gps+snap" | "gps+snap+manual",
      addressText, road, suburb, city, postcode
    }
    ```
  - Page: `/shopkeeper/location`
  - API: `PATCH /api/shopkeeper/location`

### **Product Management**
- ✅ **Add Products**: Name, description, price, stock, images, category
- ✅ **Edit Products**: Update all product fields
- ✅ **Delete Products**: Remove products
- ✅ **Product Images**: Direct upload with optimization
- ✅ **Stock Management**: Track inventory, auto-deduction on orders
- ✅ **Product Availability**: Toggle show/hide products
- ✅ **Hierarchical Categories**: Select categories with sub-categories

### **Dashboard & Analytics**
- ✅ **Shop Dashboard**: Overview with:
  - Total orders, revenue, products count
  - Low stock alerts
  - Recent orders
  - Quick actions
  - Tips and recommendations
- ✅ **Shop Statistics**: Order counts, revenue, ratings

### **Order Management**
- ✅ **View Orders**: All orders for shopkeeper's shops
- ✅ **Accept Orders**: Accept/reject incoming orders
- ✅ **Rider Assignment**: Manually assign riders to orders
  - Check rider availability (online, not busy)
  - Verify rider within 3km of shop
- ✅ **Order Status Updates**: Track order lifecycle
- ✅ **Order Details**: View full order information

### **Inventory Management**
- ✅ **Stock Tracking**: Real-time stock levels
- ✅ **Low Stock Alerts**: Dashboard notifications for low stock
- ✅ **Auto Stock Deduction**: Stock reduced automatically on order placement
- ✅ **Stock Validation**: Prevent orders when stock insufficient

---

## 🚴 **Rider Features (Implemented)**

### **Registration & Profile**
- ✅ **Rider Registration**: Create rider profile linked to user account
- ✅ **Rider Login**: Authentication for delivery partners

### **Delivery Dashboard**
- ✅ **Assigned Orders**: View orders assigned to rider
- ✅ **Order Details**: View order information, delivery address
- ✅ **Order Status Updates**: Update status:
  - `Start Pickup` → `out_for_delivery`
  - `Out for Delivery` → delivering
  - `Delivered` → order completed

### **Location Tracking**
- ✅ **Live Location Updates**: Auto-update location every 5 seconds when online
- ✅ **Online/Offline Toggle**: Toggle availability status
- ✅ **Real-time Broadcasting**: Server-Sent Events (SSE) for location streaming
  - API: `POST /api/ws/rider` (update location)
  - API: `GET /api/ws/rider?riderId=xxx` (SSE stream)
- ✅ **Location Storage**: Rider location stored in Convex `riders` table

### **Notifications**
- ✅ **Order Assignment Notifications**: Receive notifications when assigned to orders
- ✅ **Real-time Updates**: Convex subscriptions for new assignments

---

## 👨‍💼 **Admin Features (Implemented)**

### **Authentication**
- ✅ **Admin Login**: Secure admin authentication

### **Dashboard**
- ✅ **Admin Dashboard**: Overview of platform statistics

### **User Management**
- ✅ **View All Users**: List all users with filters
- ✅ **Change User Roles**: Promote/demote users (customer ↔ shopkeeper ↔ rider ↔ admin)
- ✅ **User Activation/Deactivation**: Enable/disable user accounts
- ✅ **User Details**: View user information

### **Shopkeeper Management**
- ✅ **Registration Review**: Review shopkeeper applications
- ✅ **Approve/Reject Registrations**: Manage registration status
- ✅ **View All Registrations**: Filter by status, view details
- ✅ **Shopkeeper Toggle**: Enable/disable shopkeeper accounts

### **Order Management**
- ✅ **View All Orders**: Platform-wide order oversight
- ✅ **Order Details**: View any order information

### **Rider Management**
- ✅ **View All Riders**: List all delivery riders
- ✅ **Rider Status**: View rider online/offline status, assignments

### **Audit Logs**
- ✅ **Admin Actions**: Track all admin actions in `admin_audit_logs` table

---

## 🔧 **Core Systems (Implemented)**

### **1. Accurate Location System** (NEW - Just Implemented)

#### **Components**
- **`src/lib/location/gps.ts`**: High-accuracy GPS detection
  - Uses `navigator.geolocation.getCurrentPosition` with high accuracy settings
  - Returns `{ lat, lon, accuracy }`

- **`src/lib/location/osrm.ts`**: OSRM snap-to-road
  - Snaps GPS coordinates to nearest road using OSRM API
  - Returns `{ lat, lon, snapped: boolean }`

- **`src/lib/location/nominatim.ts`**: Reverse geocoding
  - Converts coordinates to human-readable address
  - Returns `{ addressText, road, suburb, city, postcode }`

- **`src/components/location/LocationPicker.tsx`**: Shopkeeper location picker
  - Integrates GPS → OSRM snap → manual adjustment → reverse geocode
  - Leaflet map with draggable marker
  - Real-time address display

- **`src/components/LocationModal.tsx`**: Customer location picker
  - Updated to use shared location services
  - GPS → OSRM snap → search → manual pick

#### **Database Schema**
```typescript
shops.location: {
  lat: number;
  lon: number;
  accuracy: number;
  snapped: boolean;
  source: "gps" | "gps+snap" | "gps+snap+manual";
  addressText: string;
  road?: string;
  suburb?: string;
  city?: string;
  postcode?: string;
}
```

#### **API Endpoints**
- `PATCH /api/shopkeeper/location`: Update shop location
- `GET /api/vendors/nearby`: Get nearby shops with ETA

### **2. Delivery ETA System**

#### **Components**
- **`src/lib/distance.ts`**: Haversine distance calculation
  - Pure math implementation (no API calls)
  - Returns distance in kilometers

- **`src/lib/eta.ts`**: Blinkit-style ETA calculation
  - Formula:
    1. Prep time = `basePrepMinutes + (excessOrders * 2)`
    2. Travel time = `(distanceKm / avgRiderSpeedKmph) * 60`
    3. Peak hour multiplier: `travelTime *= 1.25` (if peak hour)
    4. Final ETA = `prepTime + travelTime + bufferMinutes`
    5. Safe range: `minEta = max(5, round(rawEta - 5))`, `maxEta = round(rawEta + 5)`

- **`src/lib/time.ts`**: Peak hour detection
  - Peak hours: 7-10 AM and 6-10 PM (18-22)

- **`src/lib/vendor-geo.ts`**: Find nearby vendors
  - Filters vendors by distance (Haversine)
  - Returns sorted by distance

#### **UI Integration**
- **`ProductCard`**: Displays ETA badge (`12-22 mins`)
- **`MobileHeader`**: Dynamic ETA display, auto-refreshes every 2 minutes
- **`NearbyStoresSection`**: Shows shops with ETA

### **3. Order Lifecycle Management**

#### **Order Statuses**
1. `pending` → Customer placed order
2. `accepted_by_shopkeeper` → Shopkeeper accepted
3. `assigned_to_rider` → Rider assigned manually
4. `out_for_delivery` → Rider picked up and delivering
5. `delivered` → Order completed
6. `cancelled` → Order cancelled

#### **Stock Management**
- Auto stock deduction on order placement
- Stock validation before order creation
- Low stock alerts on shopkeeper dashboard

#### **Notifications**
- Order placed → User + Shopkeeper notified
- Order accepted → User notified
- Rider assigned → Rider + User notified
- Status updates → All parties notified

### **4. Real-time Updates**

#### **Convex Subscriptions**
- Orders: Real-time order status updates
- Notifications: Real-time notification delivery
- Cart: Real-time cart synchronization
- Rider location: Real-time location updates (SSE)

#### **Server-Sent Events (SSE)**
- **`/api/ws/rider`**: Real-time rider location broadcasting
  - `POST`: Update rider location
  - `GET`: Subscribe to location updates (SSE stream)

### **5. Notification System**

#### **Database**
- `notifications` table in Convex
- Fields: `user_id`, `type`, `title`, `message`, `data`, `is_read`, `is_sent`

#### **Types**
- `ORDER`: Order-related notifications
- `DELIVERY`: Delivery updates
- `PAYMENT`: Payment notifications
- `SYSTEM`: System messages

#### **UI**
- Notification bell with unread count
- Notification list page (`/notifications`)
- Real-time updates via Convex subscriptions

### **6. Background Jobs (Inngest)**

#### **Event-Driven Automation**
- Order created → Trigger notifications, inventory updates
- Order status changed → Send notifications
- Stock low → Alert shopkeeper
- User registered → Welcome email (placeholder)

#### **Integration**
- Inngest webhook: `/api/inngest/route`
- Event definitions: `src/lib/inngest/events.ts`
- Job functions: `src/lib/inngest/functions.ts`

### **7. Search System**

#### **Typesense Integration**
- Fast, typo-tolerant search
- Product and shop search
- Search suggestions
- Search analytics tracking

### **8. Payment Integration**

#### **Razorpay**
- Payment method selection in checkout
- Payment status tracking (`pending`, `paid`, `failed`, `refunded`)
- Order creation with payment info

---

## 📁 **Key File Structure**

### **Frontend Pages**
```
src/app/
├── auth/                    # Customer login/signup
├── shopkeeper/             # Shopkeeper pages
│   ├── apply/              # Application form
│   ├── registration/       # Registration status
│   ├── dashboard/          # Shopkeeper dashboard
│   ├── products/           # Product management
│   ├── shop/               # Shop creation/management
│   ├── location/           # Accurate location setup (NEW)
│   ├── orders/             # Order management
│   └── profile/            # Profile management
├── admin/                  # Admin pages
│   ├── (protected)/        # Protected admin routes
│   │   ├── registrations/  # Registration review
│   │   ├── users/         # User management
│   │   └── orders/         # Order management
│   └── login/             # Admin login
├── rider/                  # Rider pages
│   ├── app/               # Rider dashboard
│   └── login/              # Rider login
├── checkout/               # Checkout page
├── orders/                 # Order history
├── track/[orderId]/       # Order tracking
├── shops/                  # Shop listing
├── shop/[slug]/           # Shop detail
├── pd/[id]/[slug]/        # Product detail
└── profile/               # User profile
```

### **API Routes**
```
src/app/api/
├── shopkeeper/
│   ├── location/           # PATCH: Update shop location (NEW)
│   ├── products/          # CRUD operations
│   └── applied/           # Get registration status
├── order/
│   └── create/            # POST: Create order
├── vendors/
│   └── nearby/            # GET: Nearby shops with ETA
├── ws/
│   └── rider/             # POST: Update location, GET: SSE stream
├── admin/                  # Admin operations
└── reviews/                # Review operations
```

### **Components**
```
src/components/
├── location/
│   └── LocationPicker.tsx  # Shopkeeper location picker (NEW)
├── LocationModal.tsx       # Customer location picker (updated)
├── MapView.tsx             # Leaflet map component
├── products/
│   ├── ProductCard.tsx     # Product card with ETA
│   └── ShopCard.tsx        # Shop card
├── cart/
│   └── CartSidebar.tsx     # Shopping cart
├── auth/                   # Auth forms
└── ui/                     # Shadcn UI components
```

### **Utilities**
```
src/lib/
├── location/
│   ├── gps.ts              # High-accuracy GPS (NEW)
│   ├── osrm.ts             # Snap-to-road (NEW)
│   └── nominatim.ts        # Reverse geocoding (NEW)
├── distance.ts             # Haversine distance
├── eta.ts                  # ETA calculation
├── time.ts                 # Peak hour detection
├── vendor-geo.ts           # Nearby vendor utilities
└── inngest/                # Background jobs
```

### **Backend (Convex)**
```
convex/
├── schema.ts               # Database schema (updated with location)
├── users.ts                # User operations
├── shops.ts                # Shop operations
├── products.ts             # Product operations
├── orders.ts               # Order operations
├── riders.ts               # Rider operations
├── reviews.ts              # Review operations
├── notifications.ts        # Notification operations
└── registrations.ts       # Registration operations
```

---

## 🎨 **Design System**

### **Theme Support**
- ✅ Dark/Light theme (all non-admin pages)
- ✅ CSS variables in `globals.css`
- ✅ Theme-aware components using Tailwind `dark:` variant

### **UI Components**
- ✅ Shadcn UI components (Button, Card, Input, Dialog, etc.)
- ✅ Consistent design system
- ✅ Mobile-first responsive design

### **Colors**
- Primary: Forest Green
- Secondary: Vibrant Orange
- Accent: Sunny Yellow
- Semantic colors: Success, Warning, Error, Info

---

## 📊 **Database Schema Highlights**

### **Key Tables**
- `users`: Unified user table (all roles)
- `shops`: Shop information with `location` field (NEW)
- `products`: Product catalog
- `orders`: Order information
- `order_items`: Detailed order items
- `riders`: Rider profiles with location
- `reviews`: Product/shop reviews
- `notifications`: In-app notifications
- `seller_registrations`: Shopkeeper applications
- `cart`: Shopping cart items

### **Indexes**
- Optimized indexes for queries (by_user, by_shop, by_status, etc.)
- Efficient filtering and sorting

---

## 🚀 **Recent Additions (Latest Session)**

### **Accurate Location System**
1. ✅ Updated `convex/schema.ts` with detailed `location` object in `shops` table
2. ✅ Created `src/lib/location/gps.ts` for high-accuracy GPS
3. ✅ Created `src/lib/location/osrm.ts` for snap-to-road
4. ✅ Created `src/lib/location/nominatim.ts` for reverse geocoding
5. ✅ Created `src/components/location/LocationPicker.tsx` for shopkeeper location setup
6. ✅ Created `src/app/shopkeeper/location/page.tsx` for location management page
7. ✅ Created `src/app/api/shopkeeper/location/route.ts` for location API
8. ✅ Updated `src/components/LocationModal.tsx` to use shared location services
9. ✅ Updated `src/components/MapView.tsx` with design token fixes

---

## 📈 **Feature Implementation Status**

Based on `src/app/features/page.tsx`:
- **Total Features**: ~80+ features
- **Implemented**: ~70+ features (87.5%+)
- **Pending**: ~10 features (mostly analytics, bulk operations, advanced features)

---

## 🔐 **Security & Authentication**

- ✅ Supabase Auth with OTP
- ✅ Role-based access control (RBAC)
- ✅ Route guards (`ShopkeeperGuard`, admin guards)
- ✅ API authentication checks
- ✅ Shop ownership verification
- ✅ Input validation and sanitization

---

## 📱 **Mobile Responsiveness**

- ✅ Mobile-first design
- ✅ Touch-friendly UI
- ✅ Responsive layouts (320px → 2560px)
- ✅ Mobile bottom navigation
- ✅ Mobile header with dynamic ETA

---

## 🎯 **Next Steps (Pending Features)**

1. **Analytics Dashboard**: Sales reports, revenue analytics
2. **Bulk Operations**: Import/export products
3. **Product Variants**: Sizes, colors, etc.
4. **Delivery Zone Management**: Set delivery areas and charges
5. **Wishlist/Favorites**: Save favorite products/shops
6. **Rider Earnings Dashboard**: Track earnings and payments
7. **Email Notifications**: Complete email integration
8. **SMS Notifications**: Complete SMS integration

---

## 📝 **Notes**

- All location services use free/open-source APIs (OSRM, Nominatim)
- Real-time updates powered by Convex subscriptions
- Background jobs handled by Inngest
- Type-safe APIs with tRPC
- Strict TypeScript throughout
- Comprehensive error handling
- Toast notifications for user feedback (no alerts/confirms)

---

**Last Updated**: Based on current codebase state
**Status**: Active Development
**Implementation Rate**: ~87.5%

