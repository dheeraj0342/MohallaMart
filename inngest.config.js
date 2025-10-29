/** @type {import('inngest').InngestConfig} */
module.exports = {
  id: "mohallamart",
  name: "MohallaMart Inngest App",
  eventKey: process.env.INNGEST_EVENT_KEY,
  signingKey: process.env.INNGEST_SIGNING_KEY,
  serve: {
    client: () => import("./src/lib/inngest").then((m) => m.inngest),
    functions: () =>
      import("./src/lib/inngest/functions").then((m) => [
        m.sendWelcomeEmail,
        m.sendOrderConfirmation,
        m.sendOrderUpdate,
        m.indexProduct,
        m.cleanupExpiredSessions,
        m.sendNotification,
        m.trackAnalytics,
        m.processOutOfStockAlert,
        m.syncUserData,
        m.syncProductData,
        m.syncOrderData,
        m.syncInventoryUpdate,
        m.scheduledCleanup,
        m.monitorDataSync,
      ]),
  },
};
