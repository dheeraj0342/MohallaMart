# Inngest Configuration for MohallaMart

This document explains the Inngest configuration and setup for background job processing in the MohallaMart application.

## Overview

Inngest is configured to handle reliable background job processing for various operations like:
- Email notifications (welcome emails, order confirmations)
- Search indexing (products, shops)
- Analytics tracking
- Data cleanup tasks
- Inventory management alerts

## Architecture

```
src/
├── lib/
│   └── inngest/
│       ├── functions.ts    # Background job functions
│       ├── events.ts       # Event helper functions
│       └── inngest.ts      # Inngest client configuration
├── app/
│   └── api/
│       └── inngest/
│           └── route.ts    # API endpoint for Inngest functions
└── components/
    └── InngestProvider.tsx # Client-side provider
```

## Configuration

### Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Inngest Configuration
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
INNGEST_ENV=development
```

Get these values from your [Inngest dashboard](https://app.inngest.com).

### Client Configuration

The Inngest client is configured in `src/lib/inngest.ts` with:
- Event schemas for type safety
- Helper functions for sending events
- Proper error handling

## Available Events

### User Events
- `user/created` - Triggered when a new user registers
- `user/updated` - Triggered when user information is updated
- `user/deleted` - Triggered when a user account is deleted

### Order Events
- `order/created` - Triggered when a new order is placed
- `order/updated` - Triggered when order status changes
- `order/cancelled` - Triggered when an order is cancelled

### Product Events
- `product/created` - Triggered when a new product is added
- `product/updated` - Triggered when product information is updated
- `product/out_of_stock` - Triggered when a product goes out of stock

### Notification Events
- `notification/send` - Generic notification sending event

### Analytics Events
- `analytics/track` - Event tracking for analytics

### Search Events
- `search/index` - Product/shop indexing for search

### Cleanup Events
- `cleanup/expired_sessions` - Clean up expired user sessions
- `cleanup/old_logs` - Clean up old log entries

## Background Functions

### Email Functions
- **sendWelcomeEmail** - Sends welcome email to new users
- **sendOrderConfirmation** - Sends order confirmation emails
- **sendOrderUpdate** - Sends order status update notifications

### Search Functions
- **indexProduct** - Indexes products in search engine (Typesense)

### Cleanup Functions
- **cleanupExpiredSessions** - Removes expired user sessions
- **scheduledCleanup** - Daily scheduled cleanup tasks

### Notification Functions
- **sendNotification** - Generic notification sender (email, SMS, push)

### Analytics Functions
- **trackAnalytics** - Tracks events for analytics

### Inventory Functions
- **processOutOfStockAlert** - Handles out-of-stock notifications

## Usage Examples

### Sending Events

```typescript
import { userEvents, orderEvents, workflows } from '@/lib/inngest/events';

// Send a single event
await userEvents.created({
  userId: "user123",
  email: "user@example.com",
  name: "John Doe"
});

// Use workflow for complex operations
await workflows.userRegistration({
  userId: "user123",
  email: "user@example.com",
  name: "John Doe"
});
```

### Creating Custom Functions

```typescript
import { inngest } from '@/lib/inngest';

export const customFunction = inngest.createFunction(
  { id: "custom-function" },
  { event: "custom/event" },
  async ({ event, step }) => {
    return await step.run("process-data", async () => {
      // Your custom logic here
      return { success: true };
    });
  }
);
```

## Development

### Local Development

1. Install dependencies:
   ```bash
   npm install inngest zod
   ```

2. Set up environment variables in `.env.local`

3. Run your Next.js development server:
   ```bash
   npm run dev
   ```

4. Inngest functions will be available at `/api/inngest`

### Testing Functions

You can test Inngest functions locally using the Inngest CLI:

```bash
# Install Inngest CLI
npm install -g inngest-cli

# Run local development server
inngest-cli dev
```

## Production Deployment

### Environment Setup

1. Create an Inngest account at [app.inngest.com](https://app.inngest.com)
2. Create a new app in your Inngest dashboard
3. Get your event key and signing key
4. Set environment variables in your production environment

### Deployment Considerations

- Ensure your application supports long-running servers (not serverless)
- Set up proper monitoring and alerting for failed jobs
- Configure retry policies for critical functions
- Monitor function performance and optimize as needed

## Monitoring

### Inngest Dashboard

Monitor your functions in the Inngest dashboard:
- Function execution status
- Error rates and logs
- Performance metrics
- Event history

### Error Handling

All functions include proper error handling:
- Automatic retries with exponential backoff
- Error logging and monitoring
- Graceful failure handling

## Best Practices

1. **Event Naming**: Use consistent naming conventions (e.g., `entity/action`)
2. **Type Safety**: Always define event schemas with Zod
3. **Error Handling**: Implement proper error handling in all functions
4. **Monitoring**: Set up monitoring and alerting for critical functions
5. **Testing**: Test functions thoroughly before deployment
6. **Documentation**: Document all custom events and functions

## Integration Points

### Email Services
- Integrate with SendGrid, Resend, or your preferred email service
- Update the email functions in `functions.ts`

### Search Services
- Integrate with Typesense for product indexing
- Update the search indexing functions

### Analytics Services
- Integrate with Mixpanel, Amplitude, or Google Analytics
- Update the analytics tracking functions

### Notification Services
- Integrate with OneSignal for push notifications
- Integrate with Twilio for SMS notifications

## Troubleshooting

### Common Issues

1. **Function not triggering**: Check event names and schemas
2. **Environment variables**: Ensure all required env vars are set
3. **Network issues**: Check firewall and network configuration
4. **Function timeouts**: Optimize function performance or increase timeout

### Debug Mode

Enable debug mode in development:
```typescript
const inngest = new Inngest({
  id: "mohallamart",
  isDev: process.env.NODE_ENV === "development",
});
```

## Security

- Never expose signing keys in client-side code
- Use proper authentication for API endpoints
- Validate all event data with schemas
- Implement rate limiting for event sending

## Performance

- Use step functions for long-running operations
- Implement proper caching strategies
- Monitor function execution times
- Optimize database queries in functions

## Future Enhancements

- Add more sophisticated retry policies
- Implement function versioning
- Add more comprehensive monitoring
- Create function templates for common patterns
- Add automated testing for functions
