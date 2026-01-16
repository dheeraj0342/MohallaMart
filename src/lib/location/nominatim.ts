export interface ReverseGeocodeResult {
  addressText: string;
  road?: string;
  suburb?: string;
  city?: string;
  postcode?: string;
  village?: string;
  hamlet?: string;
  county?: string;
  stateDistrict?: string;
  state?: string;
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<ReverseGeocodeResult> {
  if (!isValidCoordinates(lat, lon)) {
    throw new Error("Invalid coordinates provided");
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "MohallaMartLocationClient/1.0",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to reverse geocode location`);
    }

    const data = await res.json();
    
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format from geocoding service");
    }

    const address = data.address || {};

    return {
      addressText: String(data.display_name || "Unknown location"),
      road: address.road ? String(address.road) : undefined,
      suburb: address.suburb || address.neighbourhood || address.residential || address.quarter || address.city_district ? String(address.suburb || address.neighbourhood || address.residential || address.quarter || address.city_district) : undefined,
      city: address.city || address.town || address.village ? String(address.city || address.town || address.village) : undefined,
      postcode: address.postcode ? String(address.postcode) : undefined,
      village: address.village ? String(address.village) : undefined,
      hamlet: address.hamlet ? String(address.hamlet) : undefined,
      county: address.county ? String(address.county) : undefined,
      stateDistrict: address.state_district ? String(address.state_district) : undefined,
      state: address.state ? String(address.state) : undefined,
    };
  } catch (error: any) {
    throw new Error(
      `Reverse geocoding failed: ${error?.message || "Unknown error"}`
    );
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



