"use client"

import { motion } from "framer-motion"
import { AppWindowMac, PackageOpen, ShieldCheck, ShoppingBag, Timer, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const quickApps = [
  {
    name: "Blinkit",
    pitch: "10-minute groceries trusted by millions",
    details: ["Fresh fruits, vegetables, dairy, snacks, household essentials", "Smooth payments + high app ratings"],
    icon: ShoppingBag,
  },
  {
    name: "Zepto",
    pitch: "India's fastest grocery app",
    details: ["10-minute cycles across major metros", "Wide assortment, no minimum order"],
    icon: Zap,
  },
  {
    name: "Swiggy Instamart",
    pitch: "Kirana speed, 120+ cities",
    details: ["Groceries & essentials from nearby stores", "Large catalogue, multiple payment options"],
    icon: Timer,
  },
  {
    name: "bigbasket now",
    pitch: "20,000+ essentials in 10 minutes",
    details: ["Fresh farm products, household & pet care", "Bigbasket trust with easy search"],
    icon: ShieldCheck,
  },
  {
    name: "Dunzo Daily",
    pitch: "Quick commerce in select cities",
    details: ["Groceries & essentials reimagined", "Built on Dunzo's courier network"],
    icon: PackageOpen,
  },
  {
    name: "Flipkart Minutes",
    pitch: "Groceries & gadgets in 10 minutes",
    details: ["Household essentials, mobiles, electronics", "Designed for last-minute convenience"],
    icon: AppWindowMac,
  },
]

export default function QuickCommerceHighlights() {
  return (
    <section className="relative overflow-hidden bg-muted/30 py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mx-auto"
          >
            <Zap className="size-4" />
            10-minute economy
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold sm:text-4xl text-foreground"
          >
            What leading quick-commerce apps highlight
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty"
          >
            Ultra-fast promises, massive assortments, and trust signals dominate every hero banner. MohallaMart brings
            the same confidence to neighbourhood-first commerce.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickApps.map((app, index) => {
            const Icon = app.icon
            return (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Icon className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{app.pitch}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {app.details.map((detail) => (
                      <div key={detail} className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
                        <Timer className="mt-0.5 size-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{detail}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
