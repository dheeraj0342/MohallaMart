"use client";
import {
  HeroSection,
  CoreInfoSection,
  NearbyStoresSection,
  TopRatedProductsSection,
} from "@/components/sections";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <main className="flex flex-col ">
        <HeroSection />
        {/* Delivery Info */}
        <section aria-label="Delivery options" className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-card border border-border p-3">
              <div className="text-sm font-semibold">Slotted Delivery</div>
              <div className="text-sm text-muted-foreground">Choose convenient time slots from early morning to late night.</div>
            </div>
            <div className="rounded-lg bg-card border border-border p-3">
              <div className="text-sm font-semibold">MMnow Instant Delivery</div>
              <div className="text-sm text-muted-foreground">Lightning-fast delivery in 10–15 minutes in select areas.</div>
            </div>
          </div>
        </section>

        <NearbyStoresSection />
        <TopRatedProductsSection />
        <CoreInfoSection />
      </main>
    </div>
  );
}
