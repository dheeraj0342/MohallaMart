"use client";

import { motion } from "framer-motion";
import { Clock, Truck, Shield, Smartphone, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Fast Delivery",
    description:
      "Quick and reliable delivery service ensuring customers receive their orders promptly, revolutionizing the shopping experience.",
    iconBg: "bg-primary-100",
    iconColor: "text-primary-brand",
  },
  {
    icon: Truck,
    title: "Local Network",
    description:
      "Strategic network of local stores and warehouses to serve neighborhoods efficiently within your area.",
    iconBg: "bg-secondary-100",
    iconColor: "text-secondary-500",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description:
      "Rigorous quality control processes ensuring fresh products and maintaining high standards throughout our supply chain.",
    iconBg: "bg-primary-100",
    iconColor: "text-primary-brand",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description:
      "Optimized mobile applications with intuitive interfaces, making shopping convenient and accessible on-the-go.",
    iconBg: "bg-accent-100",
    iconColor: "text-accent-brand",
  },
  {
    icon: Users,
    title: "Customer-Centric",
    description:
      "Personalized recommendations, loyalty programs, and 24/7 customer support ensuring exceptional user experience.",
    iconBg: "bg-primary-100",
    iconColor: "text-primary-brand",
  },
  {
    icon: Zap,
    title: "Real-time Tracking",
    description:
      "Live order tracking with precise delivery estimates, keeping customers informed throughout the delivery process.",
    iconBg: "bg-secondary-100",
    iconColor: "text-secondary-500",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 bg-white dark:bg-neutral-950 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 transition-colors">
            Our Key Features
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto transition-colors">
            Discover what makes MohallaMart your trusted neighborhood
            marketplace
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-8 rounded-xl hover:shadow-lg transition-all duration-300 shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div
                  className={`${feature.iconBg} w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800/70 transition-colors`}
                >
                  <IconComponent
                    className={`h-8 w-8 ${feature.iconColor} dark:text-primary-brand transition-colors`}
                  />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
