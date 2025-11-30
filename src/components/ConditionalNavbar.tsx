"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide navbar and searchbar on shopkeeper and admin routes
  const shouldHide =
    pathname?.startsWith("/shopkeeper") || pathname?.startsWith("/admin");

  return (
    <>
      {!shouldHide && <Navbar />}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <SearchBar />
      </div>
    </>
  );
}

