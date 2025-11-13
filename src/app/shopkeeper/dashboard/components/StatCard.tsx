"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  meta?: string;
  accent?: "green" | "blue" | "purple" | "amber";
}

const CARD_ACCENTS: Record<
  NonNullable<StatCardProps["accent"]>,
  {
    bg: string;
    ring: string;
    label: string;
    value: string;
    meta: string;
    iconBg: string;
  }
> = {
  green: {
    bg: "bg-gradient-to-br from-green-50 to-white dark:from-green-950/70 dark:to-neutral-900",
    ring: "ring-green-100 dark:ring-green-800/50",
    label: "text-green-800 dark:text-green-200",
    value: "text-green-900 dark:text-green-100",
    meta: "text-green-700/70 dark:text-green-300/80",
    iconBg: "bg-green-100 dark:bg-green-900/60",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/60 dark:to-neutral-900",
    ring: "ring-blue-100 dark:ring-blue-800/40",
    label: "text-blue-700 dark:text-blue-200",
    value: "text-blue-900 dark:text-blue-100",
    meta: "text-blue-700/70 dark:text-blue-300/80",
    iconBg: "bg-blue-100 dark:bg-blue-900/60",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/60 dark:to-neutral-900",
    ring: "ring-purple-100 dark:ring-purple-800/40",
    label: "text-purple-700 dark:text-purple-200",
    value: "text-purple-900 dark:text-purple-100",
    meta: "text-purple-700/70 dark:text-purple-300/80",
    iconBg: "bg-purple-100 dark:bg-purple-900/60",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/70 dark:to-neutral-900",
    ring: "ring-amber-100 dark:ring-amber-800/40",
    label: "text-amber-700 dark:text-amber-200",
    value: "text-amber-900 dark:text-amber-100",
    meta: "text-amber-700/70 dark:text-amber-300/80",
    iconBg: "bg-amber-100 dark:bg-amber-900/60",
  },
};

export default function StatCard({
  icon,
  label,
  value,
  meta,
  accent = "green",
}: StatCardProps) {
  const accentStyle = CARD_ACCENTS[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border px-5 py-6 shadow-sm dark:shadow-none ${accentStyle.bg} ${accentStyle.ring} ring-1 ring-inset dark:border-neutral-800`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${accentStyle.iconBg}`}>
            {icon}
          </div>
          <div>
            <p className={`text-xs ${accentStyle.label}`}>{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${accentStyle.value}`}>
              {value}
            </p>
          </div>
        </div>
        {meta && (
          <div className={`text-xs ${accentStyle.meta}`}>{meta}</div>
        )}
      </div>
    </motion.div>
  );
}
