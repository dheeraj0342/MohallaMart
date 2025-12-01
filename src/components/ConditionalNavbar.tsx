"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const shouldHide =
    pathname?.startsWith("/shopkeeper") || pathname?.startsWith("/admin");

  return (
    <>
      {!shouldHide && (
        <>
          <Navbar />
          {/* Mobile category strip just below navbar */}
        </>
      )}
      {!shouldHide && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <SearchBar />
        </div>
      )}
    </>
  );
}
