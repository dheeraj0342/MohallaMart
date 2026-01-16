"use client";

import { Leaf, Clock, Zap, ShoppingBag, Truck, Heart } from "lucide-react";

export default function CoreInfoSection() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            MohallaMart — Your Neighborhood Online Grocery Store
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Connecting you to local shops for fresh groceries delivered right to your doorstep
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 mb-4 transition-colors">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Farm Fresh Produce</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Handpicked fruits, vegetables, and groceries sourced from trusted local vendors and farms for maximum freshness.
            </p>
          </div>
          
          <div className="group p-6 rounded-2xl bg-card border border-border hover:border-orange-500/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 mb-4 transition-colors">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Flexible Delivery Slots</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Choose your preferred delivery time from early morning to late night. We work around your schedule.
            </p>
          </div>
          
          <div className="group p-6 rounded-2xl bg-card border border-border hover:border-blue-500/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 mb-4 transition-colors">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Express Delivery</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Need it fast? Get essentials delivered in 10-20 minutes with MohallaMart Express in select areas.
            </p>
          </div>
          
          <div className="group p-6 rounded-2xl bg-card border border-border hover:border-purple-500/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 mb-4 transition-colors">
              <ShoppingBag className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Wide Selection</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From daily essentials to specialty items — pulses, grains, dairy, snacks, and trusted household brands.
            </p>
          </div>
          
          <div className="group p-6 rounded-2xl bg-card border border-border hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 mb-4 transition-colors">
              <Truck className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Local Shop Network</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We partner with neighborhood shopkeepers to bring you quality products while supporting local businesses.
            </p>
          </div>
          
          <div className="group p-6 rounded-2xl bg-card border border-border hover:border-pink-500/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-pink-500/10 group-hover:bg-pink-500/20 mb-4 transition-colors">
              <Heart className="h-6 w-6 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Quality Guaranteed</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              100% satisfaction promise. Not happy with your order? We'll make it right with easy returns and refunds.
            </p>
          </div>
        </div>
        
        {/* Bottom CTA Text */}
        <div className="text-center p-6 sm:p-8 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Whether it's a last-minute dinner ingredient or your weekly grocery run, MohallaMart connects you 
            with your neighborhood stores for a seamless shopping experience. <span className="text-foreground font-medium">Shop local, shop smart.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

