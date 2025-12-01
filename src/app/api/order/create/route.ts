import { NextRequest, NextResponse } from "next/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/../../convex/_generated/api";
import { assignRider } from "@/lib/orderAssignment";
import type { Rider, Order } from "@/lib/orderAssignment";

/**
 * POST /api/order/create
 * Create a new order and auto-assign rider
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

    // Create order
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

    // Get shop location for rider assignment
    const shop = await fetchQuery(api.shops.getShop, { id: shop_id as any });
    
    if (!shop || !shop.address?.coordinates) {
      return NextResponse.json({
        success: true,
        orderId,
        message: "Order created but rider assignment skipped (no shop location)",
      });
    }

    // Get available riders
    const riders = await fetchQuery(api.riders.getAvailableRiders);
    
    if (!riders || riders.length === 0) {
      return NextResponse.json({
        success: true,
        orderId,
        message: "Order created but no riders available",
      });
    }

    // Convert riders to assignment format
    const ridersForAssignment: Rider[] = riders.map((rider) => ({
      id: rider._id,
      name: rider.name,
      phone: rider.phone,
      currentLocation: {
        lat: rider.current_location.lat,
        lon: rider.current_location.lon,
      },
      isOnline: rider.is_online,
      isBusy: rider.is_busy,
      assignedOrderId: rider.assigned_order_id,
      updatedAt: rider.updated_at,
    }));

    // Assign rider
    const orderForAssignment: Order = {
      id: orderId,
      shopId: shop_id,
      vendorLocation: {
        lat: shop.address.coordinates.lat,
        lng: shop.address.coordinates.lng,
      },
      deliveryAddress: delivery_address,
    };

    const assignment = assignRider(
      orderForAssignment,
      ridersForAssignment,
      {
        lat: shop.address.coordinates.lat,
        lng: shop.address.coordinates.lng,
      }
    );

    if (assignment) {
      // Update rider status
      await fetchMutation(api.riders.updateStatus, {
        id: assignment.riderId as any,
        isBusy: true,
        assignedOrderId: orderId as any,
      });

      // Update order status
      await fetchMutation(api.orders.updateOrderStatus, {
        id: orderId as any,
        status: "assigned_to_rider",
        rider_id: assignment.riderId as any,
      });

      // TODO: Send WebSocket notification to rider and customer
      // TODO: Trigger Inngest event for order assignment

      return NextResponse.json({
        success: true,
        orderId,
        rider: {
          id: assignment.riderId,
          name: assignment.riderName,
          distanceToVendor: assignment.distanceToVendor,
          estimatedPickupTime: assignment.estimatedPickupTime,
        },
        message: "Order created and rider assigned",
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order created but no rider available",
    });
  } catch (err: any) {
    console.error("[Order Create] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

