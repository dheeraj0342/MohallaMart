'use client'

import React, { ReactNode } from "react";
import { ConvexProvider as ConvexProviderBase } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { useStore } from "@/store/useStore";

interface ConvexProviderWrapperProps {
  children: ReactNode;
}

// Create Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexReactClient(convexUrl);

export default function ConvexProviderWrapper({ children }: ConvexProviderWrapperProps) {
  const { setConvexConnected } = useStore();

  return (
    <ConvexProviderBase client={convex}>
      <ConvexConnectionHandler onConnectionChange={setConvexConnected} />
      {children}
    </ConvexProviderBase>
  );
}

// Component to handle Convex connection status
function ConvexConnectionHandler({ onConnectionChange }: { onConnectionChange: (connected: boolean) => void }) {
  // This will be implemented with actual Convex connection monitoring
  // For now, we'll assume connection is successful
  React.useEffect(() => {
    onConnectionChange(true);
  }, [onConnectionChange]);

  return null;
}
