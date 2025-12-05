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
  pageSize = 6,
  eta,
}: RelatedProductsRowProps) {
  const [page, setPage] = useState(0);

  if (!Array.isArray(products) || products.length === 0) return null;

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const visible = products.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label={`Previous ${title}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              aria-label={`Next ${title}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {visible.map((product, index) => {
          const rank = index + 1 + page * pageSize;
          const card = (
            <ProductCard
              key={product._id}
              product={product}
              eta={eta}
              onAddToCart={() => {
                // no-op: onAddToCart is handled by parent via wrapper
              }}
            />
          );

          if (!showRank) {
            return card;
          }

          return (
            <div key={product._id} className="relative">
              <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-sm">
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


