import { Inngest } from "inngest";
import { z } from "zod";

// Define event schemas for type safety
const eventSchemas = {
  // User events
  "user/created": z.object({
    userId: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
  }),
  "user/updated": z.object({
    userId: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
  }),
  "user/deleted": z.object({
    userId: z.string(),
  }),

  // Order events
  "order/created": z.object({
    orderId: z.string(),
    userId: z.string(),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number(),
    })),
    totalAmount: z.number(),
    deliveryAddress: z.object({
      street: z.string(),
      city: z.string(),
      pincode: z.string(),
      state: z.string(),
    }),
  }),
  "order/updated": z.object({
    orderId: z.string(),
    status: z.enum(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]),
    updatedBy: z.string(),
  }),
  "order/cancelled": z.object({
    orderId: z.string(),
    userId: z.string(),
    reason: z.string().optional(),
  }),

  // Product events
  "product/created": z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    category: z.string(),
    shopId: z.string(),
  }),
  "product/updated": z.object({
    productId: z.string(),
    name: z.string().optional(),
    price: z.number().optional(),
    stock: z.number().optional(),
    availability: z.boolean().optional(),
  }),
  "product/out_of_stock": z.object({
    productId: z.string(),
    name: z.string(),
    shopId: z.string(),
  }),

  // Notification events
  "notification/send": z.object({
    userId: z.string(),
    type: z.enum(["email", "sms", "push"]),
    template: z.string(),
    data: z.record(z.string(), z.unknown()),
    priority: z.enum(["low", "normal", "high"]).default("normal"),
  }),

  // Analytics events
  "analytics/track": z.object({
    event: z.string(),
    userId: z.string().optional(),
    properties: z.record(z.string(), z.unknown()),
    timestamp: z.string().optional(),
  }),

  // Search events
  "search/index": z.object({
    type: z.enum(["product", "shop", "user"]),
    id: z.string(),
    data: z.record(z.string(), z.unknown()),
  }),

  // Cleanup events
  "cleanup/expired_sessions": z.object({
    olderThan: z.string(), // ISO date string
  }),
  "cleanup/old_logs": z.object({
    olderThan: z.string(), // ISO date string
  }),
} as const;

// Create Inngest client
export const inngest = new Inngest({
  id: "mohallamart",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// Export event types for use in functions
export type InngestEvents = {
  [K in keyof typeof eventSchemas]: z.infer<typeof eventSchemas[K]>;
};

// Helper function to send events with proper typing
export const sendEvent = async <T extends keyof InngestEvents>(
  eventName: T,
  data: InngestEvents[T]
) => {
  return await inngest.send({
    name: eventName,
    data,
  });
};

// Helper function to send multiple events
export const sendEvents = async (events: Array<{ name: string; data: Record<string, unknown> }>) => {
  return await inngest.send(events);
};
