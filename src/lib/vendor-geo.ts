/**
 * Shop geographic utilities
 * Find nearby shops (added by shopkeepers) based on user location and radius
 * 
 * Note: Shopkeepers add their stores and then add products to those stores
 */

import { haversineDistanceKm } from "./distance";

/**
 * Shop with coordinates (shopkeeper's store)
 */
export interface VendorWithCoords {
  _id: string;
  name: string;
  address: {
    coordinates?: {
      lat: number;
      lng: number;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * User coordinates
 */
export interface UserCoordinates {
  lat: number;
  lng: number;
}

/**
 * Shop with calculated distance
 */
export interface VendorWithDistance extends VendorWithCoords {
  distanceKm: number;
}

/**
 * Find nearby shops within a specified radius
 * 
 * @param shops - Array of shops (added by shopkeepers) with coordinates
 * @param userCoords - User's current coordinates
 * @param radiusKm - Search radius in kilometers (default: 2km)
 * @returns Array of shops within radius, sorted by distance (closest first)
 * 
 * Note: Shopkeepers add stores, and these stores are what we search for
 */
export function findNearbyVendors(
  shops: VendorWithCoords[],
  userCoords: UserCoordinates,
  radiusKm: number = 2,
): VendorWithDistance[] {
  const nearby: VendorWithDistance[] = [];

  for (const shop of shops) {
    const coords = shop.address?.coordinates;
    
    // Skip shops without coordinates
    if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number") {
      continue;
    }

    // Calculate distance
    const distanceKm = haversineDistanceKm(
      userCoords.lat,
      userCoords.lng,
      coords.lat,
      coords.lng,
    );

    // Only include shops within radius
    if (distanceKm <= radiusKm) {
      nearby.push({
        ...shop,
        distanceKm,
      });
    }
  }

  // Sort by distance (closest first)
  nearby.sort((a, b) => a.distanceKm - b.distanceKm);

  return nearby;
}

