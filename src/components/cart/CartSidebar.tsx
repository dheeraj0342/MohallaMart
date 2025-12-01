"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingCart, X, Package, Trash2, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { success } = useToast();
  const cart = useStore((state) => state.cart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateQuantity = useStore((state) => state.updateQuantity);

  const { subtotal, totalItems } = useMemo(() => {
    const sub = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal: sub, totalItems: count };
  }, [cart]);

  const FREE_THRESHOLD = 199;
  const DELIVERY_FEE = 40;
  const deliveryFee = subtotal >= FREE_THRESHOLD ? 0 : DELIVERY_FEE;
  const payableAmount = subtotal + deliveryFee;

  const handleQuantityChange = (id: string, current: number, delta: number) => {
    const next = current + delta;
    if (next > 0) {
      updateQuantity(id, next);
    } else {
      removeFromCart(id);
      success("Item removed from cart");
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    success("Item removed from cart");
  };

  const handleCheckout = () => {
    onClose();
    if (!user) {
      router.push("/auth?next=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            className="fixed inset-y-0 right-0 z-[80] w-full max-w-sm sm:max-w-md bg-card border-l border-border shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            aria-label="Cart sidebar"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <p className="text-2xl font-semibold text-muted-foreground uppercase tracking-wide">
                  My Cart
                </p>
                <p className="text-sm text-muted-foreground">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onClose}
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center gap-3 text-muted-foreground">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Your cart is empty
                  </p>
                  <p className="text-xs">
                    Add some items to see them here and place your order.
                  </p>
                </div>
              ) : (
                <>
                  {/* Items */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-2"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-2xl overflow-hidden">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {item.name}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                ₹{item.price.toFixed(2)} each
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="inline-flex items-center rounded-full border border-border bg-muted/40">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity, -1)
                                }
                                className="rounded-l-full px-2 py-1 text-muted-foreground hover:bg-primary/10 hover:text-primary transition"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="min-w-[32px] text-center text-sm font-semibold text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity, 1)
                                }
                                className="rounded-r-full px-2 py-1 text-muted-foreground hover:bg-primary/10 hover:text-primary transition"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-sm font-semibold text-primary">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bill details */}
                  <div className="mt-4 space-y-2 rounded-xl border border-border bg-background p-3 text-xs">
                    <p className="text-xs font-semibold text-foreground">
                      Bill details
                    </p>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Items total</span>
                      <span className="font-semibold text-foreground">
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Delivery charge</span>
                      <span className="font-semibold text-foreground">
                        {deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="border-t border-border pt-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        Grand total
                      </span>
                      <span className="text-sm font-bold text-primary">
                        ₹{payableAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer CTA */}
            {cart.length > 0 && (
              <div className="bg-card border-t border-border px-4 py-4 space-y-2">
                {subtotal < FREE_THRESHOLD && (
                  <p className="text-xs text-center text-muted-foreground">
                    Add ₹{(FREE_THRESHOLD - subtotal).toFixed(2)} more for free delivery
                  </p>
                )}
                <Button
                  onClick={handleCheckout}
                  className="w-full justify-between rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 min-h-[56px]"
                >
                  <span className="text-base font-semibold">
                    ₹{payableAmount.toFixed(2)}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    {user ? "Proceed to Checkout" : "Login to proceed"}
                    {user ? <ArrowRight className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                  </span>
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}


