export interface SnappedLocation {
  lat: number;
  lon: number;
  snapped: boolean;
}

export async function snapToRoad(lat: number, lon: number): Promise<SnappedLocation> {
  if (!isValidCoordinates(lat, lon)) {
    return { lat, lon, snapped: false };
  }

  const url = `https://router.project-osrm.org/nearest/v1/driving/${lon.toFixed(6)},${lat.toFixed(6)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { lat, lon, snapped: false };
    }

    const data = await res.json();
    
    if (!data || typeof data !== "object") {
      return { lat, lon, snapped: false };
    }

    const waypoint = data.waypoints?.[0];

    if (!waypoint || !Array.isArray(waypoint.location) || waypoint.location.length !== 2) {
      return { lat, lon, snapped: false };
    }

    const [snappedLon, snappedLat] = waypoint.location as [number, number];

    if (!isValidCoordinates(snappedLat, snappedLon)) {
      return { lat, lon, snapped: false };
    }

    return {
      lat: snappedLat,
      lon: snappedLon,
      snapped: true,
    };
  } catch (error: any) {
    return { lat, lon, snapped: false };
  }
}

function isValidCoordinates(lat: number, lon: number): boolean {
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




