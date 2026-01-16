import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new product (with vendor permission check)
export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    shop_id: v.id("shops"),
    owner_id: v.id("users"), // Verify ownership
    category_id: v.id("categories"),
    price: v.number(),
    original_price: v.optional(v.number()),
    stock_quantity: v.number(),
    min_order_quantity: v.number(),
    max_order_quantity: v.number(),
    unit: v.string(),
    images: v.array(v.string()),
    tags: v.array(v.string()),
    is_featured: v.optional(v.boolean()),
    variants: v.optional(
      v.array(
        v.object({
          name: v.string(),
          price: v.number(),
          stock: v.number(),
          sku: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    const shop = await ctx.db.get(args.shop_id);
    if (!shop || shop.owner_id !== args.owner_id) {
      throw new Error("Unauthorized: You can only add products to your own shops");
    }

    const productId = await ctx.db.insert("products", {
      name: args.name,
      description: args.description,
      shop_id: args.shop_id,
      category_id: args.category_id,
      price: args.price,
      original_price: args.original_price,
      stock_quantity: args.stock_quantity,
      min_order_quantity: args.min_order_quantity,
      max_order_quantity: args.max_order_quantity,
      unit: args.unit,
      images: args.images,
      tags: args.tags,
      variants: args.variants,
      is_available: args.stock_quantity > 0,
      is_featured: args.is_featured || false,
      rating: 0,
      total_sales: 0,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return productId;
  },
});

// Get product by ID
export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get multiple products by IDs
export const getProducts = query({
  args: { ids: v.array(v.id("products")) },
  handler: async (ctx, args) => {
    const products = [];
    for (const id of args.ids) {
      const product = await ctx.db.get(id);
      if (product) products.push(product);
    }
    return products;
  },
});

// Get product by slug (generated from name)
export const getProductBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("is_available"), true))
      .collect();

    const generateSlug = (text: string): string => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    const product = products.find((p) => generateSlug(p.name) === args.slug);
    return product || null;
  },
});

// Get all available products
export const getAllProducts = query({
  args: {},
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("is_available"), true))
      .collect();

    // Sort by rating (highest first)
    products.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return products;
  },
});

// Get products by shop
export const getProductsByShop = query({
  args: {
    shop_id: v.id("shops"),
    is_available: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("products")
      .withIndex("by_shop", (q) => q.eq("shop_id", args.shop_id));

    if (args.is_available !== undefined) {
      query = query.filter((q) =>
        q.eq(q.field("is_available"), args.is_available),
      );
    }

    const products = await query.collect();

    if (args.limit) {
      return products.slice(0, args.limit);
    }

    return products;
  },
});

// Get products by category
export const getProductsByCategory = query({
  args: {
    category_id: v.id("categories"),
    is_available: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category_id", args.category_id));

    if (args.is_available !== undefined) {
      query = query.filter((q) =>
        q.eq(q.field("is_available"), args.is_available),
      );
    }

    const products = await query.collect();

    if (args.limit) {
      return products.slice(0, args.limit);
    }

    return products;
  },
});

// Search products
export const searchProducts = query({
  args: {
    query: v.string(),
    category_id: v.optional(v.id("categories")),
    shop_id: v.optional(v.id("shops")),
    min_price: v.optional(v.number()),
    max_price: v.optional(v.number()),
    is_available: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();

    // Filter by search query
    if (args.query) {
      const searchTerm = args.query.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      );
    }

    // Filter by category
    if (args.category_id) {
      products = products.filter(
        (product) => product.category_id === args.category_id,
      );
    }

    // Filter by shop
    if (args.shop_id) {
      products = products.filter((product) => product.shop_id === args.shop_id);
    }

    // Filter by price range
    if (args.min_price !== undefined) {
      products = products.filter((product) => product.price >= args.min_price!);
    }
    if (args.max_price !== undefined) {
      products = products.filter((product) => product.price <= args.max_price!);
    }

    // Filter by availability
    if (args.is_available !== undefined) {
      products = products.filter(
        (product) => product.is_available === args.is_available,
      );
    }

    // Sort by relevance (featured first, then by rating)
    products.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });

    if (args.limit) {
      return products.slice(0, args.limit);
    }

    return products;
  },
});

// Update product (with vendor permission check)
export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    owner_id: v.id("users"), // Verify ownership
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    original_price: v.optional(v.number()),
    stock_quantity: v.optional(v.number()),
    min_order_quantity: v.optional(v.number()),
    max_order_quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    is_available: v.optional(v.boolean()),
    is_featured: v.optional(v.boolean()),
    variants: v.optional(
      v.array(
        v.object({
          name: v.string(),
          price: v.number(),
          stock: v.number(),
          sku: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Verify ownership
    const shop = await ctx.db.get(product.shop_id);
    if (!shop || shop.owner_id !== args.owner_id) {
      throw new Error("Unauthorized: You can only update your own products");
    }

    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.price !== undefined && { price: args.price }),
      ...(args.original_price !== undefined && {
        original_price: args.original_price,
      }),
      ...(args.stock_quantity !== undefined && {
        stock_quantity: args.stock_quantity,
      }),
      ...(args.min_order_quantity !== undefined && {
        min_order_quantity: args.min_order_quantity,
      }),
      ...(args.max_order_quantity !== undefined && {
        max_order_quantity: args.max_order_quantity,
      }),
      ...(args.unit && { unit: args.unit }),
      ...(args.images && { images: args.images }),
      ...(args.tags && { tags: args.tags }),
      ...(args.is_available !== undefined && {
        is_available: args.is_available,
      }),
      ...(args.is_featured !== undefined && { is_featured: args.is_featured }),
      ...(args.variants && { variants: args.variants }),
      updated_at: Date.now(),
    });

    return args.id;
  },
});

// Update product stock
export const updateProductStock = mutation({
  args: {
    id: v.id("products"),
    quantity: v.number(),
    operation: v.union(
      v.literal("add"),
      v.literal("subtract"),
      v.literal("set"),
    ),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error("Product not found");
    }

    let newQuantity = product.stock_quantity;

    switch (args.operation) {
      case "add":
        newQuantity += args.quantity;
        break;
      case "subtract":
        newQuantity = Math.max(0, newQuantity - args.quantity);
        break;
      case "set":
        newQuantity = args.quantity;
        break;
    }

    await ctx.db.patch(args.id, {
      stock_quantity: newQuantity,
      is_available: newQuantity > 0,
      updated_at: Date.now(),
    });

    return args.id;
  },
});

// Get featured products
export const getFeaturedProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_featured", (q) => q.eq("is_featured", true))
      .filter((q) => q.eq(q.field("is_available"), true))
      .collect();

    // Sort by rating
    products.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    if (args.limit) {
      return products.slice(0, args.limit);
    }

    return products;
  },
});

// Get products by tags
export const getProductsByTags = query({
  args: {
    tags: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();

    const filteredProducts = products.filter(
      (product) =>
        product.tags.some((tag) => args.tags.includes(tag)) &&
        product.is_available,
    );

    // Sort by rating
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    if (args.limit) {
      return filteredProducts.slice(0, args.limit);
    }

    return filteredProducts;
  },
});

// Get products by vendor (shop owner)
export const getMyProducts = query({
  args: {
    owner_id: v.id("users"),
    search: v.optional(v.string()),
    category_id: v.optional(v.id("categories")),
    is_available: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get shops owned by this user
    const shops = await ctx.db
      .query("shops")
      .withIndex("by_owner", (q) => q.eq("owner_id", args.owner_id))
      .collect();

    if (shops.length === 0) {
      return [];
    }

    const shopIds = shops.map((s) => s._id);

    // Get all products from these shops
    let products = await ctx.db.query("products").collect();
    products = products.filter((p) => shopIds.includes(p.shop_id));

    // Filter by search query
    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      );
    }

    // Filter by category
    if (args.category_id) {
      products = products.filter(
        (product) => product.category_id === args.category_id,
      );
    }

    // Filter by availability
    if (args.is_available !== undefined) {
      products = products.filter(
        (product) => product.is_available === args.is_available,
      );
    }

    // Sort by created_at (newest first)
    products.sort((a, b) => b.created_at - a.created_at);

    return products;
  },
});

// Delete product (with vendor permission check)
export const deleteProduct = mutation({
  args: {
    id: v.id("products"),
    owner_id: v.id("users"), // Verify ownership
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Verify ownership
    const shop = await ctx.db.get(product.shop_id);
    if (!shop || shop.owner_id !== args.owner_id) {
      throw new Error("Unauthorized: You can only delete your own products");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Toggle product availability
export const toggleProductAvailability = mutation({
  args: {
    id: v.id("products"),
    is_available: v.boolean(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error("Product not found");
    }

    await ctx.db.patch(args.id, {
      is_available: args.is_available,
      updated_at: Date.now(),
    });

    return args.id;
  },
});

// Bulk create products
export const bulkCreateProducts = mutation({
  args: {
    products: v.array(
      v.object({
        name: v.string(),
        description: v.optional(v.string()),
        shop_id: v.id("shops"),
        category_id: v.id("categories"),
        price: v.number(),
        original_price: v.optional(v.number()),
        stock_quantity: v.number(),
        min_order_quantity: v.number(),
        max_order_quantity: v.number(),
        unit: v.string(),
        images: v.array(v.string()),
        tags: v.array(v.string()),
      })
    ),
    owner_id: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify ownership for all shops involved (usually just one)
    const shopIds = [...new Set(args.products.map((p) => p.shop_id))];
    
    for (const shopId of shopIds) {
      const shop = await ctx.db.get(shopId);
      if (!shop || shop.owner_id !== args.owner_id) {
        throw new Error("Unauthorized: You can only add products to your own shops");
      }
    }

    const insertedIds = [];
    for (const product of args.products) {
      const id = await ctx.db.insert("products", {
        ...product,
        is_available: product.stock_quantity > 0,
        is_featured: false,
        rating: 0,
        total_sales: 0,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      insertedIds.push(id);
    }

    return insertedIds;
  },
});

// Toggle flash deal for a product
export const toggleFlashDeal = mutation({
  args: {
    product_id: v.id("products"),
    owner_id: v.id("users"),
    is_flash_deal: v.boolean(),
    flash_deal_discount_percent: v.optional(v.number()),
    flash_deal_start_time: v.optional(v.number()),
    flash_deal_end_time: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the product
    const product = await ctx.db.get(args.product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Verify ownership through shop
    const shop = await ctx.db.get(product.shop_id);
    if (!shop || shop.owner_id !== args.owner_id) {
      throw new Error("Unauthorized: You can only modify flash deals for your own products");
    }

    // Validate discount if enabling flash deal
    if (args.is_flash_deal && args.flash_deal_discount_percent !== undefined) {
      if (args.flash_deal_discount_percent < 0 || args.flash_deal_discount_percent > 100) {
        throw new Error("Discount percentage must be between 0 and 100");
      }
    }

    // Validate time range if provided
    if (args.is_flash_deal && args.flash_deal_start_time && args.flash_deal_end_time) {
      if (args.flash_deal_start_time >= args.flash_deal_end_time) {
        throw new Error("End time must be after start time");
      }
    }

    // Update product with flash deal information
    await ctx.db.patch(args.product_id, {
      is_flash_deal: args.is_flash_deal,
      flash_deal_discount_percent: args.is_flash_deal ? args.flash_deal_discount_percent : undefined,
      flash_deal_start_time: args.is_flash_deal ? args.flash_deal_start_time : undefined,
      flash_deal_end_time: args.is_flash_deal ? args.flash_deal_end_time : undefined,
      updated_at: Date.now(),
    });

    return { success: true, product_id: args.product_id };
  },
});
