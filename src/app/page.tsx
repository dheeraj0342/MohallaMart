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
      <main className="flex flex-col ">
        <HeroSection />
        <NearbyStoresSection />
        <TopRatedProductsSection />
        <CoreInfoSection />
      </main>
    </div>
  );
}
