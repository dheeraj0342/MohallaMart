"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, TrendingUp, Package, Store, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/utils";
import Image from "next/image";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSearchQuery, isSearchOpen, setSearchOpen } = useStore();
  const router = useRouter();

  // Debounce search query
  const debouncedQuery = useMemo(() => {
    if (!query.trim()) return "";
    return query.trim();
  }, [query]);

  // Search products
  const products = useQuery(
    api.products.searchProducts,
    debouncedQuery
      ? {
        query: debouncedQuery,
        is_available: true,
        limit: 8,
      }
      : "skip",
  );

  // Search shops
  const shops = useQuery(
    api.shops.searchShops,
    debouncedQuery
      ? {
        query: debouncedQuery,
        is_active: true,
        limit: 5,
      }
      : "skip",
  );

  // Get categories for popular categories section
  const categories = useQuery(api.categories.getAllCategories, {
    is_active: true,
  });

  const trendingSearches = [
    "Organic fruits",
    "Fresh vegetables",
    "Daily essentials",
    "Breakfast items",
    "Snacks",
    "Beverages",
  ];

  // Get popular categories from database
  const popularCategories = useMemo(() => {
    if (!categories) return [];
    return categories.slice(0, 4).map((cat) => ({
      name: cat.name,
      id: cat._id,
    }));
  }, [categories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      try {
        const active = document.activeElement as HTMLElement | null;
        const tag = active?.tagName;
        const isEditable = active?.isContentEditable;
        const isM = event.key.toLowerCase() === "m";
        const allowWithoutModifiers =
          isM &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey &&
          tag !== "INPUT" &&
          tag !== "TEXTAREA" &&
          tag !== "SELECT" &&
          !isEditable;
        const allowWithCtrlOrMeta = isM && (event.ctrlKey || event.metaKey);

        if (allowWithoutModifiers || allowWithCtrlOrMeta) {
          event.preventDefault();
          setSearchOpen(true);
          setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
          }, 100);
        }

        if (event.key === "Escape") {
          event.preventDefault();
          setSearchOpen(false);
          setQuery("");
          if (inputRef.current) inputRef.current.blur();
        }
      } catch {
        // ignore errors
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
  }, [setSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    setSearchQuery(searchTerm);
    if (!isSearchOpen) setSearchOpen(true);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchQuery("");
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const handleProductClick = (productId: string, shopId: string) => {
    router.push(`/product/${productId}`);
    closeSearch();
  };

  const handleShopClick = (shopName: string) => {
    router.push(`/shop/${generateSlug(shopName)}`);
    closeSearch();
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/shops?category=${categoryName}`);
    closeSearch();
  };

  const hasResults =
    (products && products.length > 0) || (shops && shops.length > 0);
  const isLoading = debouncedQuery && products === undefined && shops === undefined;

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          ref={searchRef}
          className="fixed inset-0 z-9999 flex items-start justify-center px-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeSearch();
            }
          }}
        >
          <motion.div
            className="relative w-full max-w-3xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card border-2 border-border shadow-xl overflow-hidden rounded-xl focus-within:ring-2 focus-within:ring-primary">
              {/* Search Input */}
              <div className="relative p-4 border-b border-border">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search for products, shops, categories..."
                    className="pl-10 pr-20 h-12 text-base bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  />
                  <div className="absolute right-3 flex items-center gap-2">
                    {query && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeSearch}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                      aria-label="Close search"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                {/* Keyboard shortcut info */}
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>🔍 Search for products, shops, and categories</span>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded border border-border bg-card text-xs font-mono">
                      Esc
                    </kbd>
                    <span>to close</span>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Searching...
                    </span>
                  </div>
                ) : query.trim() && hasResults ? (
                  <div className="p-4 space-y-4">
                    {/* Products Section */}
                    {products && products.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-semibold text-foreground uppercase">
                            Products ({products.length})
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {products.map((product) => (
                            <button
                              key={product._id}
                              className="w-full p-3 rounded-lg border border-border bg-card hover:bg-muted text-left transition-colors group focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                              onClick={() =>
                                handleProductClick(
                                  product._id,
                                  product.shop_id as string,
                                )
                              }
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                                  {product.images && product.images.length > 0 ? (
                                    <Image
                                      src={product.images[0]}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {product.name}
                                  </div>
                                  {product.description && (
                                    <div className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                      {product.description}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="font-semibold text-primary">
                                      ₹{product.price.toFixed(2)}
                                    </span>
                                    {product.original_price &&
                                      product.original_price > product.price && (
                                        <span className="text-xs text-muted-foreground line-through">
                                          ₹{product.original_price.toFixed(2)}
                                        </span>
                                      )}
                                    <span className="text-xs text-muted-foreground">
                                      /{product.unit}
                                    </span>
                                  </div>
                                </div>
                                {product.stock_quantity > 0 ? (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-success/10 text-success border-success/20"
                                  >
                                    In Stock
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-destructive/10 text-destructive border-destructive/20"
                                  >
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shops Section */}
                    {shops && shops.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Store className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-semibold text-foreground uppercase">
                            Shops ({shops.length})
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {shops.map((shop) => (
                            <button
                              key={shop._id}
                              className="w-full p-3 rounded-lg border border-border bg-card hover:bg-muted text-left transition-colors group focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                              onClick={() => handleShopClick(shop.name)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                                  {shop.logo_url ? (
                                    <Image
                                      src={shop.logo_url}
                                      alt={shop.name}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                      unoptimized={shop.logo_url.includes("convex.cloud")}
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <Store className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {shop.name}
                                  </div>
                                  {shop.description && (
                                    <div className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                      {shop.description}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    {shop.rating && shop.rating > 0 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-secondary/10 text-secondary-foreground border-secondary/20"
                                      >
                                        ⭐ {shop.rating.toFixed(1)}
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {shop.address.city}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : query.trim() && !hasResults ? (
                  <div className="px-4 py-12 text-center">
                    <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-lg font-medium text-foreground mb-1">
                      No results found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Try searching with different keywords
                    </p>
                    <div className="mt-4 text-xs text-muted-foreground">
                      💡 Tip: Try searching for categories like &quot;fruits&quot;,
                      &quot;dairy&quot;, or &quot;electronics&quot;
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {/* Popular Categories */}
                    {popularCategories.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-semibold text-foreground uppercase">
                            Popular Categories
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {popularCategories.map((category) => (
                            <button
                              key={category.id}
                              className="p-3 rounded-lg border border-border bg-card hover:bg-muted text-left transition-colors group focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                              onClick={() => handleCategoryClick(category.name)}
                            >
                              <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {category.name}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending Searches */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground uppercase">
                          Trending Searches
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {trendingSearches.map((trend, index) => (
                          <button
                            key={index}
                            className="w-full p-2 rounded-lg hover:bg-muted text-left transition-colors group focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                            onClick={() => {
                              setQuery(trend);
                              setSearchQuery(trend);
                            }}
                          >
                            <div className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
                              <TrendingUp className="h-3 w-3 mr-2 text-primary" />
                              <span className="text-sm font-medium">{trend}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
