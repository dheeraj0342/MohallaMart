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
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      // Nominatim requires a valid User-Agent / Referer in production; adjust as needed
      "User-Agent": "MohallaMartLocationClient/1.0",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to reverse geocode location");
  }

  const data = await res.json();
  const address = data.address || {};

  return {
    addressText: data.display_name as string,
    road: address.road,
    suburb: address.suburb || address.neighbourhood,
    city: address.city || address.town || address.village,
    postcode: address.postcode,
    village: address.village,
    hamlet: address.hamlet,
    county: address.county,
    stateDistrict: address.state_district,
    state: address.state,
  };
}


