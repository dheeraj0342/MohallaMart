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
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex flex-col w-full">
        <HeroSection />
        
        <section
          aria-label="Delivery benefits and features"
          className="bg-gradient-to-r from-primary/5 via-background to-primary/5 border-y border-border/30"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="sm:hidden flex gap-2 py-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
              <div className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 snap-start hover:bg-primary/15 transition-colors">
                <Zap className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">10-20 min delivery</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 snap-start hover:bg-orange-500/15 transition-colors">
                <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">Schedule anytime</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 snap-start hover:bg-blue-500/15 transition-colors">
                <Truck className="h-4 w-4 text-blue-500 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">Free delivery 499+</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 snap-start hover:bg-emerald-500/15 transition-colors">
                <Shield className="h-4 w-4 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">Quality guaranteed</span>
              </div>
            </div>
            
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 py-8">
              <div className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-lg hover:bg-card/95 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20">
                <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all flex-shrink-0">
                  <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground leading-tight">Instant Delivery</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Get it in 10-20 minutes</p>
                </div>
              </div>
              
              <div className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-orange-500/40 hover:shadow-lg hover:bg-card/95 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/20">
                <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 group-hover:scale-110 transition-all flex-shrink-0">
                  <Clock className="h-5 w-5 text-orange-500" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground leading-tight">Scheduled Slots</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Choose your time slot</p>
                </div>
              </div>
              
              <div className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-blue-500/40 hover:shadow-lg hover:bg-card/95 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20">
                <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all flex-shrink-0">
                  <Truck className="h-5 w-5 text-blue-500" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground leading-tight">Free Delivery</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">On orders above ₹499</p>
                </div>
              </div>
              
              <div className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-emerald-500/40 hover:shadow-lg hover:bg-card/95 transition-all duration-300 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all flex-shrink-0">
                  <Shield className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground leading-tight">Quality Promise</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">100% fresh guaranteed</p>
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
