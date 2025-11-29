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
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <HeroSection />
      <NearbyStoresSection />
      <FeaturesSection />
      <CTASection />
      <AboutSection />
    </div>
  );
}
