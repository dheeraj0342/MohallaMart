"use client";

import React, { Component, PropsWithChildren } from "react";
import ShopkeeperGuard from "../_components/ShopkeeperGuard";
import ProductsContent from "./ProductsContent";

class ErrorBoundary extends Component<PropsWithChildren, { hasError: boolean; error: unknown | null }> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-destructive mb-3">Something went wrong.</p>
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => this.setState({ hasError: false, error: null })}
              aria-label="Retry"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ShopkeeperProductsPage() {
  return (
    <ShopkeeperGuard>
      <ErrorBoundary>
        <div className="p-4 sm:p-6 lg:p-8" role="main">
          <ProductsContent />
        </div>
      </ErrorBoundary>
    </ShopkeeperGuard>
  );
}
