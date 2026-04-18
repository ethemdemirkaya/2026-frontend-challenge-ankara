// src/utils/locations.ts

export const ANKARA_COORDINATES: Record<string, [number, number]> = {
  "CerModern": [39.9282, 32.8464],
  "Anıtkabir": [39.9250, 32.8369],
  "Kızılay": [39.9208, 32.8541],
  "Tunalı": [39.9056, 32.8606],
  "Bahçelievler": [39.9197, 32.8252],
  "Eymir": [39.8315, 32.8255],
  "Atakule": [39.8872, 32.8569],
  "Ulus": [39.9419, 32.8544],
};

// Bilinmeyen bir konum gelirse Kızılay merkezi döndürür
export const getCoords = (locationName: string): [number, number] => {
  return ANKARA_COORDINATES[locationName] || [39.9208, 32.8541];
};