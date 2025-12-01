import { NextRequest, NextResponse } from "next/server";
import { findNearbyVendors } from "@/lib/vendor-geo";
import { calculateEtaMinutes, DEFAULT_STORE_PROFILE, type StoreDeliveryProfile } from "@/lib/eta";
import { isPeakHour } from "@/lib/time";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

export const dynamic = "force-dynamic";

/**
 * API Route: GET /api/vendors/nearby
 * 
 * Returns nearby shops (added by shopkeepers) with distance and ETA calculations
 * 
 * Query parameters:
 * - userLat: User's latitude (required)
 * - userLon: User's longitude (required)
 * - radiusKm: Search radius in km (optional, default: 2)
 * 
 * Response:
 * {
 *   vendors: [
 *     {
 *       id: string,
 *       name: string,
 *       distanceKm: number,
 *       eta: { minEta: number, maxEta: number },
 *       location: { lat: number, lon: number },
 *       ...otherShopFields
 *     }
 *   ]
 * }
 * 
 * Note: Shopkeepers add their stores and then add products to those stores
 */

/**
 * Fetch all active shops from Convex
 * Shopkeepers add stores, and these stores are what we search for
 */
async function fetchAllShops() {
  try {
    const shops = await fetchQuery(api.shops.searchShops, {
      query: "",
      is_active: true,
      limit: 1000, // Get all active shops
    });
    return shops || [];
  } catch (error) {
    console.error("Error fetching shops:", error);
    return [];
  }
}

/**
 * Get store delivery profile
 * TODO: Add delivery profile to shop schema or create separate table
 * For now, returns default profile
 */
async function getStoreDeliveryProfile(shopId: string): Promise<StoreDeliveryProfile> {
  // TODO: Fetch store-specific delivery profile from database
  // Could be stored in shop document or separate delivery_profiles table
  // For now, return default profile
  return DEFAULT_STORE_PROFILE;
}

/**
 * Get current pending orders count for a shop
 */
async function getCurrentPendingOrders(shopId: string): Promise<number> {
  try {
    // Use existing getOrdersByShop query and filter for pending status
    const orders = await fetchQuery(api.orders.getOrdersByShop, {
      shop_id: shopId as Id<"shops">,
      status: "pending",
    });
    return orders?.length || 0;
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    return 0;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userLat = searchParams.get("userLat");
    const userLon = searchParams.get("userLon");
    const radiusKm = parseFloat(searchParams.get("radiusKm") || "2");

    // Validate required parameters
    if (!userLat || !userLon) {
      return NextResponse.json(
        { error: "userLat and userLon are required" },
        { status: 400 }
      );
    }

    const lat = parseFloat(userLat);
    const lon = parseFloat(userLon);

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    if (isNaN(radiusKm) || radiusKm <= 0) {
      return NextResponse.json(
        { error: "Invalid radius" },
        { status: 400 }
      );
    }

    // Fetch all active shops (shopkeepers add stores, then add products)
    const allShops = await fetchAllShops();

    // Find nearby shops
    const nearbyShops = findNearbyVendors(
      allShops,
      { lat, lng: lon },
      radiusKm
    );

    // Check if it's peak hour
    const peakHour = isPeakHour();

    // Calculate ETA for each shop
    const shopsWithEta = await Promise.all(
      nearbyShops.map(async (shop) => {
        const shopId = shop._id;
        const coords = shop.address?.coordinates;

        // Get store-specific data (shopkeeper's store delivery profile)
        const storeProfile = await getStoreDeliveryProfile(shopId);
        const pendingOrders = await getCurrentPendingOrders(shopId);

        // Calculate ETA
        const eta = calculateEtaMinutes({
          storeProfile,
          distanceKm: shop.distanceKm,
          currentPendingOrders: pendingOrders,
          isPeakHour: peakHour,
        });

        // Return shop data with ETA
        return {
          id: String(shop._id), // Convert to string for consistent matching
          name: shop.name,
          distanceKm: Math.round(shop.distanceKm * 100) / 100, // Round to 2 decimals
          eta: {
            minEta: eta.minEta,
            maxEta: eta.maxEta,
          },
          location: coords
            ? {
                lat: coords.lat,
                lon: coords.lng,
              }
            : null,
          // Include other shop fields
          description: shop.description,
          logo_url: shop.logo_url,
          rating: shop.rating,
          total_orders: shop.total_orders,
          is_active: shop.is_active,
        };
      })
    );

    return NextResponse.json({
      vendors: shopsWithEta, // Keep "vendors" key for backward compatibility
      count: shopsWithEta.length,
      userLocation: { lat, lon },
      radiusKm,
      peakHour,
    });
  } catch (error) {
    console.error("Error fetching nearby shops:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

