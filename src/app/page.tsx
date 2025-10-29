"use client";

import {
  HeroSection,
  FeaturesSection,
  CustomerApproachSection,
  ServicesSection,
  CTASection,
  AboutSection,
} from "@/components/sections";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <HeroSection />
      <FeaturesSection />
      <CustomerApproachSection />
      <ServicesSection />
      <CTASection />
      <AboutSection />
    </div>
  );
}
