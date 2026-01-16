"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Product, ProductCard, type EtaInfo } from "@/components/products/ProductCard";

interface RelatedProductsRowProps {
  title: string;
  products: Product[];
  showRank?: boolean;
  pageSize?: number;
  eta?: EtaInfo;
}

export function RelatedProductsRow({
  title,
  products,
  showRank = false,
  pageSize = 10,
  eta,
}: RelatedProductsRowProps) {
  const [page, setPage] = useState(0);

  if (!Array.isArray(products) || products.length === 0) return null;

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const visible = products.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-border/50 hover:bg-muted/50"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label={`Previous ${title}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-3 font-medium">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-border/50 hover:bg-muted/50"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              aria-label={`Next ${title}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {visible.map((product, index) => {
          const rank = index + 1 + page * pageSize;
          const card = (
            <ProductCard
              key={product._id}
              product={product}
              eta={eta}
              onAddToCart={() => {
                // handled by parent
              }}
            />
          );

          if (!showRank) {
            return card;
          }

          return (
            <div key={product._id} className="relative">
              <span className="absolute left-2 top-2 z-20 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground shadow-md">
                #{rank}
              </span>
              {card}
            </div>
          );
        })}
      </div>
    </section>
  );
}


