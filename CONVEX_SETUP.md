# Convex Integration Setup Guide

This document explains how to set up Convex for the MohallaMart project and replace the mock implementation with real Convex functionality.

## 🚀 Quick Start

### 1. Install Convex CLI

```bash
npm install -g convex
```

### 2. Initialize Convex

```bash
npx convex dev --configure
```

### 3. Set Environment Variables

Create a `.env.local` file with your Convex deployment URL:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

### 4. Deploy Convex Functions

```bash
npx convex dev
```

## 📁 Project Structure

The Convex integration follows this structure:

```
convex/
├── _generated/          # Auto-generated files
├── schema.ts           # Database schema
├── users.ts            # User management functions
├── products.ts         # Product management functions
├── cart.ts             # Shopping cart functions
├── orders.ts           # Order management functions
├── locations.ts        # Location management functions
├── notifications.ts    # Notification functions
└── seed.ts             # Database seeding functions
```

## 🔧 Implementation Details

### Database Schema

The schema includes tables for:

- **Users**: User profiles and authentication
- **Products**: Product catalog with categories and inventory
- **Cart Items**: Shopping cart functionality
- **Orders**: Order management and tracking
- **Order Items**: Individual items within orders
- **Locations**: User delivery addresses
- **Notifications**: User notifications and alerts

### React Hooks

Custom hooks are provided for all Convex operations:

- `useProducts()` - Fetch products with filtering
- `useCart()` - Shopping cart management
- `useOrders()` - Order history and management
- `useLocations()` - Address management
- `useNotifications()` - Notification system

### State Management

The Zustand store has been enhanced with:

- Convex connection status tracking
- Real-time data synchronization methods
- Integration with Convex mutations and queries

## 🔄 Migration from Mock to Real Convex

### Step 1: Replace Mock Hooks

Update `src/hooks/useConvex.ts` to use real Convex hooks:

```typescript
// Replace mock implementation with:
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
```

### Step 2: Update ConvexProvider

Replace the mock provider in `src/components/ConvexProvider.tsx`:

```typescript
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexProviderWrapper({ children }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
```

### Step 3: Seed Database

Run the seed function to populate initial data:

```typescript
// In your app or admin panel
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const seedProducts = useMutation(api.seed.seedProducts);
await seedProducts();
```

## 🎯 Key Features

### Real-time Updates

- Cart updates sync across devices
- Order status changes in real-time
- Live inventory updates
- Instant notifications

### Type Safety

- End-to-end TypeScript types
- Auto-generated API types
- Compile-time error checking

### Performance

- Optimistic updates
- Efficient caching
- Minimal re-renders

## 🛠️ Development Workflow

### 1. Local Development

```bash
# Start Convex dev server
npx convex dev

# Start Next.js dev server
npm run dev
```

### 2. Database Management

```bash
# View database in dashboard
npx convex dashboard

# Deploy to production
npx convex deploy
```

### 3. Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check
```

## 📊 Monitoring

### Convex Dashboard

- Real-time function logs
- Database queries
- Performance metrics
- Error tracking

### Analytics

- User engagement
- Order patterns
- Product performance
- System health

## 🔒 Security

### Authentication

- Supabase Auth integration
- JWT token validation
- User session management

### Data Protection

- Row-level security
- Input validation
- SQL injection prevention
- XSS protection

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Set production environment variables
NEXT_PUBLIC_CONVEX_URL=your_production_url
```

### 2. Deploy Convex

```bash
npx convex deploy --prod
```

### 3. Deploy Next.js

```bash
npm run build
npm run start
```

## 📈 Performance Optimization

### Database Indexes

- Optimized queries for products
- Efficient cart operations
- Fast order lookups
- Quick location searches

### Caching Strategy

- Redis integration for hot data
- CDN for static assets
- Browser caching
- API response caching

## 🐛 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Check environment variables
   - Verify Convex deployment
   - Ensure network connectivity

2. **Type Errors**
   - Regenerate Convex types
   - Check schema consistency
   - Verify imports

3. **Performance Issues**
   - Optimize queries
   - Add database indexes
   - Implement caching

### Debug Tools

- Convex dashboard logs
- Browser dev tools
- Network tab analysis
- Performance profiling

## 📚 Additional Resources

- [Convex Documentation](https://docs.convex.dev)
- [Next.js Integration](https://docs.convex.dev/quickstart/nextjs)
- [TypeScript Guide](https://docs.convex.dev/typescript)
- [Deployment Guide](https://docs.convex.dev/production)

## 🤝 Support

For issues and questions:

- Check the troubleshooting section
- Review Convex documentation
- Open an issue in the repository
- Contact the development team

---

**Note**: This setup provides a solid foundation for a production-ready e-commerce application with real-time capabilities, type safety, and scalable architecture.
