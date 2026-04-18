export interface RegionDef {
  id: string;
  name: string;
  color: string;
  coordinates: [number, number][];
}

// Ankara'nın bazı ilçeleri için basitleştirilmiş poligon koordinatları (Lat, Lng)
export const ANKARA_REGIONS: RegionDef[] = [
  {
    id: "cankaya",
    name: "Çankaya Bölgesi",
    color: "#3b82f6", // Blue
    coordinates: [
      [39.930, 32.820],
      [39.930, 32.880],
      [39.850, 32.880],
      [39.850, 32.820],
    ]
  },
  {
    id: "yenimahalle",
    name: "Yenimahalle Bölgesi",
    color: "#eab308", // Yellow
    coordinates: [
      [39.980, 32.740],
      [39.980, 32.820],
      [39.920, 32.820],
      [39.920, 32.740],
    ]
  },
  {
    id: "altindag",
    name: "Altındağ Bölgesi",
    color: "#ef4444", // Red
    coordinates: [
      [39.980, 32.820],
      [39.980, 32.920],
      [39.930, 32.920],
      [39.930, 32.820],
    ]
  },
  {
    id: "mamak",
    name: "Mamak Bölgesi",
    color: "#8b5cf6", // Purple
    coordinates: [
      [39.930, 32.880],
      [39.930, 32.960],
      [39.880, 32.960],
      [39.880, 32.880],
    ]
  }
];

// Belirlenen bir noktanın polygon içinde olup olmadığını test eden fonksiyon (Ray-casting)
export const isPointInPolygon = (point: [number, number], polygon: [number, number][]) => {
  let [lat, lng] = point;
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let [xi, yi] = polygon[i];
    let [xj, yj] = polygon[j];
    
    let intersect = ((yi > lng) !== (yj > lng)) &&
        (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
};
