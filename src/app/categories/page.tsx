"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";

const getEmojiForCategory = (name: string) => {
  if (!name) return "📦";
  const n = name.toLowerCase().trim();
  
  if (n.includes("vegetable") || n.includes("veggie") || n.includes("produce")) return "🥦";
  if (n.includes("fruit")) return "🍎";
  if (n.includes("dairy") || n.includes("milk") || n.includes("cheese") || n.includes("yogurt")) return "🥛";
  if (n.includes("snack") || n.includes("chip") || n.includes("crisp") || n.includes("namkeen")) return "🍿";
  if (n.includes("drink") || n.includes("beverage") || n.includes("juice") || n.includes("soda") || n.includes("water")) return "🥤";
  if (n.includes("bakery") || n.includes("bread") || n.includes("bun") || n.includes("cake") || n.includes("pastry")) return "🍞";
  if (n.includes("meat") || n.includes("chicken") || n.includes("fish") || n.includes("egg") || n.includes("protein")) return "🍗";
  if (n.includes("personal") || n.includes("care") || n.includes("hygiene") || n.includes("soap") || n.includes("shampoo")) return "🧴";
  if (n.includes("home") || n.includes("household") || n.includes("cleaning") || n.includes("detergent")) return "🏠";
  if (n.includes("baby") || n.includes("infant") || n.includes("diaper")) return "👶";
  if (n.includes("pet") || n.includes("dog") || n.includes("cat")) return "🐾";
  if (n.includes("frozen") || n.includes("ice cream")) return "❄️";
  if (n.includes("electronic") || n.includes("mobile") || n.includes("phone") || n.includes("gadget") || n.includes("laptop")) return "📱";
  if (n.includes("fashion") || n.includes("clothing") || n.includes("apparel") || n.includes("wear") || n.includes("shirt")) return "👕";
  if (n.includes("beauty") || n.includes("cosmetic") || n.includes("makeup")) return "💄";
  if (n.includes("grocery") || n.includes("fresh") || n.includes("organic")) return "🛒";
  if (n.includes("cafe") || n.includes("coffee") || n.includes("tea")) return "☕";
  if (n.includes("toy") || n.includes("game") || n.includes("play")) return "🧸";
  if (n.includes("stationery") || n.includes("book") || n.includes("pen") || n.includes("paper")) return "📚";
  if (n.includes("health") || n.includes("pharmacy") || n.includes("medicine") || n.includes("medical")) return "💊";
  
  return "📦";
};

const getColorForCategory = (index: number) => {
  const colors = [
    "from-green-primary/10 to-green-primary/5 border-green-primary/20",
    "from-purple-primary/10 to-purple-primary/5 border-purple-primary/20",
    "from-orange-primary/10 to-orange-primary/5 border-orange-primary/20",
    "from-blue-primary/10 to-blue-primary/5 border-blue-primary/20",
    "from-red-primary/10 to-red-primary/5 border-red-primary/20",
  ];
  return colors[index % colors.length];
};

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  
  const categories = useQuery(api.categories.getAllCategories, { is_active: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCategories = categories?.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-green-primary/5 via-purple-primary/5 to-green-primary/5 dark:from-green-primary/10 dark:via-purple-primary/10 dark:to-green-primary/10 backdrop-blur-xl border-b border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-4 poppins-bold">
            Shop by Category
          </h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!categories ? (
          // Loading skeleton
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-muted/50 rounded-2xl h-40 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCategories && filteredCategories.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {filteredCategories.map((category, index) => {
              const emoji = getEmojiForCategory(category.name);
              const colorClass = getColorForCategory(index);

              return (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/category?category=${encodeURIComponent(category.name)}`}
                    className="group block"
                  >
                    <div
                      className={`relative bg-gradient-to-br ${colorClass} border rounded-2xl p-4 h-40 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95`}
                    >
                      {/* Emoji Icon */}
                      <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                        {emoji}
                      </div>

                      {/* Category Name */}
                      <h3 className="text-sm font-bold text-foreground text-center leading-tight line-clamp-2 poppins-semibold">
                        {category.name}
                      </h3>

                      {/* Arrow Icon */}
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-primary" />
                      </div>

                      {/* Shine Effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          // No results
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No categories found
            </h3>
            <p className="text-muted-foreground">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>

      {/* Popular Categories Section */}
      {!searchQuery && categories && categories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6 mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4 poppins-bold">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category._id}
                href={`/category?category=${encodeURIComponent(category.name)}`}
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary transition-all hover:shadow-md active:scale-95"
              >
                <span className="text-3xl">{getEmojiForCategory(category.name)}</span>
                <span className="text-sm font-semibold text-foreground inter-semibold">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
