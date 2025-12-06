"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { ProductCard, type Product } from "@/components/products/ProductCard";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/useToast";
import { Loader2 } from "lucide-react";
import type { Id } from "@/../convex/_generated/dataModel";

interface CategoryProductsProps {
  categoryId: Id<"categories">;
  limit?: number;
  showTitle?: boolean;
}

export function CategoryProducts({
  categoryId,
  limit = 8,
  showTitle = true,
}: CategoryProductsProps) {
  const { addToCart } = useStore();
  const { success } = useToast();
  const products = useQuery(api.products.getProductsByCategory, {
    category_id: categoryId,
    is_available: true,
    limit,
  });

  const category = useQuery(api.categories.getCategory, { id: categoryId });

  if (products === undefined || category === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product._id,
      productId: product._id,
      name: `${product.name} (${product.unit})`,
      price: product.price,
      ...(product.images && product.images.length > 0 && {
        image: product.images[0],
      }),
      quantity: product.min_order_quantity,
    });
    success(`${product.name} added to cart!`);
  };

  return (
    <div className="mb-8 sm:mb-12">
      {showTitle && category && (
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 font-montserrat">
            {category.name}
          </h2>
          {category.description && (
            <p className="text-sm text-muted-foreground">{category.description}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={{
              _id: product._id,
              name: product.name,
              price: product.price,
              original_price: product.original_price,
              images: product.images || [],
              unit: product.unit,
              min_order_quantity: product.min_order_quantity,
              rating: product.rating,
              shop_id: product.shop_id,
            }}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

