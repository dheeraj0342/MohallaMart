import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { 
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendOrderUpdate,
  indexProduct,
  cleanupExpiredSessions,
  sendNotification,
  trackAnalytics,
  processOutOfStockAlert,
  syncUserData,
  syncProductData,
  syncOrderData,
  syncInventoryUpdate,
  scheduledCleanup,
  monitorDataSync
} from "@/lib/inngest/functions";

// Serve all Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Email and notification functions
    sendWelcomeEmail,
    sendOrderConfirmation,
    sendOrderUpdate,
    sendNotification,
    
    // Search and indexing functions
    indexProduct,
    
    // Data synchronization functions
    syncUserData,
    syncProductData,
    syncOrderData,
    syncInventoryUpdate,
    
    // Cleanup and monitoring functions
    cleanupExpiredSessions,
    scheduledCleanup,
    monitorDataSync,
    
    // Analytics and inventory functions
    trackAnalytics,
    processOutOfStockAlert,
  ],
  streaming: "allow",
  // Vercel deployment protection configuration
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
