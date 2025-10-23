# MohallaMart Backend Architecture

## Overview

MohallaMart uses a multi-layered backend architecture where each service has a specific purpose:

- **Convex**: Real-time data synchronization and mutations
- **Supabase**: Primary database (PostgreSQL) and authentication
- **Inngest**: Background job processing and event-driven workflows
- **Redis**: Caching layer for improved performance
- **Typesense**: Search engine for products and shops

## Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Convex        │    │   Supabase      │
│   (Next.js)     │◄──►│   (Realtime)    │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Inngest       │    │   Redis         │    │   Typesense     │
│   (Background   │    │   (Cache)       │    │   (Search)      │
│    Jobs)        │    └─────────────────┘    └─────────────────┘
└─────────────────┘
```

## Service Responsibilities

### 🗄️ **Supabase (Primary Database)**
- **Purpose**: Primary data storage and persistence
- **Data Types**: Users, products, orders, shops, inventory
- **Features**: PostgreSQL, real-time subscriptions, authentication

### ⚡ **Convex (Real-time Layer)**
- **Purpose**: Real-time data synchronization and mutations
- **Data Types**: Live updates, real-time state management
- **Features**: Automatic sync, optimistic updates, offline support

### 🔄 **Inngest (Background Processing)**
- **Purpose**: Event-driven background jobs and workflows
- **Data Types**: Event logs, job status, processing queues
- **Features**: Reliable job processing, retries, scheduling

### 🚀 **Redis (Caching)**
- **Purpose**: High-performance caching layer
- **Data Types**: Session data, frequently accessed data
- **Features**: Fast reads/writes, expiration policies

### 🔍 **Typesense (Search)**
- **Purpose**: Fast, typo-tolerant search
- **Data Types**: Search indexes for products and shops
- **Features**: Faceted search, auto-complete, typo tolerance

## Data Synchronization Patterns

### 1. **Write-Through Pattern**
```
Frontend → Convex → Supabase → Inngest → External Services
```

### 2. **Event-Driven Updates**
```
Supabase Trigger → Inngest Event → Background Processing → Cache Update
```

### 3. **Real-time Sync**
```
Convex Mutation → Supabase Update → Real-time Broadcast → Frontend Update
```

## Implementation Strategy

### Database Schema (Supabase)
- **Users**: Authentication and profile data
- **Products**: Product catalog and inventory
- **Orders**: Order management and tracking
- **Shops**: Shop information and settings
- **Categories**: Product categorization

### Event Schema (Inngest)
- **User Events**: Registration, updates, authentication
- **Order Events**: Creation, status changes, fulfillment
- **Product Events**: Inventory changes, pricing updates
- **Shop Events**: Registration, settings updates

### Cache Strategy (Redis)
- **Session Data**: User sessions and authentication tokens
- **Product Data**: Frequently accessed product information
- **Search Results**: Cached search queries and results
- **Location Data**: Delivery areas and shop locations

## Data Access Patterns

### 1. **Read Operations**
```
Frontend → Redis Cache → (if miss) → Supabase → Cache Update
```

### 2. **Write Operations**
```
Frontend → Convex → Supabase → Inngest Event → Background Processing
```

### 3. **Search Operations**
```
Frontend → Typesense → Cached Results → Redis
```

## Event-Driven Architecture

### User Registration Flow
1. User submits registration form
2. Convex creates user in Supabase
3. Inngest triggers welcome email job
4. Analytics event is tracked
5. Search index is updated

### Order Processing Flow
1. User places order via Convex
2. Order saved to Supabase
3. Inventory updated
4. Inngest triggers confirmation email
5. Shop notification sent
6. Analytics tracked

### Product Updates Flow
1. Shop updates product via Convex
2. Product updated in Supabase
3. Search index updated via Inngest
4. Cache invalidated
5. Real-time update broadcast

## Best Practices

### Data Consistency
- Use Supabase as the source of truth
- Implement proper error handling and rollbacks
- Use database transactions for critical operations

### Performance Optimization
- Cache frequently accessed data in Redis
- Use Convex for real-time updates
- Implement proper indexing in Supabase

### Event Processing
- Use Inngest for reliable background processing
- Implement proper retry policies
- Monitor job performance and failures

### Security
- Use Supabase Row Level Security (RLS)
- Implement proper authentication checks
- Validate all data inputs

## Monitoring and Observability

### Database Monitoring
- Monitor Supabase performance and queries
- Track Redis cache hit rates
- Monitor Typesense search performance

### Event Monitoring
- Track Inngest job success/failure rates
- Monitor event processing times
- Set up alerts for critical failures

### Application Monitoring
- Monitor Convex real-time connections
- Track API response times
- Monitor error rates and user experience

## Scalability Considerations

### Horizontal Scaling
- Supabase auto-scaling capabilities
- Redis cluster for high availability
- Typesense distributed search

### Performance Optimization
- Database query optimization
- Efficient caching strategies
- Background job optimization

### Cost Management
- Monitor database usage and costs
- Optimize cache usage
- Efficient event processing

## Migration Strategy

### Phase 1: Core Setup
- Set up Supabase database schema
- Configure Convex for real-time sync
- Implement basic Inngest functions

### Phase 2: Advanced Features
- Add Redis caching layer
- Implement Typesense search
- Add comprehensive monitoring

### Phase 3: Optimization
- Performance tuning
- Cost optimization
- Advanced analytics

## Conclusion

This architecture provides:
- **Reliability**: Multiple layers of data persistence
- **Performance**: Caching and real-time updates
- **Scalability**: Distributed architecture
- **Maintainability**: Clear separation of concerns

Each service has a specific role, and together they provide a robust, scalable backend for MohallaMart.
