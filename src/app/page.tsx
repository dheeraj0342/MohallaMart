"use client";
import {
  HeroSection,
  CoreInfoSection,
  NearbyStoresSection,
  TopRatedProductsSection,
} from "@/components/sections";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <main className="flex flex-col px-1 md:px-0">
        <HeroSection />
        {/* Hide delivery options on small screens; improve accuracy and clarity */}
        <section
          aria-label="Delivery options"
          className="hidden sm:block bg-muted/40 border-y border-border"
        >
          <div className="mx-auto max-w-7xl py-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-card border border-border p-3">
              <div className="text-sm font-semibold text-foreground">
                Scheduled Delivery
              </div>
              <div className="text-sm text-muted-foreground">
                Select a specific time slot for delivery, from early morning to late night, for maximum convenience.
              </div>
            </div>
            <div className="rounded-lg bg-card border border-border p-3">
              <div className="text-sm font-semibold text-foreground">
                Instant Delivery
              </div>
              <div className="text-sm text-muted-foreground">
                Get groceries at your doorstep in as little as 10–20 minutes. Available in select areas.
              </div>
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
