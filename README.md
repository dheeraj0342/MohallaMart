# MohallaMart: A Local Shop E-Commerce Platform

Bridging the gap between digital convenience and local commerce through innovative multi-tenant architecture.

```bash
git clone <repository-url>
cd MohallaMart
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## ✨ Features

- **🔐 Authentication**: Supabase login/signup with email verification
- **🔍 Smart Search**: Real-time product search with trending suggestions
- **🛒 Shopping Cart**: Persistent cart with quantity management
- **📍 Location**: Geolocation detection with manual selection
- **📱 Responsive**: Mobile-first design with smooth animations
- **🎨 Modern UI**: MohallaMart brand colors and consistent styling

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 + TypeScript
- **Styling**: Tailwind CSS 4 with custom brand colors
- **State**: Zustand with localStorage persistence
- **Auth**: Supabase authentication
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🎨 Brand Colors

- **Primary**: Forest Green (#2E7D32)
- **Secondary**: Vibrant Orange (#F97316)
- **Accent**: Sunny Yellow (#FBBF24)

## 📁 Key Files

```
src/
├── app/
│   ├── auth/page.tsx          # Authentication page
│   └── page.tsx               # Homepage (modular components)
├── components/
│   ├── auth/                  # Login/signup forms
│   ├── sections/              # Homepage sections
│   ├── Navbar.tsx             # Navigation with auth
│   ├── SearchBar.tsx          # Search functionality
│   └── CartSidebar.tsx        # Shopping cart
├── hooks/
│   └── useAuth.ts             # Authentication hook
├── lib/
│   └── supabase.ts            # Supabase client
└── store/
    └── useStore.ts            # Global state management
```

## 🔧 Setup Requirements

1. **Environment Variables** (create `.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. **Supabase Setup**: Follow `env.example` for configuration

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