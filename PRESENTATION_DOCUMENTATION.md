# 🚀 MohallaMart - Complete Codebase Documentation
## Deep Technical Analysis for Presentation

---

## 📋 Table of Contents
1. [Tech Stack Overview](#tech-stack-overview)
2. [Architecture & System Design](#architecture--system-design)
3. [Main Modules & Features](#main-modules--features)
4. [Code Workflow & Data Flow](#code-workflow--data-flow)
5. [Key Integrations](#key-integrations)
6. [Database Schema](#database-schema)
7. [API Architecture](#api-architecture)
8. [Frontend Architecture](#frontend-architecture)
9. [Backend Architecture](#backend-architecture)
10. [Deployment & Performance](#deployment--performance)

---

## 🛠️ Tech Stack Overview

### **Frontend Stack**
- **Framework**: Next.js 16.1.0 (App Router + React Server Components)
- **Language**: TypeScript 5.9.3 (Strict Mode)
- **Styling**: Tailwind CSS 4.1.18 + CSS Variables (Theme System)
- **UI Components**: Shadcn UI + Radix Primitives (40+ components)
- **State Management**: Zustand 5.0.9 (with localStorage persistence)
- **Forms**: React Hook Form 7.69.0 + Zod 4.2.1 validation
- **Animations**: Framer Motion 12.23.26 (strategic use)
- **Icons**: Lucide React 0.562.0
- **Maps**: Leaflet 1.9.4 + React Leaflet 5.0.0
- **Charts**: Recharts 3.6.0
- **Fonts**: Open Sans (body) + Montserrat (headings)

### **Backend Stack**
- **Realtime Backend**: Convex 1.31.2 (queries, mutations, realtime subscriptions)
- **Type-Safe APIs**: tRPC 11.8.1 (end-to-end type safety)
- **Database**: Supabase PostgreSQL (primary data store)
- **Caching**: Redis (ioredis 5.8.2)
- **Authentication**: Supabase Auth (OTP, Email/Password, OAuth)
- **File Storage**: Convex File Storage (images/products)

### **External Services**
- **Payments**: Razorpay (order creation, payment verification)
- **Search**: Typesense 2.1.0 (fast, typo-tolerant search)
- **Maps/Geocoding**: OpenStreetMap + Nominatim API
- **Background Jobs**: Inngest 3.48.1 (16+ automated functions)
- **Notifications**: OneSignal (push notifications)
- **SMS**: Twilio/MSG91 (OTP, order updates)
- **Analytics**: Vercel Analytics

### **Development Tools**
- **Package Manager**: npm
- **Linting**: ESLint 9.39.2
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Next.js Turbopack

---

## 🏗️ Architecture & System Design

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Customer   │  │ Shopkeeper   │  │    Admin    │      │
│  │    Portal    │  │   Portal     │  │   Portal    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│   Convex       │  │   Supabase     │  │   tRPC        │
│  (Realtime)    │  │   (Auth+DB)    │  │  (Type-Safe)   │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│   Redis        │  │   Inngest      │  │   Razorpay    │
│  (Caching)     │  │  (Jobs)        │  │  (Payments)   │
└────────────────┘  └────────────────┘  └────────────────┘
```

### **Architecture Patterns**

1. **Multi-Tenant Architecture**
   - Separate portals for Customers, Shopkeepers, Admins, Riders
   - Role-based access control (RBAC)
   - Guard components for route protection

2. **Realtime-First Design**
   - Convex provides realtime subscriptions
   - Live order updates, notifications, cart sync
   - Optimistic UI updates

3. **Type-Safe End-to-End**
   - tRPC ensures type safety from frontend to backend
   - Convex schema validation
   - Zod runtime validation

4. **Server Components + Client Components**
   - Next.js App Router with RSC
   - Strategic "use client" directives
   - Server-side data fetching

---

## 📦 Main Modules & Features

### **1. Authentication & Authorization Module**

#### **Location**: `src/app/auth/`, `src/hooks/useAuth.ts`, `src/lib/supabase.ts`

**Features**:
- **Multi-Provider Auth**: Email/Password, OAuth (Google)
- **OTP Login**: Supabase OTP via email/phone
- **Role-Based Access**: Customer, Shopkeeper, Admin, Rider
- **Session Management**: Automatic token refresh, persistent sessions
- **User Sync**: Supabase → Convex synchronization

**Workflow**:
```
User Login → Supabase Auth → Session Created → 
Sync to Convex → Update Zustand Store → Redirect Based on Role
```

**Key Files**:
- `src/components/auth/LoginForm.tsx` - Login UI with validation
- `src/components/auth/SignupForm.tsx` - Registration with role selection
- `src/app/auth/callback/route.ts` - OAuth callback handler
- `src/hooks/useAuth.ts` - Auth hook with session management
- `convex/users.ts` - User CRUD operations

**Code Flow**:
```typescript
// Login Flow
LoginForm → supabase.auth.signInWithPassword() → 
onAuthStateChange → syncUser() → Convex mutation → 
Update Zustand store → Redirect
```

---

### **2. Product Management Module**

#### **Location**: `convex/products.ts`, `src/app/shopkeeper/products/`, `src/app/pd/[id]/[slug]/`

**Features**:
- **Product CRUD**: Create, Read, Update, Delete
- **Stock Management**: Real-time inventory tracking
- **Image Upload**: Convex file storage with optimization
- **Category Hierarchy**: Multi-level category system
- **Product Variants**: Size, color, SKU variants
- **Flash Deals**: Time-limited discounts
- **Bulk Upload**: CSV import for products

**Workflow**:
```
Shopkeeper Creates Product → Upload Images → 
Set Stock/Pricing → Assign Category → 
Index in Typesense → Display on Storefront
```

**Key Files**:
- `convex/products.ts` - Product mutations/queries (500+ lines)
- `src/app/shopkeeper/products/ProductsContent.tsx` - Product management UI
- `src/app/pd/[id]/[slug]/page.tsx` - Product detail page
- `src/components/products/ProductCard.tsx` - Product display component

**Database Schema**:
```typescript
products: {
  name, description, brand, ingredients, nutrition_facts,
  shop_id, category_id, price, original_price,
  stock_quantity, min_order_quantity, max_order_quantity,
  unit, images[], tags[], variants[],
  is_available, is_featured, rating, total_sales,
  is_flash_deal, flash_deal_discount_percent,
  flash_deal_start_time, flash_deal_end_time
}
```

---

### **3. Order Management Module**

#### **Location**: `convex/orders.ts`, `src/app/checkout/`, `src/app/orders/`, `src/app/api/order/create/`

**Features**:
- **Order Placement**: Cart → Checkout → Order Creation
- **Stock Validation**: Real-time stock checking before order
- **Payment Integration**: Razorpay + Cash on Delivery
- **Order Tracking**: Real-time status updates
- **Order History**: Filter by status, shop, date
- **ETA Calculation**: Blinkit-style delivery time estimation
- **Notifications**: Order status change notifications

**Order Status Flow**:
```
pending → accepted_by_shopkeeper → assigned_to_rider → 
out_for_delivery → delivered
```

**Workflow**:
```
Add to Cart → Checkout → Validate Stock → 
Calculate ETA → Create Order → Process Payment → 
Update Stock → Send Notifications → Track Order
```

**Key Files**:
- `convex/orders.ts` - Order mutations/queries (650+ lines)
- `src/app/checkout/page.tsx` - Checkout page with payment
- `src/app/api/order/create/route.ts` - Order creation API
- `src/app/orders/page.tsx` - Order history page

**Order Schema**:
```typescript
orders: {
  user_id, shop_id, rider_id,
  order_number, status,
  items[], subtotal, delivery_fee, tax, total_amount,
  delivery_address, payment_method, payment_status,
  razorpay_order_id, razorpay_payment_id, razorpay_signature,
  delivery_time, notes, created_at, updated_at
}
```

---

### **4. Location & ETA System**

#### **Location**: `src/lib/distance.ts`, `src/lib/eta.ts`, `src/lib/vendor-geo.ts`, `src/lib/time.ts`, `src/app/api/vendors/nearby/`

**Features**:
- **Haversine Distance**: Pure math distance calculation
- **Blinkit-Style ETA**: Dynamic delivery time estimation
- **Peak Hour Detection**: 7-10 AM, 6-10 PM multipliers
- **Nearby Vendors**: Radius-based shop discovery
- **Real-time Updates**: ETA refreshes every 2 minutes

**ETA Formula**:
```
Prep Time = basePrepMinutes + (excessOrders × 2)
Travel Time = (distanceKm / avgRiderSpeedKmph) × 60
Peak Hour Multiplier = 1.25x (if peak hour)
Final ETA = Prep Time + Travel Time + Buffer
Safe Range = [rawEta - 5, rawEta + 5] minutes
```

**Workflow**:
```
User Location → Find Nearby Shops → Calculate Distance → 
Get Pending Orders → Check Peak Hour → Calculate ETA → 
Display in UI (ProductCard, MobileHeader)
```

**Key Files**:
- `src/lib/distance.ts` - Haversine formula implementation
- `src/lib/eta.ts` - ETA calculation logic
- `src/lib/vendor-geo.ts` - Nearby vendor finder
- `src/lib/time.ts` - Peak hour detection
- `src/app/api/vendors/nearby/route.ts` - Nearby vendors API

**API Endpoint**:
```
GET /api/vendors/nearby?userLat=28.6139&userLon=77.2090&radiusKm=2

Response: {
  vendors: [{
    id, name, distanceKm,
    eta: { minEta, maxEta },
    location: { lat, lon },
    ...
  }],
  count, userLocation, radiusKm, peakHour
}
```

---

### **5. Shopkeeper Portal**

#### **Location**: `src/app/shopkeeper/`

**Features**:
- **Dashboard**: Stats, low stock alerts, quick actions
- **Shop Management**: Create/edit shop, set business hours
- **Product Management**: Add/edit/delete products, bulk upload
- **Order Management**: View/accept/reject orders
- **Analytics**: Sales charts, revenue tracking
- **Coupons**: Create discount codes
- **Profile**: Shopkeeper profile management
- **Settings**: Shop configuration

**Dashboard Components**:
- `DashboardContent.tsx` - Main dashboard with stats
- `StatCard.tsx` - Revenue, orders, products cards
- `LowStockAlert.tsx` - Inventory warnings
- `ActionCard.tsx` - Quick action buttons
- `ShopCard.tsx` - Shop information card

**Key Routes**:
- `/shopkeeper/dashboard` - Main dashboard
- `/shopkeeper/products` - Product management
- `/shopkeeper/orders` - Order management
- `/shopkeeper/analytics` - Analytics & reports
- `/shopkeeper/coupons` - Coupon management
- `/shopkeeper/shop/create` - Shop creation

**Guard Component**:
```typescript
<ShopkeeperGuard>
  {/* Protected shopkeeper routes */}
</ShopkeeperGuard>
```

---

### **6. Shopping Cart & Checkout**

#### **Location**: `src/store/useStore.ts`, `src/components/cart/CartSidebar.tsx`, `src/app/checkout/`

**Features**:
- **Cart Management**: Add/remove/update quantities
- **Persistent Cart**: localStorage persistence
- **Multi-Shop Cart**: Separate carts per shop
- **Stock Validation**: Real-time stock checking
- **Delivery Fee Calculation**: Distance-based fees
- **Payment Options**: Razorpay + Cash on Delivery

**Cart State** (Zustand):
```typescript
cart: CartItem[]
addToCart(item)
removeFromCart(id)
updateQuantity(id, quantity)
clearCart()
getTotalItems()
getTotalPrice()
syncCartWithConvex(userId)
```

**Checkout Flow**:
```
Cart Review → Select Delivery Address → 
Calculate Fees → Choose Payment Method → 
Place Order → Process Payment → 
Order Confirmation → Track Order
```

**Key Files**:
- `src/store/useStore.ts` - Zustand store with cart logic
- `src/components/cart/CartSidebar.tsx` - Cart UI component
- `src/app/checkout/page.tsx` - Checkout page (530+ lines)

---

### **7. Payment Integration**

#### **Location**: `src/lib/razorpay.ts`, `src/app/api/payment/razorpay/`

**Features**:
- **Razorpay Integration**: Order creation, payment verification
- **Payment Methods**: Online (Razorpay) + Cash on Delivery
- **Signature Verification**: Secure payment validation
- **Order Linking**: Payment linked to orders

**Payment Flow**:
```
Create Razorpay Order → Redirect to Payment Gateway → 
User Pays → Webhook/Callback → Verify Signature → 
Update Order Payment Status → Send Confirmation
```

**Key Files**:
- `src/lib/razorpay.ts` - Razorpay service class
- `src/app/api/payment/razorpay/initiate/route.ts` - Create payment
- `src/app/api/payment/razorpay/verify/route.ts` - Verify payment

**Razorpay Service**:
```typescript
class RazorpayService {
  createOrder(paymentData) // Create Razorpay order
  verifyPayment(orderId, paymentId, signature) // Verify signature
}
```

---

### **8. Search & Discovery**

#### **Location**: `src/lib/typesense.ts`, `src/components/SearchBar.tsx`

**Features**:
- **Typesense Integration**: Fast, typo-tolerant search
- **Product Search**: Search products by name, description
- **Shop Search**: Find shops by name, location
- **Search Analytics**: Track search queries
- **Auto-complete**: Search suggestions

**Search Flow**:
```
User Types Query → Typesense Search → 
Filter Results → Display Products/Shops → 
Track Analytics
```

**Key Files**:
- `src/lib/typesense.ts` - Typesense client configuration
- `src/components/SearchBar.tsx` - Search UI component

---

### **9. Background Jobs (Inngest)**

#### **Location**: `src/lib/inngest/functions.ts`, `src/lib/inngest/events.ts`, `src/app/api/inngest/route.ts`

**Features**:
- **16+ Automated Functions**: Email, SMS, notifications, cleanup
- **Event-Driven**: Triggered by user/order/product events
- **Retry Logic**: Exponential backoff for failed jobs
- **Scheduled Jobs**: Cron-based cleanup tasks

**Job Functions**:
1. `sendWelcomeEmail` - User registration
2. `sendOrderConfirmation` - Order placed
3. `sendOrderUpdate` - Order status change
4. `indexProduct` - Search indexing
5. `cleanupExpiredSessions` - Session cleanup
6. `sendLowStockAlert` - Inventory alerts
7. `sendDeliveryNotification` - Delivery updates
8. `processRefund` - Refund processing
9. `generateAnalyticsReport` - Daily reports
10. `syncToExternalServices` - Data sync
11. `sendAbandonedCartReminder` - Cart recovery
12. `updateProductRatings` - Rating aggregation
13. `sendCouponExpiryAlert` - Coupon reminders
14. `processBulkUpload` - CSV processing
15. `sendShopkeeperWelcome` - Shopkeeper onboarding
16. `cleanupOldNotifications` - Notification cleanup

**Event Types**:
```typescript
"user/created"
"order/created"
"order/updated"
"product/created"
"search/index"
"cleanup/expired_sessions"
```

**Key Files**:
- `src/lib/inngest/functions.ts` - All job functions (500+ lines)
- `src/lib/inngest/events.ts` - Event type definitions
- `src/app/api/inngest/route.ts` - Inngest webhook handler

---

### **10. Notification System**

#### **Location**: `convex/notifications.ts`, `src/components/NotificationBell.tsx`, `src/app/notifications/`

**Features**:
- **In-App Notifications**: Real-time via Convex subscriptions
- **Push Notifications**: OneSignal integration
- **SMS Notifications**: Twilio/MSG91 integration
- **Email Notifications**: Via Inngest jobs
- **Notification Types**: ORDER, DELIVERY, PAYMENT, SYSTEM

**Notification Schema**:
```typescript
notifications: {
  user_id, type, title, message,
  data, is_read, is_sent,
  sent_at, created_at
}
```

**Key Files**:
- `convex/notifications.ts` - Notification mutations/queries
- `src/components/NotificationBell.tsx` - Notification UI
- `src/app/notifications/page.tsx` - Notifications page

---

### **11. Admin Portal**

#### **Location**: `src/app/admin/`

**Features**:
- **User Management**: View/edit/activate users
- **Registration Review**: Approve/reject shopkeeper applications
- **Shop Verification**: Verify shops
- **Analytics Dashboard**: Platform-wide statistics
- **Audit Logs**: Track admin actions

**Key Routes**:
- `/admin/login` - Admin login
- `/admin/(protected)/registrations` - Review applications
- `/admin/(protected)/users` - User management

**Guard Component**:
```typescript
<AdminGuard>
  {/* Protected admin routes */}
</AdminGuard>
```

---

### **12. Reviews & Ratings**

#### **Location**: `convex/reviews.ts`, `src/app/api/reviews/`, `src/components/products/`

**Features**:
- **Product Reviews**: Star ratings + comments
- **Shop Reviews**: Shop ratings
- **Verified Purchase**: Only verified buyers can review
- **Review Replies**: Shopkeepers can reply
- **Rating Aggregation**: Average rating calculation

**Review Schema**:
```typescript
reviews: {
  user_id, product_id, shop_id, order_id,
  rating, comment, reply, replied_at,
  images[], is_verified, created_at
}
```

**Key Files**:
- `convex/reviews.ts` - Review mutations/queries
- `src/app/api/reviews/add/route.ts` - Add review API
- `src/components/products/ProductCard.tsx` - Rating display

---

## 🔄 Code Workflow & Data Flow

### **User Registration Flow**

```
1. User fills SignupForm
2. Submit → supabase.auth.signUp()
3. Email verification sent
4. User clicks link → /auth/callback
5. Session created → onAuthStateChange triggered
6. syncUser() → Convex mutation (createUser)
7. Update Zustand store
8. Redirect based on role
```

### **Order Placement Flow**

```
1. User adds products to cart (Zustand store)
2. Navigate to /checkout
3. Select delivery address
4. Calculate delivery fee (distance-based)
5. Choose payment method
6. Click "Place Order"
7. POST /api/order/create
   - Validate stock
   - Calculate ETA
   - Create order in Convex
   - Update product stock
   - Create notifications
8. If Razorpay:
   - POST /api/payment/razorpay/initiate
   - Redirect to payment gateway
   - User pays
   - POST /api/payment/razorpay/verify
   - Update order payment_status
9. Redirect to order tracking
10. Inngest jobs triggered:
    - sendOrderConfirmation
    - sendOrderUpdate
    - indexProduct (if new)
```

### **Product Creation Flow**

```
1. Shopkeeper navigates to /shopkeeper/products
2. Fill product form (name, price, stock, images)
3. Upload images → Convex file storage
4. Submit → Convex mutation (createProduct)
5. Product created in Convex
6. Index in Typesense (via Inngest)
7. Update shop product count
8. Display in shop products list
```

### **Realtime Updates Flow**

```
1. Order status changes in Convex
2. Convex realtime subscription triggers
3. Frontend receives update
4. Update UI (order status, notifications)
5. Show toast notification
6. Update Zustand store if needed
```

---

## 🔌 Key Integrations

### **1. Convex Integration**

**Purpose**: Realtime backend, database, file storage

**Usage**:
```typescript
// Queries (read data)
const products = useQuery(api.products.getProducts, { shop_id });

// Mutations (write data)
await useMutation(api.orders.createOrder, { ... });

// Realtime subscriptions
useQuery automatically subscribes to realtime updates
```

**Key Files**:
- `convex/schema.ts` - Database schema (500+ lines)
- `convex/products.ts`, `convex/orders.ts`, etc. - CRUD operations
- `src/lib/convex.ts` - Convex client setup

---

### **2. Supabase Integration**

**Purpose**: Authentication, primary database

**Usage**:
```typescript
// Auth
const { data } = await supabase.auth.signInWithPassword({ email, password });

// Database queries
const { data } = await supabase.from('users').select('*');
```

**Key Files**:
- `src/lib/supabase.ts` - Supabase client
- `src/hooks/useAuth.ts` - Auth hook

---

### **3. Razorpay Integration**

**Purpose**: Payment processing

**Usage**:
```typescript
// Create order
const order = await razorpay.orders.create({ amount, currency });

// Verify payment
const isValid = razorpay.payments.verifyPaymentSignature({
  order_id, payment_id, signature
});
```

**Key Files**:
- `src/lib/razorpay.ts` - Razorpay service
- `src/app/api/payment/razorpay/` - Payment APIs

---

### **4. Leaflet Maps Integration**

**Purpose**: Location selection, shop display

**Usage**:
```typescript
<MapContainer center={[lat, lng]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={[lat, lng]} />
</MapContainer>
```

**Key Files**:
- `src/components/LocationModal.tsx` - Location picker
- `src/components/MapView.tsx` - Map component

---

### **5. Typesense Integration**

**Purpose**: Fast search

**Usage**:
```typescript
const results = await typesense.collections('products')
  .documents()
  .search({ q: query, query_by: 'name,description' });
```

**Key Files**:
- `src/lib/typesense.ts` - Typesense client

---

## 🗄️ Database Schema

### **Core Tables** (Convex Schema)

1. **users** - All user types (customer, shopkeeper, admin, rider)
2. **shops** - Shop information, location, delivery profile
3. **products** - Product details, stock, pricing, variants
4. **orders** - Order information, status, payment
5. **order_items** - Detailed order line items
6. **cart** - Shopping cart items
7. **categories** - Product categories (hierarchical)
8. **reviews** - Product/shop reviews and ratings
9. **notifications** - In-app notifications
10. **favorites** - Wishlist items
11. **coupons** - Discount codes
12. **shopkeeper_applications** - Shopkeeper registration applications
13. **riders** - Delivery rider information
14. **user_locations** - Saved delivery addresses
15. **search_analytics** - Search query tracking
16. **system_settings** - Platform configuration
17. **admin_audit_logs** - Admin action logs
18. **login_logs** - Login attempt tracking

**Total**: 18 tables with comprehensive indexing

---

## 🌐 API Architecture

### **Next.js API Routes**

**Location**: `src/app/api/`

1. **`/api/order/create`** - Create new order
2. **`/api/payment/razorpay/initiate`** - Initiate Razorpay payment
3. **`/api/payment/razorpay/verify`** - Verify payment signature
4. **`/api/vendors/nearby`** - Get nearby shops with ETA
5. **`/api/reviews/add`** - Add product/shop review
6. **`/api/reviews/product`** - Get product reviews
7. **`/api/reviews/user`** - Get user reviews
8. **`/api/shopkeeper/products/create`** - Create product
9. **`/api/shopkeeper/products/update`** - Update product
10. **`/api/shopkeeper/products/delete`** - Delete product
11. **`/api/shopkeeper/applied`** - Check shopkeeper application status
12. **`/api/shopkeeper/location`** - Update shop location
13. **`/api/admin/toggle-shopkeeper`** - Toggle shopkeeper status
14. **`/api/notifications/create`** - Create notification
15. **`/api/trpc/[trpc]`** - tRPC endpoint
16. **`/api/inngest`** - Inngest webhook handler
17. **`/api/orders/history`** - Get order history
18. **`/api/share`** - Share product/shop
19. **`/api/ws/rider`** - WebSocket for rider updates
20. **`/api/debug/convex`** - Debug endpoints

**Total**: 20+ API endpoints

---

## 🎨 Frontend Architecture

### **Component Structure**

```
src/components/
├── auth/              # Authentication components
├── sections/          # Home page sections
├── products/          # Product display components
├── cart/              # Shopping cart components
├── ui/                # Shadcn UI components (40+)
├── Navbar.tsx         # Desktop navigation
├── MobileHeader.tsx   # Mobile header with ETA
├── MobileBottomNav.tsx # Mobile bottom nav
├── SearchBar.tsx      # Search component
├── LocationModal.tsx  # Location picker
├── MapView.tsx        # Map component
├── NotificationBell.tsx # Notification bell
├── ToastProvider.tsx  # Toast notifications
├── ConvexProvider.tsx # Convex provider
├── TRPCProvider.tsx   # tRPC provider
└── InngestProvider.tsx # Inngest provider
```

### **Page Structure**

```
src/app/
├── page.tsx                    # Home page
├── auth/                       # Auth pages
├── shopkeeper/                 # Shopkeeper portal (35+ pages)
├── admin/                      # Admin portal (16+ pages)
├── checkout/                   # Checkout page
├── orders/                     # Order history
├── profile/                    # User profile
├── shops/                      # Shop listing
├── shop/[slug]/                # Shop detail
├── pd/[id]/[slug]/             # Product detail
├── categories/                 # Category listing
├── notifications/              # Notifications page
├── wishlist/                   # Wishlist page
└── track/[id]/                 # Order tracking
```

### **State Management**

**Zustand Store** (`src/store/useStore.ts`):
- Cart state (persisted)
- User state (persisted)
- Location state (persisted)
- Search state
- Convex connection state

**Convex State**:
- Realtime subscriptions
- Server state
- Optimistic updates

---

## ⚙️ Backend Architecture

### **Convex Functions**

**Location**: `convex/`

1. **`users.ts`** - User CRUD (473+ lines)
2. **`shops.ts`** - Shop CRUD, search
3. **`products.ts`** - Product CRUD, search (600+ lines)
4. **`orders.ts`** - Order CRUD, status updates (650+ lines)
5. **`categories.ts`** - Category management
6. **`cart.ts`** - Cart operations
7. **`reviews.ts`** - Review CRUD
8. **`notifications.ts`** - Notification CRUD
9. **`favorites.ts`** - Wishlist operations
10. **`coupons.ts`** - Coupon management
11. **`registrations.ts`** - Shopkeeper applications
12. **`riders.ts`** - Rider management
13. **`analytics.ts`** - Analytics queries
14. **`settings.ts`** - System settings
15. **`files.ts`** - File uploads
16. **`logs.ts`** - Logging

**Total**: 16+ Convex modules

---

## 🚀 Deployment & Performance

### **Performance Optimizations**

1. **Next.js Optimizations**:
   - Server Components for data fetching
   - Image optimization with `<Image />`
   - Code splitting and lazy loading
   - Turbopack for faster builds

2. **Caching**:
   - Redis for frequent queries
   - Convex query caching
   - Next.js static generation

3. **Realtime Efficiency**:
   - Convex subscriptions only for active data
   - Optimistic UI updates
   - Debounced search queries

4. **Bundle Size**:
   - Tree shaking
   - Dynamic imports
   - Code splitting by route

### **Security Features**

1. **Authentication**:
   - Secure token handling
   - Role-based access control
   - Route guards

2. **API Security**:
   - Input validation (Zod)
   - SQL injection prevention (Convex)
   - XSS protection
   - CSRF protection

3. **Payment Security**:
   - Razorpay signature verification
   - Secure payment flow
   - PCI compliance

### **Monitoring & Analytics**

1. **Vercel Analytics**: Performance monitoring
2. **Convex Dashboard**: Realtime data monitoring
3. **Error Tracking**: Console logging + error boundaries
4. **Search Analytics**: Typesense query tracking

---

## 📊 Code Statistics

- **Total Files**: 200+ TypeScript/TSX files
- **Lines of Code**: ~15,000+ lines
- **Components**: 70+ React components
- **API Endpoints**: 20+ routes
- **Convex Functions**: 16+ modules
- **Database Tables**: 18 tables
- **Background Jobs**: 16+ Inngest functions
- **UI Components**: 40+ Shadcn components

---

## 🎯 Key Features Summary

### **Customer Features**
✅ Product browsing & search
✅ Shopping cart & checkout
✅ Order placement & tracking
✅ Payment (Razorpay + COD)
✅ Reviews & ratings
✅ Wishlist/Favorites
✅ Notifications
✅ Location management
✅ Order history
✅ Profile management

### **Shopkeeper Features**
✅ Registration & onboarding
✅ Shop creation & management
✅ Product management (CRUD)
✅ Bulk product upload
✅ Order management
✅ Analytics dashboard
✅ Coupon creation
✅ Review management
✅ Low stock alerts
✅ Business hours setup

### **Admin Features**
✅ User management
✅ Shopkeeper approval
✅ Shop verification
✅ Platform analytics
✅ Audit logs

### **Technical Features**
✅ Realtime updates (Convex)
✅ ETA calculation (Blinkit-style)
✅ Location-based search
✅ Typo-tolerant search (Typesense)
✅ Background jobs (Inngest)
✅ Payment integration (Razorpay)
✅ Push notifications
✅ Dark/Light theme
✅ PWA support
✅ Mobile-first design

---

## 🔧 Development Workflow

### **Local Development**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### **Environment Variables**

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOY_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `TYPESENSE_API_KEY`
- `INNGEST_EVENT_KEY`

---

## 📝 Conclusion

MohallaMart is a **production-ready, full-stack e-commerce platform** with:

- ✅ **Modern Tech Stack**: Next.js 16, TypeScript, Convex, Supabase
- ✅ **Realtime Capabilities**: Live updates, notifications, order tracking
- ✅ **Scalable Architecture**: Multi-tenant, type-safe, modular
- ✅ **Rich Feature Set**: 100+ features across customer, shopkeeper, admin portals
- ✅ **Performance Optimized**: Caching, code splitting, image optimization
- ✅ **Security First**: RBAC, input validation, secure payments
- ✅ **Developer Experience**: Type safety, hot reload, comprehensive tooling

**Ready for production deployment and scaling!** 🚀

---

*Documentation generated for presentation purposes*
*Last Updated: 2024*
