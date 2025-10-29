import { initTRPC } from "@trpc/server";

// Initialize tRPC
const t = initTRPC.create();

// Export router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Create context type
export interface Context {
  // Add context properties as needed
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Create context function (for future use)
// export const createContext = (): Context => {
//   return {};
// };

// Export tRPC instance
export const trpc = t;
