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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <HeroSection />
      <NearbyStoresSection />
      <FeaturesSection />
      <CTASection />
      <AboutSection />
    </div>
  );
}
