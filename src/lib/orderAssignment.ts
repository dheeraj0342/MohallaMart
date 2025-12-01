/**
 * Order Assignment Algorithm (Blinkit-style)
 * Assigns delivery riders to orders based on proximity, availability, and workload
 */

import { haversineDistanceKm } from "./distance";

/**
 * Rider information for assignment
 */
export interface Rider {
  id: string;
  name: string;
  phone: string;
  currentLocation: {
    lat: number;
    lon: number;
  };
  isOnline: boolean;
  isBusy: boolean;
  assignedOrderId?: string;
  updatedAt: number;
}

/**
 * Order information for assignment
 */
export interface Order {
  id: string;
  shopId: string;
  vendorLocation: {
    lat: number;
    lng: number;
  };
  deliveryAddress: {
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * Vendor location
 */
export interface VendorLocation {
  lat: number;
  lng: number;
}

/**
 * Assignment result
 */
export interface AssignmentResult {
  riderId: string;
  riderName: string;
  distanceToVendor: number;
  estimatedPickupTime: number; // minutes
}

/**
 * Assign a rider to an order
 * 
 * Algorithm:
 * 1. Filter riders: isOnline=true, isBusy=false, distance to vendor ≤ 3km
 * 2. Sort by: closest to vendor, fastest speed, lowest workload
 * 3. Assign best rider
 * 
 * @param order - Order to assign
 * @param riders - Available riders
 * @param vendorLocation - Vendor/shop location
 * @returns Assignment result or null if no rider available
 */
export function assignRider(
  order: Order,
  riders: Rider[],
  vendorLocation: VendorLocation,
): AssignmentResult | null {
  // Step 1: Filter eligible riders
  const eligibleRiders = riders.filter((rider) => {
    // Must be online and not busy
    if (!rider.isOnline || rider.isBusy) {
      return false;
    }

    // Calculate distance to vendor
    const distanceToVendor = haversineDistanceKm(
      rider.currentLocation.lat,
      rider.currentLocation.lon,
      vendorLocation.lat,
      vendorLocation.lng,
    );

    // Must be within 3km of vendor
    if (distanceToVendor > 3) {
      return false;
    }

    return true;
  });

  if (eligibleRiders.length === 0) {
    return null;
  }

  // Step 2: Sort by priority
  // Priority: closest to vendor first, then by update time (most recent = less busy)
  eligibleRiders.sort((a, b) => {
    const distA = haversineDistanceKm(
      a.currentLocation.lat,
      a.currentLocation.lon,
      vendorLocation.lat,
      vendorLocation.lng,
    );
    const distB = haversineDistanceKm(
      b.currentLocation.lat,
      b.currentLocation.lon,
      vendorLocation.lat,
      vendorLocation.lng,
    );

    // Primary sort: distance (closest first)
    if (Math.abs(distA - distB) > 0.1) {
      return distA - distB;
    }

    // Secondary sort: most recently updated (less busy)
    return b.updatedAt - a.updatedAt;
  });

  // Step 3: Assign best rider
  const assignedRider = eligibleRiders[0];
  const distanceToVendor = haversineDistanceKm(
    assignedRider.currentLocation.lat,
    assignedRider.currentLocation.lon,
    vendorLocation.lat,
    vendorLocation.lng,
  );

  // Estimate pickup time: distance / average speed (20 kmph) * 60 minutes
  const estimatedPickupTime = Math.round((distanceToVendor / 20) * 60);

  return {
    riderId: assignedRider.id,
    riderName: assignedRider.name,
    distanceToVendor: Math.round(distanceToVendor * 100) / 100, // Round to 2 decimals
    estimatedPickupTime,
  };
}

/**
 * Get rider workload (number of assigned orders)
 * TODO: Implement actual workload calculation from database
 */
export function getRiderWorkload(riderId: string, orders: Order[]): number {
  // Count orders assigned to this rider
  return orders.filter((order) => order.id === riderId).length;
}

