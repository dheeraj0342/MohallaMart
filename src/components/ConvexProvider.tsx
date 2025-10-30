"use client";

import React, { ReactNode } from "react";
import { ConvexProvider as ConvexProviderBase } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { useStore } from "@/store/useStore";

interface ConvexProviderWrapperProps {
  children: ReactNode;
}

// Create Convex client with proper error handling for build time
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud";

// Always create a Convex client instance, even if URL is a placeholder
let convex: ConvexReactClient;

try {
  convex = new ConvexReactClient(convexUrl);
} catch (error) {
  console.warn("Failed to initialize Convex client:", error);
  // Fallback to placeholder
  convex = new ConvexReactClient("https://placeholder.convex.cloud");
}

export default function ConvexProviderWrapper({
  children,
}: ConvexProviderWrapperProps) {
  const { setConvexConnected } = useStore();

  // Always provide ConvexProvider to avoid build errors
  return (
    <ConvexProviderBase client={convex}>
      <ConvexConnectionHandler onConnectionChange={setConvexConnected} />
      {children}
    </ConvexProviderBase>
  );
}

// Component to handle Convex connection status
function ConvexConnectionHandler({
  onConnectionChange,
}: {
  onConnectionChange: (connected: boolean) => void;
}) {
  // This will be implemented with actual Convex connection monitoring
  // For now, we'll assume connection is successful
  React.useEffect(() => {
    onConnectionChange(true);
  }, [onConnectionChange]);

  return null;
}
