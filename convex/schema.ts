import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (Unified auth for all roles)
  users: defineTable({
    id: v.string(), // Supabase user ID
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    password_hash: v.optional(v.string()), // For direct auth (if not using Supabase)
    avatar_url: v.optional(v.string()),
    provider: v.optional(v.string()), // 'google', 'email', etc.
    role: v.union(
      v.literal("customer"), // USER role
      v.literal("shop_owner"), // SHOPKEEPER role
      v.literal("admin"), // ADMIN role
      v.literal("rider"), // RIDER role
    ),
    is_active: v.boolean(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_role", ["role"])
    .index("by_user_id", ["id"]),

  // Shops table (Vendor shops)
  shops: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    owner_id: v.id("users"),
    owner_name: v.optional(v.string()), // Vendor owner name (optional for backward compatibility)
    shop_type: v.optional(v.string()), // e.g., "grocery", "pharmacy", "restaurant" (optional for backward compatibility)
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
    location: v.optional(
      v.object({
        lat: v.number(),
        lon: v.number(),
        accuracy: v.number(),
        snapped: v.boolean(),
        source: v.string(), // "gps", "gps+snap", "gps+snap+manual"
        addressText: v.string(),
        road: v.optional(v.string()),
        suburb: v.optional(v.string()),
        city: v.optional(v.string()),
        postcode: v.optional(v.string()),
        village: v.optional(v.string()),
        hamlet: v.optional(v.string()),
        county: v.optional(v.string()),
        stateDistrict: v.optional(v.string()),
        state: v.optional(v.string()),
      }),
    ),
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
    // Vendor-specific fields (optional for backward compatibility)
    radius_km: v.optional(v.number()), // Delivery radius in km (default: 2)
    delivery_profile: v.optional(
      v.object({
        base_prep_minutes: v.number(), // Base preparation time
        max_parallel_orders: v.number(), // Max orders prepared simultaneously
        buffer_minutes: v.number(), // Buffer time for delays
        avg_rider_speed_kmph: v.number(), // Average rider speed
      }),
    ),
    is_verified: v.optional(v.boolean()), // Admin verification status (optional for backward compatibility)
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
    rider_id: v.optional(v.id("riders")), // Assigned delivery rider
    order_number: v.string(),
    status: v.union(
      v.literal("pending"), // PLACED - Customer placed order
      v.literal("accepted_by_shopkeeper"), // ACCEPTED_BY_SHOPKEEPER - Shopkeeper accepted
      v.literal("assigned_to_rider"), // ASSIGNED_TO_RIDER - Rider assigned manually
      v.literal("out_for_delivery"), // OUT_FOR_DELIVERY - Rider picked up and delivering
      v.literal("delivered"), // DELIVERED - Order completed
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
    .index("by_rider", ["rider_id"])
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
      v.literal("ORDER"),
      v.literal("DELIVERY"),
      v.literal("PAYMENT"),
      v.literal("SYSTEM"),
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
    .index("by_sent", ["is_sent"])
    .index("by_user_read", ["user_id", "is_read"]),

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

  // Riders table (Delivery partners) - linked to users
  riders: defineTable({
    rider_id: v.id("users"), // References users table
    current_location: v.object({
      lat: v.number(),
      lon: v.number(),
    }),
    is_online: v.boolean(),
    is_busy: v.boolean(),
    assigned_order_id: v.optional(v.id("orders")),
    updated_at: v.number(),
    created_at: v.number(),
  })
    .index("by_rider", ["rider_id"])
    .index("by_online", ["is_online"])
    .index("by_busy", ["is_busy"])
    .index("by_assigned_order", ["assigned_order_id"]),

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
      // New accurate location fields
      lat: v.optional(v.number()),
      lon: v.optional(v.number()),
      accuracy: v.optional(v.number()),
      snapped: v.optional(v.boolean()),
      source: v.optional(v.string()),
      village: v.optional(v.string()),
      hamlet: v.optional(v.string()),
      county: v.optional(v.string()),
      stateDistrict: v.optional(v.string()),
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

  // Favorites / Wishlist table
  favorites: defineTable({
    user_id: v.id("users"),
    product_id: v.optional(v.id("products")),
    shop_id: v.optional(v.id("shops")),
    created_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_user_product", ["user_id", "product_id"])
    .index("by_user_shop", ["user_id", "shop_id"]),
});
