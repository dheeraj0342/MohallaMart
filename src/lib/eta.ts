/**
 * ETA (Estimated Time of Arrival) calculation for delivery
 * Blinkit-style delivery time estimation
 */

/**
 * Store delivery profile configuration
 */
export interface StoreDeliveryProfile {
  /** Base preparation time in minutes (packing, picking) */
  basePrepMinutes: number;
  /** Maximum number of orders that can be prepared in parallel */
  maxParallelOrders: number;
  /** Buffer time in minutes to account for delays */
  bufferMinutes: number;
  /** Average rider speed in kilometers per hour */
  avgRiderSpeedKmph: number;
}

/**
 * Input parameters for ETA calculation
 */
export interface EtaInput {
  /** Store delivery profile configuration */
  storeProfile: StoreDeliveryProfile;
  /** Distance from store to customer in kilometers */
  distanceKm: number;
  /** Current number of pending orders at the store */
  currentPendingOrders: number;
  /** Whether it's currently peak hour */
  isPeakHour: boolean;
}

/**
 * ETA calculation result
 */
export interface EtaResult {
  /** Raw calculated ETA in minutes (before rounding) */
  rawEta: number;
  /** Minimum ETA in minutes (rounded, with safety margin) */
  minEta: number;
  /** Maximum ETA in minutes (rounded, with safety margin) */
  maxEta: number;
}

/**
 * Calculate delivery ETA based on store profile, distance, and current conditions
 * 
 * Formula:
 * 1. Prep time = basePrepMinutes + (excess orders * 2 minutes)
 * 2. Travel time = (distance / speed) * 60 minutes
 * 3. Apply peak hour multiplier (1.25x) if applicable
 * 4. Add buffer time
 * 5. Calculate safe range (min/max)
 * 
 * @param input - ETA calculation input parameters
 * @returns ETA result with raw, min, and max values
 */
export function calculateEtaMinutes(input: EtaInput): EtaResult {
  const {
    storeProfile,
    distanceKm,
    currentPendingOrders,
    isPeakHour,
  } = input;

  // 1. Calculate preparation/packing time
  const excessOrders = Math.max(0, currentPendingOrders - storeProfile.maxParallelOrders);
  const prepTime = storeProfile.basePrepMinutes + excessOrders * 2;

  // 2. Calculate travel time (convert km to minutes)
  let travelTime = (distanceKm / storeProfile.avgRiderSpeedKmph) * 60;

  // 3. Apply peak hour multiplier
  if (isPeakHour) {
    travelTime *= 1.25;
  }

  // 4. Calculate raw ETA
  const rawEta = prepTime + travelTime + storeProfile.bufferMinutes;

  // 5. Calculate safe range (min/max)
  const minEta = Math.max(5, Math.round(rawEta - 5));
  const maxEta = Math.round(rawEta + 5);

  return {
    rawEta,
    minEta,
    maxEta,
  };
}

/**
 * Default store delivery profile
 * Can be customized per store or use as fallback
 */
export const DEFAULT_STORE_PROFILE: StoreDeliveryProfile = {
  basePrepMinutes: 5,
  maxParallelOrders: 3,
  bufferMinutes: 5,
  avgRiderSpeedKmph: 20, // Average delivery rider speed in urban areas
};

