"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@/store/useStore";

export default function CartPage() {
  const cart = useStore((state) => state.cart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const clearCart = useStore((state) => state.clearCart);

  const { totalItems, subtotal, instantSavings, payableAmount } = useMemo(() => {
    const newSubtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const newTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const savingsRate = 0.08;
    const savings = newSubtotal * savingsRate;

    return {
      totalItems: newTotalItems,
      subtotal: newSubtotal,
      instantSavings: savings,
      payableAmount: newSubtotal - savings,
    };
  }, [cart]);

  const handleQuantityChange = (
    id: string,
    currentQuantity: number,
    change: number,
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    } else {
      removeFromCart(id);
    }
  };

  const tableHeaders = ["Product", "Unit Price", "Quantity", "Total", "Actions"];

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/60 via-background to-background py-8 text-foreground transition-colors dark:from-muted/30 dark:via-background dark:to-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Continue shopping
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest">
                Order overview
              </p>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                Shopping cart
              </h1>
              {cart.length > 0 && (
                <p className="mt-1 text-muted-foreground">
                  {totalItems} {totalItems === 1 ? "item" : "items"} in your
                  basket
                </p>
              )}
            </div>
            {cart.length > 1 && (
              <button
                onClick={clearCart}
                className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
                Clear cart
              </button>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card/70 px-8 py-20 text-center shadow-sm"
          >
            <div className="rounded-full bg-primary/10 p-12 text-primary shadow-inner">
              <ShoppingCart className="size-16" />
            </div>
            <h2 className="mt-8 text-3xl font-bold text-foreground">
              Your cart is empty
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Add fresh groceries, kitchen staples, and neighbourhood specials to
              experience instant delivery with MohallaMart.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              <ShoppingCart className="size-4" />
              Browse products
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2 border border-border/80 shadow-lg">
              <CardHeader className="flex flex-col gap-1 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-xl font-semibold">
                  Cart items ({totalItems})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review items before checkout
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                        {tableHeaders.map((header) => (
                          <th key={header} className="px-6 py-4 text-left">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-border/70 bg-card hover:bg-muted/30"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="flex size-14 items-center justify-center rounded-xl bg-muted text-2xl">
                                {item.image ?? "🥬"}
                              </div>
                              <div>
                                <p className="text-base font-semibold text-foreground">
                                  {item.name}
                                </p>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                  SKU #{item.id.padStart(4, "0")}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-semibold text-foreground">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-5">
                            <div className="inline-flex items-center rounded-full border border-border bg-muted/30">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity, -1)
                                }
                                className="rounded-l-full px-3 py-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="size-4" />
                              </button>
                              <span className="min-w-[48px] text-center text-base font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity, 1)
                                }
                                className="rounded-r-full px-3 py-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                                aria-label="Increase quantity"
                              >
                                <Plus className="size-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-lg font-bold text-primary">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-6 py-5">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-destructive transition hover:bg-destructive/10"
                            >
                              <Trash2 className="size-4" />
                              Remove
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="sticky top-24 h-fit border border-border/80 shadow-lg">
              <CardHeader className="border-b border-border/60 bg-linear-to-r from-primary/90 via-primary to-primary/70 text-primary-foreground">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Package className="size-5" />
                  Order summary
                </CardTitle>
                <p className="text-sm opacity-80">
                  Delivery partner assigned after payment
                </p>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-foreground">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    Delivery fee
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      Save ₹40
                    </span>
                  </span>
                  <span className="font-semibold text-primary">Free</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Instant savings</span>
                  <span className="font-semibold text-primary">
                    -₹{instantSavings.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border/70 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        Payable amount
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Incl. taxes & platform fee
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-primary">
                      ₹{payableAmount.toFixed(2)}
                    </p>
                  </div>
                  <Link href="/checkout" className="mt-6 block">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
                    >
                      <ShoppingCart className="size-4" />
                      Proceed to checkout
                    </motion.button>
                  </Link>
                  <Link
                    href="/"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:text-primary"
                  >
                    ← Continue shopping
                  </Link>
                </div>
                <div className="border-t border-border/70 pt-4 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Free delivery on orders above ₹199
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Easy returns within 7 days
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    100% secure payment gateway
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
