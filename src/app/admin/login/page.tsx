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
        className="max-w-sm mx-auto mt-24 p-8 rounded-xl shadow-lg bg-white border border-primary-brand/10"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 w-6 h-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
        </div>
        <p className="mb-6 text-center font-medium text-gray-700">You are already logged in as admin.</p>
        <button
          className="w-full px-4 py-3 bg-secondary-brand hover:bg-secondary-brand/90 text-white rounded-lg font-medium shadow-sm transition-all"
          type="submit"
        >
          Logout
        </button>
      </form>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-24 p-8 rounded-xl shadow-lg bg-white border border-primary-brand/10">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary-brand/10 p-3 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-brand w-6 h-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-6 text-primary-brand text-center">
        Admin Login
      </h1>
      <form action={login} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-transparent focus:ring-2 focus:ring-primary-brand focus:border-primary-brand transition-all"
            required
            suppressHydrationWarning
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-transparent focus:ring-2 focus:ring-primary-brand focus:border-primary-brand transition-all"
            required
            suppressHydrationWarning
          />
        </div>
        <button
          className="w-full px-4 py-3 bg-primary-brand hover:bg-primary-brand/90 text-white rounded-lg font-medium shadow-sm transition-all"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}
