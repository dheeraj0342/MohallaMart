"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 bg-primary-brand dark:bg-neutral-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white dark:text-neutral-100 mb-6 transition-colors">
            Ready to Experience MohallaMart?
          </h2>
          <p className="text-xl text-green-100 dark:text-neutral-300 mb-8 max-w-2xl mx-auto transition-colors">
            Join thousands of satisfied customers who trust us for their
            neighborhood shopping needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-primary-brand px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-neutral-100/90 transition-colors flex items-center justify-center"
            >
              Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white dark:border-neutral-200 text-white dark:text-neutral-200 px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-brand dark:hover:bg-neutral-200 dark:hover:text-neutral-900 transition-colors"
            >
              Download App
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
