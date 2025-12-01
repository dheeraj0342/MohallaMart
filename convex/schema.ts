import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    id: v.string(), // Supabase user ID
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    role: v.union(
      v.literal("customer"),
      v.literal("shop_owner"),
      v.literal("admin"),
    ),
    is_active: v.boolean(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_role", ["role"]),

  // Shops table
  shops: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    owner_id: v.id("users"),
    categories: v.optional(v.array(v.id("categories"))),
    logo_url: v.optional(v.string()),
    address: v.object({
      street: v.string(),
      city: v.string(),
      pincode: v.string(),
      state: v.string(),
      coordinates: v.optional(
        v.object({
          lat: v.number(),
          lng: v.number(),
        }),
      ),
    }),
    contact: v.object({
      phone: v.string(),
      email: v.optional(v.string()),
    }),
    business_hours: v.optional(
      v.object({
        monday: v.optional(v.object({ open: v.string(), close: v.string() })),
        tuesday: v.optional(v.object({ open: v.string(), close: v.string() })),
        wednesday: v.optional(
          v.object({ open: v.string(), close: v.string() }),
        ),
        thursday: v.optional(v.object({ open: v.string(), close: v.string() })),
        friday: v.optional(v.object({ open: v.string(), close: v.string() })),
        saturday: v.optional(v.object({ open: v.string(), close: v.string() })),
        sunday: v.optional(v.object({ open: v.string(), close: v.string() })),
      }),
    ),
    is_active: v.boolean(),
    rating: v.optional(v.number()),
    total_orders: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_owner", ["owner_id"])
    .index("by_city", ["address.city"])
    .index("by_pincode", ["address.pincode"])
    .index("by_active", ["is_active"]),

  // Categories table
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    parent_id: v.optional(v.id("categories")),
    image_url: v.optional(v.string()),
    is_active: v.boolean(),
    sort_order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_parent", ["parent_id"])
    .index("by_active", ["is_active"])
    .index("by_sort_order", ["sort_order"]),

  // Products table
  products: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    brand: v.optional(v.string()),
    ingredients: v.optional(v.array(v.string())),
    nutrition_facts: v.optional(v.array(v.string())),
    shop_id: v.id("shops"),
    category_id: v.id("categories"),
    price: v.number(),
    original_price: v.optional(v.number()),
    stock_quantity: v.number(),
    min_order_quantity: v.number(),
    max_order_quantity: v.number(),
    unit: v.string(), // kg, piece, liter, etc.
    images: v.array(v.string()),
    tags: v.array(v.string()),
    variants: v.optional(v.array(v.string())),
    is_available: v.boolean(),
    is_featured: v.boolean(),
    rating: v.optional(v.number()),
    total_sales: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_shop", ["shop_id"])
    .index("by_category", ["category_id"])
    .index("by_available", ["is_available"])
    .index("by_featured", ["is_featured"])
    .index("by_shop_available", ["shop_id", "is_available"]),

  // Cart table
  cart: defineTable({
    user_id: v.id("users"),
    product_id: v.id("products"),
    quantity: v.number(),
    added_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_user_product", ["user_id", "product_id"]),

  // Orders table
  orders: defineTable({
    user_id: v.id("users"),
    shop_id: v.id("shops"),
    order_number: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
    items: v.array(
      v.object({
        product_id: v.id("products"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        total_price: v.number(),
      }),
    ),
    subtotal: v.number(),
    delivery_fee: v.number(),
    tax: v.number(),
    total_amount: v.number(),
    delivery_address: v.object({
      street: v.string(),
      city: v.string(),
      pincode: v.string(),
      state: v.string(),
      coordinates: v.optional(
        v.object({
          lat: v.number(),
          lng: v.number(),
        }),
      ),
    }),
    payment_method: v.string(),
    payment_status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    delivery_time: v.optional(v.string()),
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_shop", ["shop_id"])
    .index("by_status", ["status"])
    .index("by_order_number", ["order_number"])
    .index("by_created_at", ["created_at"]),

  // Order items table (for detailed tracking)
  order_items: defineTable({
    order_id: v.id("orders"),
    product_id: v.id("products"),
    quantity: v.number(),
    price: v.number(),
    total_price: v.number(),
  })
    .index("by_order", ["order_id"])
    .index("by_product", ["product_id"]),

  // Reviews table
  reviews: defineTable({
    user_id: v.id("users"),
    product_id: v.optional(v.id("products")),
    shop_id: v.optional(v.id("shops")),
    order_id: v.optional(v.id("orders")),
    rating: v.number(),
    comment: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    is_verified: v.boolean(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_product", ["product_id"])
    .index("by_shop", ["shop_id"])
    .index("by_order", ["order_id"])
    .index("by_rating", ["rating"]),

  // Notifications table
  notifications: defineTable({
    user_id: v.id("users"),
    type: v.union(
      v.literal("order_update"),
      v.literal("promotion"),
      v.literal("system"),
      v.literal("delivery"),
    ),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    is_read: v.boolean(),
    is_sent: v.boolean(),
    sent_at: v.optional(v.number()),
    created_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_type", ["type"])
    .index("by_read", ["is_read"])
    .index("by_sent", ["is_sent"]),

  // User locations table
  user_locations: defineTable({
    user_id: v.id("users"),
    city: v.string(),
    area: v.string(),
    pincode: v.optional(v.string()),
    coordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    is_default: v.boolean(),
    created_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_city", ["city"])
    .index("by_pincode", ["pincode"])
    .index("by_default", ["user_id", "is_default"]),

  // Search analytics table
  search_analytics: defineTable({
    query: v.string(),
    user_id: v.optional(v.id("users")),
    results_count: v.number(),
    filters: v.optional(v.any()),
    created_at: v.number(),
  })
    .index("by_query", ["query"])
    .index("by_user", ["user_id"])
    .index("by_created_at", ["created_at"]),

  // System settings table
  system_settings: defineTable({
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    updated_at: v.number(),
  }).index("by_key", ["key"]),

  // Shopkeeper applications table
  shopkeeper_applications: defineTable({
    applicant_id: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    reviewer_id: v.optional(v.id("users")),
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_applicant", ["applicant_id"])
    .index("by_status", ["status"]),

  // Admin audit logs
  admin_audit_logs: defineTable({
    action: v.string(),
    target_user_id: v.id("users"),
    performed_by: v.optional(v.id("users")),
    metadata: v.optional(v.any()),
    created_at: v.number(),
  })
    .index("by_target", ["target_user_id"])
    .index("by_action", ["action"])
    .index("by_created_at", ["created_at"]),

  // Seller (Shopkeeper) registrations table
  seller_registrations: defineTable({
    user_id: v.id("users"),
    pan: v.string(),
    gstin: v.optional(v.string()),
    bank: v.object({
      account_holder: v.string(),
      account_number: v.string(),
      ifsc: v.string(),
    }),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      pincode: v.string(),
    }),
    identity: v.object({
      type: v.union(
        v.literal("aadhaar"),
        v.literal("passport"),
        v.literal("voter_id"),
        v.literal("driver_license"),
      ),
      number: v.string(),
    }),
    business: v.object({
      type: v.union(
        v.literal("individual"),
        v.literal("proprietorship"),
        v.literal("partnership"),
        v.literal("company"),
      ),
      name: v.optional(v.string()),
      documents: v.optional(v.array(v.string())),
    }),
    pickup_address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      pincode: v.string(),
    }),
    first_product: v.optional(
      v.object({
        name: v.optional(v.string()),
        url: v.optional(v.string()),
      }),
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("reviewing"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_status", ["status"]),
});
