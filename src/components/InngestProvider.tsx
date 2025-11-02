"use client";

interface InngestProviderProps {
  children: React.ReactNode;
}

export default function InngestProvider({ children }: InngestProviderProps) {
  // Inngest runs server-side via API routes at /api/inngest
  // No client-side initialization needed
  return <>{children}</>;
}
