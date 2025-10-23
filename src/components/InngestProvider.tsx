"use client";

import { useEffect } from "react";
// import { inngest } from "@/lib/inngest";

interface InngestProviderProps {
  children: React.ReactNode;
}

export default function InngestProvider({ children }: InngestProviderProps) {
  useEffect(() => {
    // Initialize Inngest client-side features if needed
    // This is mainly for development and monitoring purposes
    
    if (process.env.NODE_ENV === "development") {
      console.log("Inngest client initialized for development");
    }
  }, []);

  return <>{children}</>;
}
