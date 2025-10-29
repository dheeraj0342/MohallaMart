// Google Maps configuration and utilities
export interface GoogleMapsConfig {
  apiKey: string;
  libraries: string[];
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: Location;
  };
  types: string[];
  vicinity?: string;
}

export interface GeocodingResult {
  results: Array<{
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    formatted_address: string;
    geometry: {
      location: Location;
      location_type: string;
      viewport: {
        northeast: Location;
        southwest: Location;
      };
    };
    place_id: string;
    types: string[];
  }>;
  status: string;
}

class GoogleMapsService {
  private config: GoogleMapsConfig;
  private baseUrl = "https://maps.googleapis.com/maps/api";

  constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      libraries: ["places", "geometry"],
    };

    if (!this.config.apiKey) {
      console.warn(
        "Google Maps API key is not set. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.",
      );
    }
  }

  // Geocode an address to get coordinates
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    if (!this.config.apiKey) {
      throw new Error("Google Maps API key is not configured");
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `${this.baseUrl}/geocode/json?address=${encodedAddress}&key=${this.config.apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Google Maps API error: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error geocoding address:", error);
      throw error;
    }
  }

  // Reverse geocode coordinates to get address
  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
    if (!this.config.apiKey) {
      throw new Error("Google Maps API key is not configured");
    }

    const url = `${this.baseUrl}/geocode/json?latlng=${lat},${lng}&key=${this.config.apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Google Maps API error: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      throw error;
    }
  }

  // Get place details by place ID
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    if (!this.config.apiKey) {
      throw new Error("Google Maps API key is not configured");
    }

    const url = `${this.baseUrl}/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,geometry,types,vicinity&key=${this.config.apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Google Maps API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error getting place details:", error);
      throw error;
    }
  }

  // Calculate distance between two points
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) *
        Math.cos(this.toRadians(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  // Convert degrees to radians
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get client configuration for frontend
  getClientConfig() {
    return {
      apiKey: this.config.apiKey,
      libraries: this.config.libraries,
      region: "IN",
      language: "en",
    };
  }

  // Check if location is within delivery radius
  isWithinDeliveryRadius(
    shopLocation: Location,
    customerLocation: Location,
    maxRadiusKm: number,
  ): boolean {
    const distance = this.calculateDistance(shopLocation, customerLocation);
    return distance <= maxRadiusKm;
  }

  // Get delivery time estimate
  getDeliveryTimeEstimate(distanceKm: number): number {
    // Base delivery time: 30 minutes
    // Additional time: 5 minutes per km
    const baseTime = 30;
    const additionalTime = distanceKm * 5;
    return Math.max(baseTime, baseTime + additionalTime);
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();

// Types are already exported as interfaces above
