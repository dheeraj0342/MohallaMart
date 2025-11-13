"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Store, ArrowRight } from "lucide-react";

export default function ShopCard({
  shop,
}: {
  shop: {
    _id: string;
    name?: string;
    address?: { city?: string; state?: string };
    rating?: number;
  } | null;
}) {
  if (!shop) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl border-2 border-amber-200 dark:border-amber-800 p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 text-amber-900 dark:text-amber-100 text-center h-full flex flex-col justify-center items-center shadow-sm"
      >
        <div className="text-5xl sm:text-6xl mb-4">🏪</div>
        <h3 className="text-xl sm:text-2xl font-bold mb-2">No Shop Found</h3>
        <p className="text-sm sm:text-base text-amber-700 dark:text-amber-300 mb-6">
          Complete your shop registration to start selling
        </p>
        <Link
          href="/shopkeeper/registration"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors"
        >
          Complete Registration
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-3xl border p-5 sm:p-6 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-2">
            <Store className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span className="truncate">{shop.name}</span>
            {shop.rating ? (
              <span className="text-sm text-amber-500 flex items-center gap-1 flex-shrink-0">
                ★ {shop.rating.toFixed(1)}
              </span>
            ) : null}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            📍 {shop.address?.city || "Unknown"}, {shop.address?.state || "Unknown"}
          </p>
        </div>
      </div>

      <div>
        <Link
          href="/shopkeeper/profile"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors w-full sm:w-auto justify-center sm:justify-start"
        >
          Manage Profile
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}
