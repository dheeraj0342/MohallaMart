import { redirect } from "next/navigation";
import {
  isAdminAuthenticated,
  setAdminSession,
  clearAdminSession,
} from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default async function AdminLoginPage() {
  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    if (
      email === (process.env.ADMIN_EMAIL || "") &&
      password === (process.env.ADMIN_PASSWORD || "")
    ) {
      await setAdminSession(email);
      redirect("/admin");
    }
  }

  async function logout() {
    "use server";
    await clearAdminSession();
    redirect("/admin/login");
  }

  if (await isAdminAuthenticated()) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
            <CardTitle className="text-xl">You&apos;re already signed in</CardTitle>
            <CardDescription>
              Continue to the admin console or end your session below.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-col gap-2">
            <form action={logout} className="w-full">
              <Button type="submit" variant="secondary" className="w-full">
            Logout
              </Button>
        </form>
            <Button variant="outline" className="w-full" asChild>
              <a href="/admin">Go to Admin Dashboard</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary-brand/10 dark:bg-primary-brand/20 mb-4">
            <ShieldCheck className="h-8 w-8 text-primary-brand" />
          </div>
          <CardTitle className="text-2xl">Admin Console</CardTitle>
          <CardDescription>
              Sign in to review registrations and manage shopkeepers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="admin-login-form" action={login}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
              id="email"
              name="email"
              type="email"
                  placeholder="admin@example.com"
              required
            />
          </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
              id="password"
              name="password"
              type="password"
                  placeholder="Enter your password"
              required
            />
          </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" form="admin-login-form" className="w-full">
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
