"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "100+", label: "Local Partners" },
  { value: "4.9★", label: "Average Rating" },
  { value: "24/7", label: "Customer Support" },
];

const missionPoints = [
  "Community-focused approach",
  "Local business support",
  "Quality product guarantee",
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-20 bg-background transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            About MohallaMart
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your trusted neighborhood marketplace connecting communities with
            quality products and services
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-4">
              Our Mission
            </h3>
            <p className="text-muted-foreground mb-6">
              MohallaMart is dedicated to revolutionizing neighborhood commerce
              by connecting local communities with quality products and
              services. We believe in supporting local businesses while
              providing customers with convenient, reliable, and affordable
              shopping experiences.
            </p>
            <div className="space-y-4">
              {missionPoints.map((point, index) => (
                <motion.div
                  key={point}
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="h-5 w-5 text-primary mr-3 shrink-0" />
                  <span className="transition-colors">{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-card border border-border p-8 rounded-xl shadow-lg transition-colors"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 gap-6 text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground transition-colors">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
