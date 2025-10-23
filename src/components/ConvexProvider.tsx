'use client'

import { ReactNode } from "react";

interface ConvexProviderWrapperProps {
  children: ReactNode;
}

export default function ConvexProviderWrapper({ children }: ConvexProviderWrapperProps) {
  // For now, just return children without Convex provider
  // This will be replaced with actual Convex provider once backend is deployed
  return <>{children}</>;
}
