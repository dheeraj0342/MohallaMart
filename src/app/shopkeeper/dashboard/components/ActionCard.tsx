"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ActionCard({
  title,
  description,
  href,
  icon,
  color = "green",
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color?: "green" | "blue" | "purple";
}) {
  const colorBg = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
  }[color];

  return (
    <Link href={href} className="block">
      <motion.div
        whileHover={{ y: -4 }}
        className={`rounded-2xl border p-5 shadow-sm dark:border-neutral-800 bg-white dark:bg-neutral-900 ${colorBg}`}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-white/70 dark:bg-neutral-800/60">{icon}</div>
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{title}</h4>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{description}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
