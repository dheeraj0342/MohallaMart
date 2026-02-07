# 🚀 MohallaMart - Quick Reference Guide
## For Presentation

---

## 📋 Tech Stack (At a Glance)

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS 4, Shadcn UI |
| **State** | Zustand (with persistence) |
| **Backend** | Convex (realtime), Supabase (auth+DB), tRPC |
| **Payments** | Razorpay |
| **Search** | Typesense |
| **Maps** | Leaflet + OpenStreetMap |
| **Jobs** | Inngest (16+ functions) |
| **Caching** | Redis |

---

## 🏗️ Architecture Overview

```
Frontend (Next.js) → Convex (Realtime) + Supabase (Auth) + tRPC (APIs)
                    ↓
External Services: Razorpay, Typesense, Inngest, Redis
```

**Key Patterns**:
- Multi-tenant (Customer, Shopkeeper, Admin, Rider)
- Realtime-first (Convex subscriptions)
- Type-safe end-to-end (tRPC + TypeScript)
- Server Components + Client Components

---

## 📦 Main Modules

### 1. **Authentication** (`src/app/auth/`, `src/hooks/useAuth.ts`)
- Supabase Auth (Email/Password, OAuth)
- Role-based access (Customer, Shopkeeper, Admin, Rider)
- Session management + Convex sync

### 2. **Products** (`convex/products.ts`, `src/app/shopkeeper/products/`)
- CRUD operations
- Stock management
- Image upload (Convex)
- Bulk upload (CSV)
- Flash deals

### 3. **Orders** (`convex/orders.ts`, `src/app/checkout/`)
- Order placement
- Stock validation
- Payment (Razorpay + COD)
- Order tracking
- Status flow: pending → accepted → assigned → out_for_delivery → delivered

### 4. **Location & ETA** (`src/lib/eta.ts`, `src/lib/distance.ts`)
- Haversine distance calculation
- Blinkit-style ETA: `Prep Time + Travel Time + Buffer`
- Peak hour detection (7-10 AM, 6-10 PM)
- Nearby vendors API: `/api/vendors/nearby`

### 5. **Shopkeeper Portal** (`src/app/shopkeeper/`)
- Dashboard (stats, alerts)
- Shop management
- Product management
- Order management
- Analytics
- Coupons

### 6. **Cart & Checkout** (`src/store/useStore.ts`, `src/app/checkout/`)
- Zustand cart (persisted)
- Multi-shop support
- Delivery fee calculation
- Payment integration

### 7. **Payments** (`src/lib/razorpay.ts`)
- Razorpay integration
- Order creation → Payment → Verification
- Cash on Delivery option

### 8. **Background Jobs** (`src/lib/inngest/functions.ts`)
- 16+ automated functions
- Email/SMS notifications
- Search indexing
- Cleanup tasks
- Event-driven architecture

### 9. **Search** (`src/lib/typesense.ts`)
- Fast, typo-tolerant search
- Product & shop search
- Auto-complete

### 10. **Notifications** (`convex/notifications.ts`)
- In-app (Convex realtime)
- Push (OneSignal)
- SMS (Twilio/MSG91)
- Email (Inngest)

---

## 🔄 Key Workflows

### **Order Placement**
```
Cart → Checkout → Validate Stock → Calculate ETA → 
Create Order → Process Payment → Update Stock → 
Send Notifications → Track Order
```

### **User Registration**
```
Signup → Email Verification → Session Created → 
Sync to Convex → Update Store → Redirect (Role-based)
```

### **Product Creation**
```
Fill Form → Upload Images → Create in Convex → 
Index in Typesense → Display in Shop
```

---

## 🗄️ Database Schema (18 Tables)

**Core Tables**:
- `users` - All user types
- `shops` - Shop info + delivery profile
- `products` - Product details + stock
- `orders` - Order info + status
- `order_items` - Order line items
- `cart` - Shopping cart
- `categories` - Product categories
- `reviews` - Reviews & ratings
- `notifications` - In-app notifications
- `favorites` - Wishlist
- `coupons` - Discount codes
- `shopkeeper_applications` - Registration
- `riders` - Delivery riders
- `user_locations` - Saved addresses
- `search_analytics` - Search tracking
- `system_settings` - Config
- `admin_audit_logs` - Admin actions
- `login_logs` - Login tracking

---

## 🌐 API Endpoints (20+)

**Key Endpoints**:
- `POST /api/order/create` - Create order
- `POST /api/payment/razorpay/initiate` - Start payment
- `POST /api/payment/razorpay/verify` - Verify payment
- `GET /api/vendors/nearby` - Nearby shops + ETA
- `POST /api/reviews/add` - Add review
- `POST /api/shopkeeper/products/create` - Create product
- `GET /api/orders/history` - Order history
- `POST /api/inngest` - Inngest webhook

---

## 📊 Code Statistics

- **Files**: 200+ TypeScript/TSX files
- **Lines**: ~15,000+ lines
- **Components**: 70+ React components
- **API Routes**: 20+ endpoints
- **Convex Functions**: 16+ modules
- **Database Tables**: 18 tables
- **Background Jobs**: 16+ Inngest functions
- **UI Components**: 40+ Shadcn components

---

## ✨ Key Features

### **Customer**
✅ Product browsing & search
✅ Shopping cart & checkout
✅ Order tracking
✅ Payment (Razorpay + COD)
✅ Reviews & ratings
✅ Wishlist
✅ Notifications
✅ Location management

### **Shopkeeper**
✅ Registration & onboarding
✅ Shop creation
✅ Product management
✅ Bulk upload
✅ Order management
✅ Analytics dashboard
✅ Coupons
✅ Low stock alerts

### **Admin**
✅ User management
✅ Shopkeeper approval
✅ Shop verification
✅ Platform analytics

### **Technical**
✅ Realtime updates
✅ ETA calculation
✅ Location-based search
✅ Typo-tolerant search
✅ Background jobs
✅ Payment integration
✅ Push notifications
✅ Dark/Light theme
✅ PWA support

---

## 🎯 ETA Calculation Formula

```
Prep Time = basePrepMinutes + (excessOrders × 2)
Travel Time = (distanceKm / avgRiderSpeedKmph) × 60
Peak Hour Multiplier = 1.25x (if 7-10 AM or 6-10 PM)
Final ETA = Prep Time + Travel Time + Buffer
Safe Range = [rawEta - 5, rawEta + 5] minutes
```

**Default Store Profile**:
- Base Prep: 5 minutes
- Max Parallel Orders: 3
- Buffer: 5 minutes
- Avg Rider Speed: 20 kmph

---

## 🔐 Security Features

- ✅ Role-based access control (RBAC)
- ✅ Route guards (ShopkeeperGuard, AdminGuard)
- ✅ Input validation (Zod)
- ✅ Secure payment flow (Razorpay signature verification)
- ✅ SQL injection prevention (Convex)
- ✅ XSS protection
- ✅ CSRF protection

---

## 🚀 Performance Optimizations

- ✅ Server Components (Next.js)
- ✅ Image optimization
- ✅ Code splitting
- ✅ Redis caching
- ✅ Convex query caching
- ✅ Optimistic UI updates
- ✅ Debounced search

---

## 📱 Mobile-First Design

- ✅ Responsive layout (320px → 2560px)
- ✅ Touch-friendly UI
- ✅ Mobile header with dynamic ETA
- ✅ Bottom navigation
- ✅ PWA support
- ✅ Offline capability

---

## 🎨 Design System

- **Primary Color**: Forest Green (#10b981)
- **Secondary Color**: Vibrant Orange (#ff6b00)
- **Accent**: Sunny Yellow
- **Fonts**: Open Sans (body) + Montserrat (headings)
- **Theme**: Dark/Light mode support
- **Components**: Shadcn UI (40+ components)

---

## 🔧 Development Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Lint code
```

---

## 📝 Environment Variables

**Required**:
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

## 🎯 Presentation Talking Points

1. **Modern Stack**: Next.js 16 + TypeScript + Convex + Supabase
2. **Realtime**: Live updates, notifications, order tracking
3. **Type-Safe**: End-to-end type safety with tRPC
4. **Scalable**: Multi-tenant architecture, modular design
5. **Feature-Rich**: 100+ features across 4 portals
6. **Performance**: Optimized with caching, code splitting
7. **Security**: RBAC, input validation, secure payments
8. **Mobile-First**: Responsive, PWA, touch-friendly
9. **Production-Ready**: Error handling, monitoring, analytics

---

*Quick Reference for Presentation*
*See PRESENTATION_DOCUMENTATION.md for detailed analysis*
