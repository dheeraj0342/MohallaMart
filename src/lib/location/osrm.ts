export interface SnappedLocation {
  lat: number;
  lon: number;
  snapped: boolean;
}

export async function snapToRoad(lat: number, lon: number): Promise<SnappedLocation> {
  const url = `https://router.project-osrm.org/nearest/v1/driving/${lon},${lat}`;

  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    // Fallback to original coordinates if OSRM fails
    return { lat, lon, snapped: false };
  }

  const data = await res.json().catch(() => null);
  const waypoint = data?.waypoints?.[0];

  if (!waypoint || !Array.isArray(waypoint.location)) {
    return { lat, lon, snapped: false };
  }

  const [snappedLon, snappedLat] = waypoint.location as [number, number];

  return {
    lat: snappedLat,
    lon: snappedLon,
    snapped: true,
  };
}


