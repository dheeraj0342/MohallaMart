# Data Management with Inngest Integration

## Overview

This guide explains how to use Inngest for comprehensive data management in MohallaMart. While Inngest is primarily a background job processing platform, we've integrated it with our data synchronization layer to provide event-driven data management across all services.

## Architecture

```
Frontend → DataSyncManager → [Supabase, Convex, Inngest, Redis, Typesense]
                ↓
        Event-Driven Updates
                ↓
        Background Processing
```

## Data Flow

### 1. **Data Creation Flow**
```typescript
// Create user data across all services
const user = await DataSyncManager.createUser({
  id: "user123",
  email: "user@example.com",
  name: "John Doe"
});

// This automatically:
// 1. Saves to Supabase (primary database)
// 2. Syncs to Convex (real-time layer)
// 3. Triggers Inngest events (background processing)
// 4. Updates search index (Typesense)
```

### 2. **Event-Driven Updates**
```typescript
// When data changes, events are triggered automatically
await DataSyncManager.updateProductStock("product123", -5);

// This triggers:
// 1. Stock update in Supabase
// 2. Real-time sync to Convex
// 3. Inngest event for inventory management
// 4. Out-of-stock alerts if needed
```

## Available Data Operations

### User Management
```typescript
import { DataSyncManager } from '@/lib/data/sync';

// Create user
const user = await DataSyncManager.createUser({
  id: "user123",
  email: "user@example.com",
  name: "John Doe"
});

// Get user data
const userData = await DataSyncManager.getProduct("user123");
```

### Product Management
```typescript
// Create product
const product = await DataSyncManager.createProduct({
  id: "product123",
  name: "Organic Apples",
  price: 150,
  category: "fruits",
  shopId: "shop123",
  stock: 100
});

// Update inventory
await DataSyncManager.updateProductStock("product123", -5);

// Search products
const products = await DataSyncManager.searchProducts("apples");
```

### Order Management
```typescript
// Create order
const order = await DataSyncManager.createOrder({
  id: "order123",
  userId: "user123",
  items: [
    { productId: "product123", quantity: 2, price: 150 }
  ],
  totalAmount: 300,
  deliveryAddress: {
    street: "123 Main St",
    city: "Mumbai",
    pincode: "400001",
    state: "Maharashtra"
  }
});

// Update order status
await DataSyncManager.updateOrderStatus("order123", "confirmed", "shop123");
```

## Inngest Event Integration

### Automatic Event Triggers
All data operations automatically trigger Inngest events:

- **User Creation** → `user/created` event
- **Product Creation** → `product/created` event
- **Order Creation** → `order/created` event
- **Stock Updates** → `product/updated` event
- **Order Status Changes** → `order/updated` event

### Background Processing
Inngest handles background processing for:

1. **Email Notifications**
   - Welcome emails
   - Order confirmations
   - Status updates

2. **Data Synchronization**
   - Cross-service data sync
   - Cache updates
   - Search index updates

3. **Analytics Tracking**
   - User behavior tracking
   - Order analytics
   - Product performance metrics

4. **Inventory Management**
   - Stock alerts
   - Out-of-stock notifications
   - Inventory synchronization

## Event-Driven Workflows

### User Registration Workflow
```typescript
import { workflows } from '@/lib/inngest/events';

// Complete user registration with all background processing
await workflows.userRegistration({
  userId: "user123",
  email: "user@example.com",
  name: "John Doe"
});

// This automatically triggers:
// 1. User creation in all services
// 2. Welcome email sending
// 3. Analytics tracking
// 4. Search index updates
```

### Order Processing Workflow
```typescript
// Complete order processing workflow
await workflows.orderCreation({
  orderId: "order123",
  userId: "user123",
  items: [...],
  totalAmount: 300,
  deliveryAddress: {...}
});

// This automatically triggers:
// 1. Order creation in all services
// 2. Confirmation email
// 3. Inventory updates
// 4. Analytics tracking
// 5. Shop notifications
```

## Data Synchronization Patterns

### 1. **Write-Through Pattern**
All writes go through the DataSyncManager:
```typescript
// Single write operation syncs to all services
await DataSyncManager.createProduct(productData);
```

### 2. **Event-Driven Updates**
Changes trigger automatic synchronization:
```typescript
// Update triggers events for all dependent services
await DataSyncManager.updateProductStock("product123", -5);
```

### 3. **Real-time Sync**
Convex provides real-time updates to frontend:
```typescript
// Frontend automatically receives updates via Convex
const products = useQuery(api.products.list);
```

## Monitoring and Observability

### Data Sync Monitoring
Inngest monitors data synchronization:
```typescript
// Automatic monitoring every 5 minutes
export const monitorDataSync = inngest.createFunction(
  { id: "monitor-data-sync" },
  { cron: "*/5 * * * *" },
  async ({ step }) => {
    // Check for inconsistencies between services
    // Log sync status and performance metrics
  }
);
```

### Error Handling
Comprehensive error handling across all services:
```typescript
try {
  await DataSyncManager.createUser(userData);
} catch (error) {
  // Automatic retry via Inngest
  // Error logging and monitoring
  // Rollback mechanisms
}
```

## Best Practices

### 1. **Always Use DataSyncManager**
```typescript
// ✅ Good - Use DataSyncManager
await DataSyncManager.createProduct(productData);

// ❌ Bad - Direct database access
await supabase.from('products').insert(productData);
```

### 2. **Handle Events Properly**
```typescript
// ✅ Good - Use event helpers
await userEvents.created(userData);

// ❌ Bad - Direct event sending
await inngest.send({ name: "user/created", data: userData });
```

### 3. **Use Workflows for Complex Operations**
```typescript
// ✅ Good - Use workflows for complex operations
await workflows.userRegistration(userData);

// ❌ Bad - Manual event orchestration
await userEvents.created(userData);
await notificationEvents.send(...);
await analyticsEvents.track(...);
```

## Performance Optimization

### Caching Strategy
- Redis cache for frequently accessed data
- Automatic cache invalidation on updates
- Cache warming for popular products

### Batch Operations
- Batch multiple operations together
- Use Inngest for reliable batch processing
- Implement proper retry policies

### Monitoring
- Track data sync performance
- Monitor error rates
- Set up alerts for critical failures

## Security Considerations

### Data Validation
- All data validated with Zod schemas
- Proper authentication checks
- Input sanitization

### Access Control
- Row-level security in Supabase
- Proper permission checks
- Audit logging for sensitive operations

## Troubleshooting

### Common Issues

1. **Data Inconsistency**
   - Check Inngest function logs
   - Verify event triggers
   - Use monitoring functions

2. **Sync Failures**
   - Check service connectivity
   - Verify environment variables
   - Review error logs

3. **Performance Issues**
   - Monitor cache hit rates
   - Check database performance
   - Optimize queries

### Debug Mode
Enable debug mode for development:
```typescript
// In development, enable detailed logging
if (process.env.NODE_ENV === 'development') {
  console.log('Data sync operation:', operation);
}
```

## Conclusion

This data management system provides:
- **Reliability**: Event-driven architecture with automatic retries
- **Consistency**: Data synchronized across all services
- **Performance**: Caching and optimization strategies
- **Scalability**: Distributed architecture with monitoring
- **Maintainability**: Clear separation of concerns and error handling

All data operations go through the DataSyncManager, which ensures consistency across Supabase, Convex, Inngest, Redis, and Typesense while providing comprehensive background processing capabilities.
