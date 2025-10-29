import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.warn("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
}

// Create Convex client with proper error handling for build time
let convex: ConvexReactClient | null = null;

if (convexUrl) {
  try {
    convex = new ConvexReactClient(convexUrl);
  } catch (error) {
    console.warn("Failed to initialize Convex client:", error);
  }
}

export { convex };
