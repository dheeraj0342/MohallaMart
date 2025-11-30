"use client";

import {
  HeroSection,
  FeaturesSection,
  CTASection,
  AboutSection,
  NearbyStoresSection,
} from "@/components/sections";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <main className="flex flex-col gap-0">
        <HeroSection />
        <NearbyStoresSection />
        <FeaturesSection />
        <CTASection />
        <AboutSection />
      </main>
    </div>
  );
}
