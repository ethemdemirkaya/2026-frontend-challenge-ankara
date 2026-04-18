// src/utils/locations.ts

export const ANKARA_COORDINATES: Record<string, [number, number]> = {
  // Landmarks
  "CerModern": [39.9282, 32.8464],
  "Anıtkabir": [39.9250, 32.8369],
  "Kızılay": [39.9208, 32.8541],
  "Tunalı": [39.9056, 32.8606],
  "Bahçelievler": [39.9197, 32.8252],
  "Eymir": [39.8315, 32.8255],
  "Atakule": [39.8872, 32.8569],
  "Ulus": [39.9419, 32.8544],
  "Cebeci": [39.9329, 32.8732],
  "Dikmen": [39.8789, 32.8378],
  "Bilkent": [39.8744, 32.7486],
  "GOP": [39.8973, 32.8687],
  "Ayrancı": [39.8953, 32.8587],

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

// Bilinmeyen bir konum gelirse akıllı çözümleme yapar, başarısız olursa Kızılay merkezi döndürür
export const getCoords = (locationStr: string): [number, number] => {
  if (!locationStr) return [39.9208, 32.8541];

  // 1. Direct Exact Match
  if (ANKARA_COORDINATES[locationStr]) return ANKARA_COORDINATES[locationStr];

  // 2. Substring Match (e.g. "Keçiören, Ankara", "Sincan Merkez")
  const lowerStr = locationStr.toLowerCase();
  for (const [key, coords] of Object.entries(ANKARA_COORDINATES)) {
    if (lowerStr.includes(key.toLowerCase())) {
      return coords;
    }
  }

  // 3. Raw Lat,Lng string parsing
  if (locationStr.includes(',')) {
    const parts = locationStr.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      // Validate coordinates range in Ankara bounds roughly
      if (!isNaN(lat) && !isNaN(lng) && lat > 38 && lat < 41 && lng > 31 && lng < 34) {
        return [lat, lng];
      }
    }
  }

  return [39.9208, 32.8541];
};