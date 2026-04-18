// src/utils/locations.ts

export const ANKARA_COORDINATES: Record<string, { x: number; y: number }> = {
  "CerModern": { x: 45, y: 40 },
  "Anıtkabir": { x: 35, y: 55 },
  "Kızılay": { x: 55, y: 50 },
  "Tunalı": { x: 60, y: 65 },
  "Bahçelievler": { x: 30, y: 60 },
  "Eymir": { x: 80, y: 90 },
  "Atakule": { x: 65, y: 80 },
  "Ulus": { x: 50, y: 25 },
};

// Bilinmeyen bir konum gelirse rastgele veya merkez bir nokta döndürür
export const getCoords = (locationName: string) => {
  return ANKARA_COORDINATES[locationName] || { x: 50, y: 50 };
};