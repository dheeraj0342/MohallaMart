/**
 * Notification System
 * Handles notifications via DB, WebSocket, Email, and SMS
 */

import type { Id } from "@/../convex/_generated/dataModel";

export type NotificationType = "ORDER" | "DELIVERY" | "PAYMENT" | "SYSTEM";

export interface NotificationPayload {
  userId: Id<"users">;
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, unknown>;
}

/**
 * Send notification to a user
 * - Saves to DB (Convex)
 * - Emits WebSocket event (via Convex real-time)
 * - Sends email (placeholder - integrate with nodemailer/resend)
 * - Sends SMS (placeholder - integrate with msg91/twilio)
 */
export async function notifyUser(
  userId: Id<"users">,
  title: string,
  message: string,
  type: NotificationType = "SYSTEM",
  data?: Record<string, unknown>
): Promise<void> {
  try {
    // 1. Save to DB via API route (which calls Convex mutation)
    await fetch("/api/notifications/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        title,
        message,
        type,
        data,
      }),
    });

    // 2. WebSocket event is handled automatically by Convex real-time subscriptions
    // Clients subscribed to notifications will receive updates automatically

    // 3. Email notification (placeholder - integrate with nodemailer/resend)
    // TODO: Integrate with email service
    // await sendEmailNotification(userId, title, message);

    // 4. SMS notification (placeholder - integrate with msg91/twilio)
    // TODO: Integrate with SMS service
    // await sendSMSNotification(userId, message);
  } catch (error) {
    console.error("[Notifier] Error sending notification:", error);
    // Don't throw - notifications should be non-blocking
  }
}

/**
 * Send notification to a shopkeeper
 * Gets shopkeeper's user ID from shop owner_id
 */
export async function notifyShopkeeper(
  shopkeeperId: Id<"users">,
  title: string,
  message: string,
  type: NotificationType = "ORDER",
  data?: Record<string, unknown>
): Promise<void> {
  await notifyUser(shopkeeperId, title, message, type, data);
}

/**
 * Send notification to a rider
 * Gets rider's user ID from rider rider_id
 */
export async function notifyRider(
  riderId: Id<"users">,
  title: string,
  message: string,
  type: NotificationType = "DELIVERY",
  data?: Record<string, unknown>
): Promise<void> {
  await notifyUser(riderId, title, message, type, data);
}

/**
 * Email notification helper (placeholder)
 * TODO: Integrate with nodemailer or resend
 */
async function sendEmailNotification(
  userId: Id<"users">,
  title: string,
  message: string
): Promise<void> {
  // TODO: Fetch user email from Convex
  // TODO: Send email via nodemailer/resend
  console.log(`[Email] Sending to user ${userId}: ${title} - ${message}`);
}

/**
 * SMS notification helper (placeholder)
 * TODO: Integrate with msg91 or twilio
 */
async function sendSMSNotification(
  userId: Id<"users">,
  message: string
): Promise<void> {
  // TODO: Fetch user phone from Convex
  // TODO: Send SMS via msg91/twilio
  console.log(`[SMS] Sending to user ${userId}: ${message}`);
}

