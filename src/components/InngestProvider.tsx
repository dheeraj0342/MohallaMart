"use client";

import { useEffect } from "react";

interface InngestProviderProps {
  children: React.ReactNode;
}

export default function InngestProvider({ children }: InngestProviderProps) {
  useEffect(() => {
    // Initialize Inngest client-side features if needed
    // This is mainly for development and monitoring purposes
    
    if (process.env.NODE_ENV === "development") {
      console.log("Inngest client initialized for development");
      
      // Test Inngest connection (server-side only)
      const testConnection = async () => {
        try {
          // Only test on server-side
          if (typeof window === 'undefined') {
            const { inngest } = await import('@/lib/inngest');
            await inngest.send({
              name: "test/connection",
              data: {
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV,
              },
            });
            console.log("Inngest test event sent successfully");
          }
        } catch (error) {
          console.error("Inngest connection test failed:", error);
        }
      };

      testConnection();
    }
  }, []);

  return <>{children}</>;
}
