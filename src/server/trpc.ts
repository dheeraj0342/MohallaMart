import { router, publicProcedure } from "@/lib/trpc";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const appRouter = router({
  // Health check
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

  // User procedures - Real implementation using Supabase
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from("users") // Assuming Supabase has a users table or accessing auth.users via admin API
        .select("*")
        .eq("id", input.id)
        .single();

      if (error) {
        // Fallback to fetching from auth.users if public users table doesn't exist or is empty
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(input.id);
        if (userError) throw new Error(userError.message);
        return {
          id: userData.user.id,
          email: userData.user.email,
          name: userData.user.user_metadata?.full_name || userData.user.user_metadata?.name,
          role: userData.user.user_metadata?.role,
        };
      }

      return data;
    }),
});

export type AppRouter = typeof appRouter;
