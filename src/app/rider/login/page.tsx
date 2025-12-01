"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";
import { Loader2, Bike } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

export default function RiderLoginPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const syncUser = useMutation(api.users.syncUserWithSupabase);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        error(authError.message);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Sync user to Convex with rider role (only if not already set)
        await syncUser({
          supabaseUserId: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split("@")[0],
          email: data.user.email!,
          phone: data.user.user_metadata?.phone,
          avatar_url: data.user.user_metadata?.avatar_url,
          role: "rider", // Set rider role - syncUserWithSupabase will only set if user doesn't have a role
        });

        success("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/rider/app");
        }, 500);
      }
    } catch (err: any) {
      error(err.message || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Bike className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Rider Login</CardTitle>
          <CardDescription>Sign in to start delivering orders</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a href="/register?role=rider" className="text-primary hover:underline">
                Register as Rider
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

