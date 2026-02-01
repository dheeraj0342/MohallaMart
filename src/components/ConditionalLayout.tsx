"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import Footer from "./Footer";

export default function ConditionalLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  
  // Define routes where global nav/footer should be hidden
  const isShopkeeper = pathname?.startsWith("/shopkeeper");
  const isAdmin = pathname?.startsWith("/admin");
  const isAuth = pathname?.startsWith("/auth");
  const isRider = pathname?.startsWith("/rider");
  
  const shouldHideUI = isShopkeeper || isAdmin || isAuth || isRider;

  return (
    <>
      {!shouldHideUI && (
        <>
          <Navbar />
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none">
            <div className="pointer-events-auto">
              <SearchBar />
            </div>
          </div>
        </>
      )}

      {/* 
         - When UI is visible (customer app): Use padding to clear fixed navbar
         - When UI is hidden (auth/admin/etc): No padding needed
      */}
      <main className={shouldHideUI ? "" : "pt-[184px] lg:pt-0"}>
        {children}
      </main>

      {!shouldHideUI && <Footer />}
    </>
  );
}
