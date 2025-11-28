import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new category
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    parent_id: v.optional(v.id("categories")),
    image_url: v.optional(v.string()),
    sort_order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      description: args.description,
      parent_id: args.parent_id,
      image_url: args.image_url,
      is_active: true,
      sort_order: args.sort_order || 0,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return categoryId;
  },
});

// Seed default categories (for initial setup)
export const seedDefaultCategories = mutation({
  handler: async (ctx) => {
    // Check if categories already exist
    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) {
      return { message: "Categories already exist", count: existingCategories.length };
    }

    // Default categories matching the Navbar
    const defaultCategories = [
      { name: "All", description: "All products", sort_order: 0 },
      { name: "Cafe", description: "Coffee, tea, and beverages", sort_order: 1 },
      { name: "Home", description: "Home and kitchen essentials", sort_order: 2 },
      { name: "Toys", description: "Toys and games", sort_order: 3 },
      { name: "Fresh Grocery", description: "Fresh fruits, vegetables, and groceries", sort_order: 4 },
      { name: "Electronics", description: "Electronic devices and accessories", sort_order: 5 },
      { name: "Mobiles", description: "Mobile phones and accessories", sort_order: 6 },
      { name: "Beauty", description: "Beauty and personal care products", sort_order: 7 },
      { name: "Fashion", description: "Clothing and fashion accessories", sort_order: 8 },
    ];

    const createdIds = [];
    for (const cat of defaultCategories) {
      const id = await ctx.db.insert("categories", {
        name: cat.name,
        description: cat.description,
        is_active: true,
        sort_order: cat.sort_order,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      createdIds.push(id);
    }

    return { message: "Default categories created", count: createdIds.length, ids: createdIds };
  },
});

// Get category by ID
export const getCategory = query({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all categories
export const getAllCategories = query({
  args: {
    is_active: v.optional(v.boolean()),
    parent_id: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    let categories;

    if (args.parent_id !== undefined) {
      categories = await ctx.db
        .query("categories")
        .withIndex("by_parent", (q: any) => q.eq("parent_id", args.parent_id))
        .collect();
    } else {
      categories = await ctx.db.query("categories").collect();
    }

    // Filter by is_active if needed
    if (args.is_active !== undefined) {
      categories = categories.filter(
        (cat: any) => cat.is_active === args.is_active,
      );
    }

    // Sort by sort_order
    categories.sort((a: any, b: any) => a.sort_order - b.sort_order);

    return categories;
  },
});

// Get root categories (no parent)
export const getRootCategories = query({
  args: {
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get all categories and filter for those without parent_id
    let categories = await ctx.db.query("categories").collect();
    
    // Filter for root categories (no parent_id)
    categories = categories.filter((cat) => !cat.parent_id);

    // Filter by active status
    if (args.is_active !== undefined) {
      categories = categories.filter(
        (cat) => cat.is_active === args.is_active,
      );
    }

    // Sort by sort_order
    categories.sort((a, b) => a.sort_order - b.sort_order);

    return categories;
  },
});

// Get subcategories
export const getSubcategories = query({
  args: {
    parent_id: v.id("categories"),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parent_id", args.parent_id));

    if (args.is_active !== undefined) {
      query = query.filter((q) => q.eq(q.field("is_active"), args.is_active));
    }

    const categories = await query.collect();

    // Sort by sort_order
    categories.sort((a, b) => a.sort_order - b.sort_order);

    return categories;
  },
});

// Search categories
export const searchCategories = query({
  args: {
    query: v.string(),
    is_active: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let categories = await ctx.db.query("categories").collect();

    // Filter by search query
    if (args.query) {
      const searchTerm = args.query.toLowerCase();
      categories = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm) ||
          category.description?.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by active status
    if (args.is_active !== undefined) {
      categories = categories.filter(
        (category) => category.is_active === args.is_active,
      );
    }

    // Sort by sort_order
    categories.sort((a, b) => a.sort_order - b.sort_order);

    if (args.limit) {
      return categories.slice(0, args.limit);
    }

    return categories;
  },
});

// Update category
export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    parent_id: v.optional(v.id("categories")),
    image_url: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    sort_order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.parent_id !== undefined && { parent_id: args.parent_id }),
      ...(args.image_url !== undefined && { image_url: args.image_url }),
      ...(args.is_active !== undefined && { is_active: args.is_active }),
      ...(args.sort_order !== undefined && { sort_order: args.sort_order }),
      updated_at: Date.now(),
    });

    return args.id;
  },
});

// Get category tree (hierarchical structure)
export const getCategoryTree = query({
  args: {
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const categories = await ctx.db.query("categories").collect();

    // Filter by active status
    let filteredCategories = categories;
    if (args.is_active !== undefined) {
      filteredCategories = categories.filter(
        (category) => category.is_active === args.is_active,
      );
    }

    // Build tree structure (supports 3 levels: category → sub → sub-sub)
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create map of all categories
    filteredCategories.forEach((category) => {
      categoryMap.set(category._id, {
        ...category,
        children: [],
        subChildren: [], // For sub-sub-categories
      });
    });

    // Second pass: build tree structure
    filteredCategories.forEach((category) => {
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          // Check if parent has a parent (making this a sub-sub-category)
          if (parent.parent_id) {
            // This is a sub-sub-category, find the root parent
            const rootParent = categoryMap.get(parent.parent_id);
            if (rootParent) {
              // Find the sub-category in root parent's children
              const subCategory = rootParent.children.find(
                (child: any) => child._id === parent._id,
              );
              if (subCategory) {
                if (!subCategory.subChildren) {
                  subCategory.subChildren = [];
                }
                subCategory.subChildren.push(categoryMap.get(category._id));
              }
            }
          } else {
            // This is a sub-category
            parent.children.push(categoryMap.get(category._id));
          }
        }
      } else {
        rootCategories.push(categoryMap.get(category._id));
      }
    });

    // Sort by sort_order
    const sortCategories = (categories: any[]) => {
      categories.sort((a, b) => a.sort_order - b.sort_order);
      categories.forEach((category) => {
        if (category.children && category.children.length > 0) {
          sortCategories(category.children);
        }
        if (category.subChildren && category.subChildren.length > 0) {
          sortCategories(category.subChildren);
        }
      });
    };

    sortCategories(rootCategories);

    return rootCategories;
  },
});

// Get all categories in flat list with hierarchy level
export const getCategoriesWithLevel = query({
  args: {
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const categories = await ctx.db.query("categories").collect();

    // Filter by active status
    let filteredCategories = categories;
    if (args.is_active !== undefined) {
      filteredCategories = categories.filter(
        (category) => category.is_active === args.is_active,
      );
    }

    // Build hierarchy map
    const categoryMap = new Map();
    filteredCategories.forEach((category) => {
      categoryMap.set(category._id, category);
    });

    // Add level to each category
    const getLevel = (category: any, level = 0): number => {
      if (!category.parent_id) return level;
      const parent = categoryMap.get(category.parent_id);
      if (!parent) return level;
      return getLevel(parent, level + 1);
    };

    return filteredCategories.map((category) => ({
      ...category,
      level: getLevel(category),
    }));
  },
});

// Get category with products count
export const getCategoryWithProductCount = query({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Get products in this category
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category_id", args.id))
      .collect();

    const availableProducts = products.filter(
      (product) => product.is_available,
    );

    return {
      ...category,
      total_products: products.length,
      available_products: availableProducts.length,
    };
  },
});

// Delete category (soft delete)
export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check if category has products
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category_id", args.id))
      .collect();

    if (products.length > 0) {
      throw new Error("Cannot delete category with products");
    }

    // Check if category has subcategories
    const subcategories = await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parent_id", args.id))
      .collect();

    if (subcategories.length > 0) {
      throw new Error("Cannot delete category with subcategories");
    }

    await ctx.db.patch(args.id, {
      is_active: false,
      updated_at: Date.now(),
    });

    return args.id;
  },
});
