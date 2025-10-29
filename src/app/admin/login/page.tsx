import { redirect } from "next/navigation";
import {
  isAdminAuthenticated,
  setAdminSession,
  clearAdminSession,
} from "@/lib/utils";

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
      <form
        action={logout}
        className="max-w-sm mx-auto mt-24 p-6 rounded-lg border"
      >
        <p className="mb-4">You are already logged in as admin.</p>
        <button
          className="px-4 py-2 bg-[var(--color-secondary)] text-white rounded"
          type="submit"
        >
          Logout
        </button>
      </form>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-24 p-6 rounded-lg border bg-white">
      <h1 className="text-xl font-semibold mb-4 text-[var(--color-primary)]">
        Admin Login
      </h1>
      <form action={login} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full border rounded px-3 py-2 bg-transparent"
            required
            suppressHydrationWarning
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full border rounded px-3 py-2 bg-transparent"
            required
            suppressHydrationWarning
          />
        </div>
        <button
          className="w-full px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}
