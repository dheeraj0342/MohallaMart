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
    // First try with high accuracy
    const position = await getPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
    
    return {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
  } catch (error: any) {
    // If permission denied (code 1), do not retry
    if (error.code === 1) {
      throw error;
    }

    // If high accuracy fails (timeout or other error), try low accuracy
    console.warn("High accuracy geolocation failed, falling back to low accuracy", error);
    
    try {
      const position = await getPosition({
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      });

      return {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
}


