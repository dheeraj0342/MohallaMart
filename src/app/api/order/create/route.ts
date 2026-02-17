import { NextRequest, NextResponse } from "next/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { haversineDistanceKm } from "@/lib/distance";
import { calculateEtaMinutes, DEFAULT_STORE_PROFILE } from "@/lib/eta";
import { isPeakHour } from "@/lib/time";

/**
 * POST /api/order/create
 * Create a new order with stock validation, ETA calculation, and tracking URL
 * 
 * Returns: { orderId, trackingUrl, eta: { minEta, maxEta } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      shop_id,
      items,
      subtotal,
      delivery_fee,
      tax,
      total_amount,
      delivery_address,
      payment_method,
      notes,
    } = body;

    // Validate required fields
    if (!user_id || !shop_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, shop_id, or items" },
        { status: 400 }
      );
    }

    if (!delivery_address || typeof delivery_address !== "object") {
      return NextResponse.json(
        { error: "Delivery address is required" },
        { status: 400 }
      );
    }
    const { street: addrStreet, city: addrCity, pincode: addrPincode, state: addrState } = delivery_address;
    if (!addrStreet?.trim() || !addrCity?.trim() || !addrPincode?.trim() || !addrState?.trim()) {
      return NextResponse.json(
        { error: "Address must include street, city, pincode, and state" },
        { status: 400 }
      );
    }

    // 1. Validate stock availability
    const productIds = items.map((item: { product_id: string }) => item.product_id);
    
    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "No products in order" },
        { status: 400 }
      );
    }

    const products = await fetchQuery(api.products.getProducts, { ids: productIds as any });
    
    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "No products found. Please refresh and try again." },
        { status: 404 }
      );
    }

    for (const item of items) {
      const productIdStr = String(item.product_id);
      const product = products.find((p) => String(p._id) === productIdStr);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.name} not found` },
          { status: 404 }
        );
      }
      if (!product.is_available) {
        return NextResponse.json(
          { error: `Product ${item.name} is currently unavailable` },
          { status: 400 }
        );
      }
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}` },
          { status: 400 }
        );
      }
    }

    // 2. Get shop details for ETA calculation
    const shop = await fetchQuery(api.shops.getShop, { id: shop_id as any });
    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    // 3. Calculate ETA if delivery address has coordinates
    let eta = null;
    if (delivery_address?.coordinates && shop.address?.coordinates) {
      const distanceKm = haversineDistanceKm(
        shop.address.coordinates.lat,
        shop.address.coordinates.lng,
        delivery_address.coordinates.lat,
        delivery_address.coordinates.lng
      );

      // Get pending orders count for this shop
      const pendingOrders = await fetchQuery(api.orders.getOrdersByShop, {
        shop_id: shop_id as any,
        status: "pending",
      });

      // Convert shop delivery_profile to StoreDeliveryProfile format
      const storeProfile = shop.delivery_profile
        ? {
            basePrepMinutes: shop.delivery_profile.base_prep_minutes,
            maxParallelOrders: shop.delivery_profile.max_parallel_orders,
            bufferMinutes: shop.delivery_profile.buffer_minutes,
            avgRiderSpeedKmph: shop.delivery_profile.avg_rider_speed_kmph,
          }
        : DEFAULT_STORE_PROFILE;

      const etaResult = calculateEtaMinutes({
        storeProfile,
        distanceKm,
        currentPendingOrders: pendingOrders?.length || 0,
        isPeakHour: isPeakHour(),
      });

      eta = {
        minEta: etaResult.minEta,
        maxEta: etaResult.maxEta,
      };
    }

    // 4. Create order (stock deduction happens in mutation)
    const orderId = await fetchMutation(api.orders.createOrder, {
      user_id: user_id as any,
      shop_id: shop_id as any,
      items,
      subtotal,
      delivery_fee,
      tax,
      total_amount,
      delivery_address,
      payment_method,
      notes,
    });

    // 5. Get order details to retrieve order number
    const order = await fetchQuery(api.orders.getOrder, { id: orderId as any });

    // 6. Generate tracking URL
    const trackingUrl = `/track/${orderId}`;

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber: order?.order_number || "",
      trackingUrl,
      eta,
      message: "Order created successfully. Awaiting shopkeeper acceptance.",
    });
  } catch (err: any) {
    console.error("[Order Create] Error:", err);
    console.error("[Order Create] Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return NextResponse.json(
      { 
        error: err.message || "Failed to create order",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}

