"use client";

import { motion } from "framer-motion";
import { Lightbulb, BadgeCheck, RefreshCcw, MessageCircleMore, Star } from "lucide-react";

const tips = [
  {
    icon: <BadgeCheck className="h-5 w-5 text-green-500 dark:text-green-300" />,
    title: "Competitive Pricing",
    description: "Keep your product prices up-to-date and competitive to attract more customers.",
  },
  {
    icon: <RefreshCcw className="h-5 w-5 text-amber-500 dark:text-amber-300" />,
    title: "Restock Promptly",
    description: "Replenish inventory before items run out to avoid missed sales opportunities.",
  },
  {
    icon: <MessageCircleMore className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    title: "Faster Replies",
    description: "Respond to queries within 24 hours to boost customer satisfaction and ratings.",
  },
  {
    icon: <Star className="h-5 w-5 text-yellow-400 dark:text-yellow-300" />,
    title: "Collect Reviews",
    description: "Encourage customers to leave ratings and share photos for trust and visibility.",
  },
];

export default function TipsCard() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl h-full p-0 overflow-hidden flex flex-col bg-white/90 dark:bg-neutral-900/80 border border-green-100 dark:border-green-900 shadow-xl"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-green-400 px-5 sm:px-6 py-4 flex items-center gap-3">
        <span className="bg-white/20 rounded-xl p-2 flex items-center justify-center">
          <Lightbulb className="h-6 w-6 text-yellow-200 drop-shadow" />
        </span>
        <h4 className="text-xl font-bold text-white tracking-tight flex-1">Growth Tips</h4>
      </div>
      {/* List */}
      <ul className="flex-1 px-5 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
        {tips.map((tip) => (
          <li key={tip.title} className="flex items-start gap-3 sm:gap-4">
            <span className="rounded-lg bg-neutral-100 dark:bg-neutral-800/70 p-2 flex items-center justify-center shadow-sm shrink-0">
              {tip.icon}
            </span>
            <div>
              <h5 className="font-semibold text-green-800 dark:text-green-200 mb-0.5 text-sm sm:text-base">{tip.title}</h5>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{tip.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </motion.aside>
  );
}
