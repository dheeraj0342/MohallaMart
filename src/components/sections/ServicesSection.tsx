"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Package, Users, CheckCircle } from "lucide-react";

const services = [
  {
    icon: ShoppingBag,
    gradient: "bg-gradient-to-br from-primary-50 to-primary-100",
    border: "border-primary-200",
    iconBg: "bg-primary-brand",
    iconColor: "text-white",
    title: "Grocery Delivery",
    description:
      "Fresh groceries, vegetables, fruits, dairy products, and household essentials delivered to your doorstep.",
    features: [
      "Fresh produce daily",
      "Quality guaranteed",
      "Competitive prices",
    ],
    checkColor: "text-primary-brand",
  },
  {
    icon: Package,
    gradient: "bg-gradient-to-br from-secondary-50 to-secondary-100",
    border: "border-secondary-200",
    iconBg: "bg-secondary-500",
    iconColor: "text-white",
    title: "Quick Commerce",
    description:
      "Fast delivery of everyday essentials, snacks, beverages, and personal care items in minutes.",
    features: [
      "Lightning fast delivery",
      "Wide product range",
      "24/7 availability",
    ],
    checkColor: "text-secondary-500",
  },
  {
    icon: Users,
    gradient: "bg-gradient-to-br from-accent-50 to-accent-100",
    border: "border-accent-200",
    iconBg: "bg-accent-brand",
    iconColor: "text-white",
    title: "Local Partnerships",
    description:
      "Supporting local businesses and vendors to bring you authentic neighborhood products and services.",
    features: [
      "Local vendor support",
      "Authentic products",
      "Community focused",
    ],
    checkColor: "text-accent-brand",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Comprehensive marketplace services for all your neighborhood needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.title}
                className={`${service.gradient} p-8 rounded-xl border-2 ${service.border}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div
                  className={`${service.iconBg} w-16 h-16 rounded-full flex items-center justify-center mb-6`}
                >
                  <IconComponent className={`h-8 w-8 ${service.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-neutral-600 mb-4">{service.description}</p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle
                        className={`h-4 w-4 ${service.checkColor} mr-2`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
