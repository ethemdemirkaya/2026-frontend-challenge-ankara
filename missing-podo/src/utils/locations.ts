// src/utils/locations.ts

export const ANKARA_COORDINATES: Record<string, [number, number]> = {
  // Landmarks
  "CerModern": [39.93159, 32.84967],       // exact from API
  "Anıtkabir": [39.9250, 32.8369],
  "Kızılay": [39.9208, 32.8541],
  "Tunalı": [39.9056, 32.8606],
  "Bahçelievler": [39.9197, 32.8252],
  "Eymir": [39.8315, 32.8255],
  "Atakule": [39.88645, 32.85558],         // exact from API
  "Ulus": [39.9419, 32.8544],
  "Cebeci": [39.9329, 32.8732],
  "Dikmen": [39.8789, 32.8378],
  "Bilkent": [39.8744, 32.7486],
  "GOP": [39.8973, 32.8687],
  "Ayrancı": [39.8953, 32.8587],

  // API data specific locations (from Jotform submissions)
  "Tunalı Hilmi Caddesi": [39.90584, 32.86089],
  "Kuğulu Park": [39.90194, 32.86028],
  "Seğmenler Parkı": [39.89333, 32.86353],
  "Hamamönü": [39.93335, 32.86514],
  "Ankara Kalesi": [39.94142, 32.86549],

  // Districts
  "Çankaya": [39.9208, 32.8541],
  "Keçiören": [39.9830, 32.8647],
  "Yenimahalle": [39.9610, 32.8021],
  "Mamak": [39.9348, 32.8943],
  "Etimesgut": [39.9515, 32.6685],
  "Sincan": [39.9620, 32.5765],
  "Gölbaşı": [39.7946, 32.8055],
  "Altındağ": [39.9416, 32.8596],
  "Pursaklar": [40.0384, 32.9022],
  "Çubuk": [40.2312, 33.0336],
  "Kızılcahamam": [40.4682, 32.6517],
  "Polatlı": [39.5815, 32.1465],
  "Kazan": [40.2005, 32.6841],
  "Kahramankazan": [40.2005, 32.6841],
  "Çamlıdere": [40.4907, 32.4746],
  "Beypazarı": [40.1691, 31.9213],
  "Bala": [39.5539, 33.1234],
  "Ayaş": [40.0152, 32.3328],
  "Şereflikoçhisar": [38.9392, 33.5385]
};

const FALLBACK: [number, number] = [39.9208, 32.8541];

// Parse a raw "lat,lng" string (as returned by the Jotform API coordinates field)
export const parseCoordsString = (coordsStr: string): [number, number] | null => {
  if (!coordsStr) return null;
  const parts = coordsStr.split(',');
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  if (!isNaN(lat) && !isNaN(lng) && lat > 38 && lat < 42 && lng > 30 && lng < 35) {
    return [lat, lng];
  }
  return null;
};

/**
 * Gets coordinates for a TimelineEvent.
 * Priority:
 *   1. API 'coordinates' field (most accurate — from Jotform submission)
 *   2. Text-based location name lookup
 *   3. Fallback to Kızılay center
 */
export const getCoordsFromEvent = (location?: string, coordinates?: string): [number, number] => {
  if (coordinates) {
    const parsed = parseCoordsString(coordinates);
    if (parsed) return parsed;
  }
  if (location) return getCoords(location);
  return FALLBACK;
};

// Fallback: text-based coordinate lookup by location name
export const getCoords = (locationStr: string): [number, number] => {
  if (!locationStr) return FALLBACK;

  // 1. Direct Exact Match
  if (ANKARA_COORDINATES[locationStr]) return ANKARA_COORDINATES[locationStr];

  // 2. Substring Match (e.g. "Keçiören, Ankara", "Sincan Merkez")
  const lowerStr = locationStr.toLowerCase();
  for (const [key, coords] of Object.entries(ANKARA_COORDINATES)) {
    if (lowerStr.includes(key.toLowerCase())) {
      return coords;
    }
  }

  // 3. Raw Lat,Lng string parsing as last resort
  const parsed = parseCoordsString(locationStr);
  if (parsed) return parsed;

  return FALLBACK;
};

/**
 * Calculates the great-circle distance between two points on the Earth
 * (Haversine formula) in kilometers.
 */
export const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
  const R = 6371; // Earth radius in km
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};