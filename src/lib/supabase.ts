import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

// Helper function to validate Supabase configuration
export const validateSupabaseConfig = (): 
  | { valid: true }
  | { valid: false; error: string } => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      valid: false,
      error: "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    };
  }

  if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
    return {
      valid: false,
      error: "Invalid Supabase URL format. URL must start with http:// or https://",
    };
  }

  return { valid: true };
};

// Get the site URL based on environment
export const getSiteUrl = () => {
  // Priority 1: Custom domain (for production with custom domain)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Priority 2: Vercel URL (automatically set by Vercel)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Priority 3: Check if we're in browser and can get origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Fallback to localhost for development
  return "http://localhost:3000";
};

// Get email redirect URL
export const getEmailRedirectUrl = () => {
  const siteUrl = getSiteUrl();
  return `${siteUrl}/auth/callback`;
};

// Database types (these would be generated from your Supabase schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone?: string;
          name?: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string;
          name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string;
          name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
