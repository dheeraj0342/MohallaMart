"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import Image from "next/image";
import {
  Package,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  TrendingUp,
  ShoppingBag,
  AlertCircle,
  Loader2,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Shop = {
  _id: Id<"shops">;
  name: string;
};

type Category = {
  _id: Id<"categories">;
  name: string;
};

type Product = {
  _id: Id<"products">;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  min_order_quantity: number;
  max_order_quantity: number;
  unit: string;
  images: string[];
  is_available: boolean;
  is_featured: boolean;
  rating?: number;
  total_sales?: number;
  category_id: Id<"categories">;
  created_at: number;
};

export default function ShopProductsContent() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [deleteProductId, setDeleteProductId] = useState<Id<"products"> | null>(null);

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as { _id: Id<"users"> } | null | undefined;

  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id, is_active: true } : "skip",
  ) as Shop[] | null | undefined;

  const categories = useQuery(
    api.categories.getAllCategories,
    { is_active: true },
  ) as Category[] | null | undefined;

  const activeShop = useMemo(() => {
    if (!shops || shops.length === 0) return null;
    return shops[0];
  }, [shops]);

  const products = useQuery(
    api.products.getProductsByShop,
    activeShop ? { shop_id: activeShop._id } : "skip",
  ) as Product[] | null | undefined;

  const deleteProduct = useMutation(api.products.deleteProduct);
  const toggleProductAvailability = useMutation(api.products.toggleProductAvailability);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === filterCategory,
      );
    }

    // Status filter
    if (filterStatus === "available") {
      filtered = filtered.filter((product) => product.is_available);
    } else if (filterStatus === "unavailable") {
      filtered = filtered.filter((product) => !product.is_available);
    } else if (filterStatus === "out_of_stock") {
      filtered = filtered.filter((product) => product.stock_quantity === 0);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => b.created_at - a.created_at);
        break;
      case "oldest":
        filtered.sort((a, b) => a.created_at - b.created_at);
        break;
      case "price_low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "stock_low":
        filtered.sort((a, b) => a.stock_quantity - b.stock_quantity);
        break;
      case "sales_high":
        filtered.sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0));
        break;
      case "name_asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [products, searchQuery, filterCategory, filterStatus, sortBy]);

  const handleDelete = async () => {
    if (!deleteProductId) return;

    try {
      await deleteProduct({ id: deleteProductId });
      success("Product deleted successfully");
      setDeleteProductId(null);
    } catch (err) {
      console.error(err);
      error("Failed to delete product. Please try again.");
    }
  };

  const handleToggleAvailability = async (productId: Id<"products">, currentStatus: boolean) => {
    try {
      await toggleProductAvailability({ id: productId, is_available: !currentStatus });
      success(
        `Product ${!currentStatus ? "activated" : "deactivated"} successfully`,
      );
    } catch (err) {
      console.error(err);
      error("Failed to update product status. Please try again.");
    }
  };

  // Loading state
  if (user === null || dbUser === undefined || shops === undefined || products === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // No shop state
  if (!activeShop) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Shop Found
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your shop first to view products.
                </p>
                <Button asChild>
                  <a href="/shopkeeper/shop/create">Create Shop</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCategoryName = (categoryId: Id<"categories">) => {
    return categories?.find((cat) => cat._id === categoryId)?.name || "Unknown";
  };

  const totalProducts = products?.length || 0;
  const availableProducts = products?.filter((p) => p.is_available).length || 0;
  const outOfStockProducts = products?.filter((p) => p.stock_quantity === 0).length || 0;
  const totalSales = products?.reduce((sum, p) => sum + (p.total_sales || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Shop Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and view all products in {activeShop.name}
          </p>
        </div>
        <Button asChild>
          <a href="/shopkeeper/products">
            <Package className="h-4 w-4 mr-2" />
            Add New Product
          </a>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {availableProducts}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {outOfStockProducts}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-foreground">{totalSales}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full lg:w-[180px] bg-background">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-[180px] bg-background">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[180px] bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="stock_low">Stock: Low to High</SelectItem>
                <SelectItem value="sales_high">Sales: High to Low</SelectItem>
                <SelectItem value="name_asc">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product._id}
              className="group hover:shadow-lg transition-shadow border-border bg-card overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative h-48 w-full bg-muted overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    unoptimized={product.images[0].includes("convex.cloud")}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {product.original_price && product.original_price > product.price && (
                  <Badge className="absolute top-2 right-2 bg-red-500 text-white dark:bg-red-600 dark:text-white">
                    {Math.round(
                      ((product.original_price - product.price) /
                        product.original_price) *
                      100,
                    )}
                    % OFF
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                    Featured
                  </Badge>
                )}
                {!product.is_available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-sm">
                      Unavailable
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground line-clamp-1 flex-1">
                    {product.name}
                  </h3>
                </div>

                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {getCategoryName(product.category_id)}
                  </Badge>
                  {product.rating && product.rating > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">
                      ₹{product.price.toFixed(2)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.original_price.toFixed(2)}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">/{product.unit}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>
                    Stock: {product.stock_quantity} {product.unit}
                  </span>
                  {product.total_sales !== undefined && (
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3" />
                      {product.total_sales} sold
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      handleToggleAvailability(product._id, product.is_available)
                    }
                  >
                    {product.is_available ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to edit page (you can implement this)
                      window.location.href = `/shopkeeper/products?edit=${product._id}`;
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteProductId(product._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Products Found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || filterCategory !== "all" || filterStatus !== "all"
                ? "Try adjusting your filters or search query."
                : "Start by adding your first product."}
            </p>
            {!searchQuery && filterCategory === "all" && filterStatus === "all" && (
              <Button asChild>
                <a href="/shopkeeper/products">
                  <Package className="h-4 w-4 mr-2" />
                  Add Your First Product
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteProductId !== null}
        onOpenChange={(open) => !open && setDeleteProductId(null)}
      >
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

