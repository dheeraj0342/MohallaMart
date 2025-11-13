"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on shopkeeper and admin routes
  const shouldHide =
    pathname?.startsWith("/shopkeeper") || pathname?.startsWith("/admin");

  if (shouldHide) {
    return null;
  }

  return <Footer />;
}

