import { serve } from "inngest/next";
import { inngest } from "../inngest";
import { validateInngestEnv, logValidationResults } from "./validation";
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
  monitorDataSync,
} from "./functions";
import { onShopkeeperApplied, onShopkeeperApproved } from "./functions";

// Validate environment variables on startup
const validationResult = validateInngestEnv();
logValidationResults(validationResult);

// Create the serve handler with error handling
export const serveHandler = serve({
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
    onShopkeeperApplied,
    onShopkeeperApproved,
  ],
  streaming: "allow",
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
