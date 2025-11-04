import { redirect } from "next/navigation";
import {
  isAdminAuthenticated,
  setAdminSession,
  clearAdminSession,
} from "@/lib/adminAuth";

const cardStyles =
  "w-full max-w-md rounded-3xl border border-[#e5efe8] bg-white/90 px-8 py-10 shadow-xl backdrop-blur-sm";
const inputStyles =
  "w-full border-2 border-[#dce8e1] rounded-xl px-4 py-3 bg-[#f7faf9] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-brand focus:border-primary-brand focus:bg-white transition-all duration-200";

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
      <div className="flex min-h-[70vh] items-center justify-center">
        <form action={logout} className={`${cardStyles} space-y-6 text-center`}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-neutral-900">
              You&apos;re already signed in
            </h2>
            <p className="text-sm text-neutral-600">
              Continue to the admin console or end your session below.
            </p>
          </div>
          <button
            className="w-full rounded-xl bg-secondary-brand px-4 py-3 text-white shadow-lg shadow-secondary-brand/30 transition-all hover:bg-secondary-brand/90"
            type="submit"
          >
            Logout
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className={`${cardStyles} space-y-8`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-brand/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-brand"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#1f2a33]">Admin Console</h1>
            <p className="text-sm text-neutral-600">
              Sign in to review registrations and manage shopkeepers.
            </p>
          </div>
        </div>
        <form action={login} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={inputStyles}
              required
              suppressHydrationWarning
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={inputStyles}
              required
              suppressHydrationWarning
            />
          </div>
          <button
            className="w-full rounded-xl bg-primary-brand px-4 py-3 text-white shadow-lg shadow-primary-brand/30 transition-all hover:bg-primary-hover"
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
