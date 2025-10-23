# MohallaMart: A Local Shop E-Commerce Platform

Bridging the gap between digital convenience and local commerce through innovative multi-tenant architecture. Built with Next.js 15, TypeScript, and Tailwind CSS, it features authentication, search, cart management, and responsive design for neighborhood delivery services.

```bash
git clone <repository-url>
cd MohallaMart
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## ✨ Features

- **🔐 Authentication**: Supabase Auth with OTP support for phone/email verification
- **🔍 Smart Search**: Typesense-powered fast, typo-tolerant product search
- **🛒 Shopping Cart**: Persistent cart with realtime synchronization
- **📍 Location**: Google Maps integration with delivery tracking
- **💳 Payments**: Razorpay integration for secure transactions
- **📱 Notifications**: OneSignal push notifications + SMS via Twilio/MSG91
- **📱 Responsive**: Mobile-first design with smooth animations
- **🎨 Modern UI**: Shadcn UI components with MohallaMart brand colors

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.3 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (integrated with CSS custom properties) + Shadcn UI components
- **State Management**: Zustand with persistence
- **Animations**: Framer Motion (limited usage)
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)

### Backend & Database
- **Backend**: Convex (realtime backend) + tRPC (type-safe APIs)
- **Database**: Supabase (PostgreSQL) + Redis (caching layer)
- **Authentication**: Supabase Auth with OTP support
- **Search**: Typesense (fast, typo-tolerant search)
- **Background Jobs**: Inngest (reliable job processing)

### External Services
- **Payments**: Razorpay (payment gateway)
- **Maps**: Google Maps API (location services)
- **Notifications**: OneSignal (push notifications) + Twilio/MSG91 (SMS)
- **Storage**: Cloudinary / UploadThing (file uploads)

## 🎨 Brand Colors

- **Primary**: Forest Green (#2E7D32)
- **Secondary**: Vibrant Orange (#F97316)
- **Accent**: Sunny Yellow (#FBBF24)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── api/               # API routes (tRPC endpoints)
│   ├── globals.css        # Global styles with MohallaMart colors
│   ├── layout.tsx         # Root layout with hydration fixes
│   └── page.tsx           # Homepage (component-based)
├── components/            # Reusable React components
│   ├── auth/              # Authentication forms (LoginForm, SignupForm)
│   ├── sections/          # Homepage sections (Hero, Features, etc.)
│   ├── ui/                # Shadcn UI components
│   ├── Navbar.tsx         # Main navigation
│   ├── SearchBar.tsx      # Search functionality
│   ├── CartSidebar.tsx    # Shopping cart
│   └── LocationModal.tsx  # Location selection
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Supabase authentication hook
│   ├── useConvex.ts       # Convex realtime hooks
│   └── useTRPC.ts         # tRPC query/mutation hooks
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Supabase client configuration
│   ├── convex.ts         # Convex client setup
│   ├── trpc.ts           # tRPC client configuration
│   ├── typesense.ts      # Search client setup
│   ├── redis.ts          # Redis cache client
│   └── utils.ts          # Shared utilities
├── convex/               # Convex backend functions
│   ├── auth.ts           # Authentication mutations
│   ├── products.ts       # Product management
│   ├── orders.ts         # Order processing
│   └── notifications.ts  # Notification handling
├── server/               # tRPC router definitions
│   ├── routers/          # API route handlers
│   └── trpc.ts           # tRPC setup
└── store/                # Zustand state management
    └── useStore.ts       # Global app state
```

## 🔧 Setup Requirements

1. **Environment Variables** (create `.env.local`):
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Convex
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Redis
REDIS_URL=your_redis_url

# Typesense
TYPESENSE_API_KEY=your_typesense_api_key
TYPESENSE_HOST=your_typesense_host

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key

# Twilio/MSG91
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Cloudinary/UploadThing
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
```

2. **Service Setup**: Follow `env.example` for complete configuration

## 🏗️ Architecture Overview

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and Shadcn UI
- **Backend**: Convex for realtime features + tRPC for type-safe APIs
- **Database**: Supabase PostgreSQL with Redis caching layer
- **Authentication**: Supabase Auth with OTP support
- **Search**: Typesense for fast, typo-tolerant product search
- **Payments**: Razorpay integration for secure transactions
- **Maps**: Google Maps API for location services
- **Notifications**: OneSignal (push) + Twilio/MSG91 (SMS)
- **Storage**: Cloudinary/UploadThing for file uploads
- **Background Jobs**: Inngest for reliable job processing
- **State Management**: Zustand with persistence and realtime sync via Convex

## 🎯 Key Features

- **Realtime Sync**: Convex provides realtime data synchronization
- **Type Safety**: tRPC ensures end-to-end type safety
- **Fast Search**: Typesense-powered search with faceted filtering
- **Secure Payments**: Razorpay integration with proper validation
- **Location Services**: Google Maps integration for delivery tracking
- **Push Notifications**: OneSignal for user engagement
- **SMS Integration**: Twilio/MSG91 for order updates
- **File Storage**: Cloudinary/UploadThing for image uploads
- **Background Jobs**: Inngest for reliable job processing
- **Caching**: Redis layer for improved performance

## 📱 Responsive Design

- Mobile-first approach with hamburger menu
- Smooth animations and transitions
- Touch-friendly interface elements

## 🚀 Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

Built with ❤️ by the MohallaMart Team

```
Developed by [@dheeraj0342](https://github.com/dheeraj0342), [@Snehagupta00](https://github.com/Snehagupta00), [@vipinyadav01](https://github.com/vipinyadav01), [@Himanshu-Raghav](https://github.com/Himanshu-Raghav), [@mohd-ajlal](https://github.com/mohd-ajlal), and [@Yashsharma2004](https://github.com/Yashsharma2004).
```