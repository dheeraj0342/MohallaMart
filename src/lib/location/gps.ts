"use client";

export interface HighAccuracyLocation {
  lat: number;
  lon: number;
  accuracy: number;
}

export async function getHighAccuracyGPS(): Promise<HighAccuracyLocation> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    throw new Error("Geolocation is not available in this environment");
  }

  const getPosition = (options: PositionOptions): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  try {
    const position = await getPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
    
    const accuracy = Math.max(1, position.coords.accuracy || 50);
    
    return {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      accuracy,
    };
  } catch (error: any) {
    if (error?.code === 1) {
      throw new Error("Geolocation permission denied");
    }

    try {
      const position = await getPosition({
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      });

      const accuracy = Math.max(1, position.coords.accuracy || 100);

      return {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy,
      };
    } catch (fallbackError: any) {
      throw new Error(
        `Geolocation failed: ${fallbackError?.message || "Unknown error"}`
      );
    }
  }
}

export function isValidCoordinates(lat: number, lon: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}



