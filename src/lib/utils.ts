import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Admin auth utilities
import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = "admin_session";

export const setAdminSession = async (identifier: string) => {
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-secret";
  const token = crypto
    .createHmac("sha256", secret)
    .update(identifier)
    .digest("hex");
  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
};

export const clearAdminSession = async () => {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE_NAME);
};

export const isAdminAuthenticated = async () => {
  const jar = await cookies();
  const cookie = jar.get(ADMIN_COOKIE_NAME)?.value;
  if (!cookie) return false;
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-secret";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(process.env.ADMIN_EMAIL || "")
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(cookie), Buffer.from(expected));
};
