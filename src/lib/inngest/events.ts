import { sendEvent, type InngestEvents } from "../inngest";

/**
 * Event helper functions for common MohallaMart operations
 * These functions provide a clean API for triggering Inngest events throughout the application
 */

// User event helpers
export const userEvents = {
  created: (data: InngestEvents["user/created"]) => 
    sendEvent("user/created", data),
  
  updated: (data: InngestEvents["user/updated"]) => 
    sendEvent("user/updated", data),
  
  deleted: (data: InngestEvents["user/deleted"]) => 
    sendEvent("user/deleted", data),
};

// Order event helpers
export const orderEvents = {
  created: (data: InngestEvents["order/created"]) => 
    sendEvent("order/created", data),
  
  updated: (data: InngestEvents["order/updated"]) => 
    sendEvent("order/updated", data),
  
  cancelled: (data: InngestEvents["order/cancelled"]) => 
    sendEvent("order/cancelled", data),
};

// Product event helpers
export const productEvents = {
  created: (data: InngestEvents["product/created"]) => 
    sendEvent("product/created", data),
  
  updated: (data: InngestEvents["product/updated"]) => 
    sendEvent("product/updated", data),
  
  outOfStock: (data: InngestEvents["product/out_of_stock"]) => 
    sendEvent("product/out_of_stock", data),
};

// Notification event helpers
export const notificationEvents = {
  send: (data: InngestEvents["notification/send"]) => 
    sendEvent("notification/send", data),
};

// Analytics event helpers
export const analyticsEvents = {
  track: (data: InngestEvents["analytics/track"]) => 
    sendEvent("analytics/track", data),
};

// Search event helpers
export const searchEvents = {
  index: (data: InngestEvents["search/index"]) => 
    sendEvent("search/index", data),
};

// Cleanup event helpers
export const cleanupEvents = {
  expiredSessions: (data: InngestEvents["cleanup/expired_sessions"]) => 
    sendEvent("cleanup/expired_sessions", data),
  
  oldLogs: (data: InngestEvents["cleanup/old_logs"]) => 
    sendEvent("cleanup/old_logs", data),
};

// Convenience functions for common workflows
export const workflows = {
  /**
   * Complete user registration workflow
   * Triggers welcome email and analytics tracking
   */
  userRegistration: async (userData: InngestEvents["user/created"]) => {
    await Promise.all([
      userEvents.created(userData),
      notificationEvents.send({
        userId: userData.userId,
        type: "email",
        template: "welcome",
        data: { name: userData.name, email: userData.email },
        priority: "high",
      }),
      analyticsEvents.track({
        event: "user_registered",
        userId: userData.userId,
        properties: {
          registrationMethod: "email", // or "phone"
          timestamp: new Date().toISOString(),
        },
      }),
    ]);
  },

  /**
   * Complete order creation workflow
   * Triggers confirmation email, inventory updates, and analytics
   */
  orderCreation: async (orderData: InngestEvents["order/created"]) => {
    await Promise.all([
      orderEvents.created(orderData),
      notificationEvents.send({
        userId: orderData.userId,
        type: "email",
        template: "order_confirmation",
        data: {
          orderId: orderData.orderId,
          totalAmount: orderData.totalAmount,
          items: orderData.items,
        },
        priority: "high",
      }),
      analyticsEvents.track({
        event: "order_created",
        userId: orderData.userId,
        properties: {
          orderId: orderData.orderId,
          totalAmount: orderData.totalAmount,
          itemCount: orderData.items.length,
          timestamp: new Date().toISOString(),
        },
      }),
    ]);
  },

  /**
   * Product indexing workflow
   * Indexes product in search engine and tracks analytics
   */
  productIndexing: async (productData: InngestEvents["search/index"]) => {
    await Promise.all([
      searchEvents.index(productData),
      analyticsEvents.track({
        event: "product_indexed",
        properties: {
          type: productData.type,
          id: productData.id,
          timestamp: new Date().toISOString(),
        },
      }),
    ]);
  },
};

// Error handling wrapper for event sending
export const safeSendEvent = async <T extends keyof InngestEvents>(
  eventName: T,
  data: InngestEvents[T]
) => {
  try {
    return await sendEvent(eventName, data);
  } catch (error) {
    console.error(`Failed to send event ${eventName}:`, error);
    // In production, you might want to log this to your error tracking service
    throw error;
  }
};
