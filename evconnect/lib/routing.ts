import { RouteData } from "./types";

/* ═══════════════════════════════════════════════════════════
   Routing Service — OpenRouteService + Mapbox Geocoding
   ═══════════════════════════════════════════════════════════ */

/**
 * Get driving route from OpenRouteService
 */
export async function getRoute(
  startCoords: [number, number],
  endCoords: [number, number]
): Promise<RouteData> {
  const API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;

  if (!API_KEY) {
    // Fallback: create a simple straight-line route for demo
    return createFallbackRoute(startCoords, endCoords);
  }

  try {
    const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [startCoords, endCoords],
      }),
    });

    if (!response.ok) {
      console.warn("ORS API error, using fallback route");
      return createFallbackRoute(startCoords, endCoords);
    }

    const data = await response.json();
    const feature = data.features[0];
    const props = feature.properties.summary;
    const coords = feature.geometry.coordinates as [number, number][];

    return {
      distanceKm: props.distance / 1000,
      durationMinutes: props.duration / 60,
      geometry: JSON.stringify(feature.geometry),
      coordinates: coords,
      startCoords,
      endCoords,
    };
  } catch (error) {
    console.error("Route fetch error:", error);
    return createFallbackRoute(startCoords, endCoords);
  }
}

/**
 * Geocode address to coordinates using Mapbox
 */
export async function geocodeAddress(
  address: string
): Promise<[number, number] | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    // Fallback geocoding for known Indian locations
    return fallbackGeocode(address);
  }

  try {
    const encoded = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&country=IN&limit=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return [lng, lat];
    }

    return fallbackGeocode(address);
  } catch (error) {
    console.error("Geocode error:", error);
    return fallbackGeocode(address);
  }
}

/**
 * Get geocoding suggestions for autocomplete
 */
export async function geocodeSuggestions(
  query: string
): Promise<Array<{ place: string; coords: [number, number] }>> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token || query.length < 3) return [];

  try {
    const encoded = encodeURIComponent(query);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&country=IN&limit=5&types=place,locality,neighborhood,address`;

    const response = await fetch(url);
    const data = await response.json();

    return (data.features || []).map(
      (f: { place_name: string; center: [number, number] }) => ({
        place: f.place_name,
        coords: f.center as [number, number],
      })
    );
  } catch {
    return [];
  }
}

/* ─── Fallback utilities for demo mode ─────────────────── */

function createFallbackRoute(
  start: [number, number],
  end: [number, number]
): RouteData {
  // Calculate straight-line distance (Haversine)
  const R = 6371;
  const dLat = ((end[1] - start[1]) * Math.PI) / 180;
  const dLon = ((end[0] - start[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((start[1] * Math.PI) / 180) *
      Math.cos((end[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Create interpolated path
  const numPoints = 20;
  const coords: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    coords.push([
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
    ]);
  }

  return {
    distanceKm: distance * 1.3, // Add 30% for real road distance
    durationMinutes: (distance * 1.3) / 40 * 60, // Assume 40 km/h avg
    geometry: JSON.stringify({
      type: "LineString",
      coordinates: coords,
    }),
    coordinates: coords,
    startCoords: start,
    endCoords: end,
  };
}

const KNOWN_LOCATIONS: Record<string, [number, number]> = {
  koramangala: [77.6245, 12.9352],
  indiranagar: [77.6408, 12.9784],
  "hsr layout": [77.6389, 12.9116],
  whitefield: [77.7499, 12.9698],
  "jp nagar": [77.5857, 12.9063],
  marathahalli: [77.7009, 12.9565],
  jayanagar: [77.5838, 12.925],
  "electronic city": [77.6593, 12.851],
  bangalore: [77.5946, 12.9716],
  bengaluru: [77.5946, 12.9716],
  mumbai: [72.8777, 19.076],
  delhi: [77.2167, 28.6139],
  chennai: [80.2707, 13.0827],
  hyderabad: [78.4867, 17.385],
  bandra: [72.8295, 19.0596],
  andheri: [72.8697, 19.1136],
  powai: [72.906, 19.1176],
  "connaught place": [77.2167, 28.6315],
  "vasant kunj": [77.1535, 28.5244],
  dwarka: [77.0462, 28.5921],
  noida: [77.391, 28.5355],
};

function fallbackGeocode(address: string): [number, number] | null {
  const lower = address.toLowerCase().trim();

  for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
    if (lower.includes(key)) {
      return coords;
    }
  }

  // Default to Bangalore center
  if (lower.includes("bangalore") || lower.includes("bengaluru")) {
    return [77.5946, 12.9716];
  }

  return null;
}
