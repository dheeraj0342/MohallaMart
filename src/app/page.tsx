"use client";
import {
  HeroSection,
  CoreInfoSection,
  NearbyStoresSection,
  TopRatedProductsSection,
} from "@/components/sections";
import { Clock, Zap, Truck, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <main className="flex flex-col">
        <HeroSection />
        
        {/* Delivery Features Strip - Modern, clean design */}
        <section
          aria-label="Delivery options"
          className="bg-gradient-to-r from-primary/5 via-background to-primary/5 border-y border-border/50"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Mobile: Horizontal scroll strip */}
            <div className="sm:hidden flex gap-4 py-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">10-20 min delivery</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">Schedule anytime</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Truck className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">Free delivery 499+</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">Quality guaranteed</span>
              </div>
            </div>
            
            {/* Desktop: Grid layout */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 py-5">
              <div className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Instant Delivery</div>
                  <div className="text-xs text-muted-foreground">Get it in 10-20 minutes</div>
                </div>
              </div>
              
              <div className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-orange-500/40 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Scheduled Slots</div>
                  <div className="text-xs text-muted-foreground">Choose your time slot</div>
                </div>
              </div>
              
              <div className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-blue-500/40 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <Truck className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Free Delivery</div>
                  <div className="text-xs text-muted-foreground">On orders above ₹499</div>
                </div>
              </div>
              
              <div className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-emerald-500/40 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <Shield className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Quality Promise</div>
                  <div className="text-xs text-muted-foreground">100% fresh guaranteed</div>
                </div>
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
