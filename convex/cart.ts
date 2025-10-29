import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add item to cart
export const addToCart = mutation({
  args: {
    user_id: v.id("users"),
    product_id: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if product exists and is available
    const product = await ctx.db.get(args.product_id);
    if (!product || !product.is_available) {
      throw new Error("Product not available");
    }

    // Check if item already exists in cart
    const existingItem = await ctx.db
      .query("cart")
      .withIndex("by_user_product", (q) =>
        q.eq("user_id", args.user_id).eq("product_id", args.product_id),
      )
      .first();

    if (existingItem) {
      // Update quantity
      await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + args.quantity,
        added_at: Date.now(),
      });
      return existingItem._id;
    } else {
      // Add new item
      const cartItemId = await ctx.db.insert("cart", {
        user_id: args.user_id,
        product_id: args.product_id,
        quantity: args.quantity,
        added_at: Date.now(),
      });
      return cartItemId;
    }
  },
});

// Get user's cart
export const getCart = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .collect();

    // Get product details for each cart item
    const cartWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.product_id);
        return {
          ...item,
          product,
        };
      }),
    );

    return cartWithProducts;
  },
});

// Update cart item quantity
export const updateCartItemQuantity = mutation({
  args: {
    user_id: v.id("users"),
    product_id: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      // Remove item from cart
      return await removeFromCartHelper(ctx, args.user_id, args.product_id);
    }

    const cartItem = await ctx.db
      .query("cart")
      .withIndex("by_user_product", (q) =>
        q.eq("user_id", args.user_id).eq("product_id", args.product_id),
      )
      .first();

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    await ctx.db.patch(cartItem._id, {
      quantity: args.quantity,
      added_at: Date.now(),
    });

    return cartItem._id;
  },
});

// Remove item from cart
export const removeFromCart = mutation({
  args: {
    user_id: v.id("users"),
    product_id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const cartItem = await ctx.db
      .query("cart")
      .withIndex("by_user_product", (q) =>
        q.eq("user_id", args.user_id).eq("product_id", args.product_id),
      )
      .first();

    if (cartItem) {
      await ctx.db.delete(cartItem._id);
      return true;
    }

    return false;
  },
});

// Clear user's cart
export const clearCart = mutation({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .collect();

    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));

    return true;
  },
});

// Get cart summary
export const getCartSummary = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .collect();

    let totalItems = 0;
    let totalPrice = 0;
    let availableItems = 0;
    let unavailableItems = 0;

    for (const item of cartItems) {
      const product = await ctx.db.get(item.product_id);
      if (product) {
        totalItems += item.quantity;
        totalPrice += product.price * item.quantity;

        if (product.is_available && product.stock_quantity >= item.quantity) {
          availableItems += item.quantity;
        } else {
          unavailableItems += item.quantity;
        }
      }
    }

    return {
      totalItems,
      totalPrice,
      availableItems,
      unavailableItems,
      itemCount: cartItems.length,
    };
  },
});

// Sync cart with Convex (for persistence)
export const syncCartWithConvex = mutation({
  args: {
    user_id: v.id("users"),
    items: v.array(
      v.object({
        product_id: v.id("products"),
        quantity: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Clear existing cart
    await clearCartHelper(ctx, { user_id: args.user_id });

    // Add new items
    const results = [];
    for (const item of args.items) {
      try {
        const cartItemId = await addToCartHelper(ctx, {
          user_id: args.user_id,
          product_id: item.product_id,
          quantity: item.quantity,
        });
        results.push({ success: true, id: cartItemId });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});

// Helper function for removeFromCart
async function removeFromCartHelper(ctx: any, user_id: any, product_id: any) {
  const cartItem = await ctx.db
    .query("cart")
    .withIndex("by_user_product", (q: any) =>
      q.eq("user_id", user_id).eq("product_id", product_id),
    )
    .first();

  if (cartItem) {
    await ctx.db.delete(cartItem._id);
    return true;
  }

  return false;
}

// Helper function for clearCart
async function clearCartHelper(ctx: any, args: { user_id: any }) {
  const cartItems = await ctx.db
    .query("cart")
    .withIndex("by_user", (q: any) => q.eq("user_id", args.user_id))
    .collect();

  await Promise.all(cartItems.map((item: any) => ctx.db.delete(item._id)));

  return true;
}

// Helper function for addToCart
async function addToCartHelper(
  ctx: any,
  args: { user_id: any; product_id: any; quantity: number },
) {
  // Check if product exists and is available
  const product = await ctx.db.get(args.product_id);
  if (!product || !product.is_available) {
    throw new Error("Product not available");
  }

  // Check if item already exists in cart
  const existingItem = await ctx.db
    .query("cart")
    .withIndex("by_user_product", (q: any) =>
      q.eq("user_id", args.user_id).eq("product_id", args.product_id),
    )
    .first();

  if (existingItem) {
    // Update quantity
    await ctx.db.patch(existingItem._id, {
      quantity: existingItem.quantity + args.quantity,
      added_at: Date.now(),
    });
    return existingItem._id;
  } else {
    // Add new item
    const cartItemId = await ctx.db.insert("cart", {
      user_id: args.user_id,
      product_id: args.product_id,
      quantity: args.quantity,
      added_at: Date.now(),
    });
    return cartItemId;
  }
}
