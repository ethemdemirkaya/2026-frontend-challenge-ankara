import ankaraGeoJsonStr from '../datas/ankara.geojson?raw';

export const ANKARA_GEOJSON = JSON.parse(ankaraGeoJsonStr);

export interface RegionDef {
  id: string;
  name: string;
  feature: any;
}

export const getAnkaraRegions = (): RegionDef[] => {
  const data: any = ANKARA_GEOJSON;
  if (!data?.features) return [];
  return data.features.map((f: any) => ({
    id: String(f.properties?.name || f.properties?.IlAdi1 || f.properties?.osm_id || Math.random()).toLowerCase().replace(/\s+/g, '-').replace(/ı/g, 'i').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g'),
    name: String(f.properties?.name || f.properties?.IlAdi1 || 'Bilinmeyen Bölge'),
    feature: f
  }));
};

export const isPointInGeoJsonPolygon = (point: [number, number], geometry: any) => {
  const [lat, lng] = point;
  
  const checkPolygon = (rings: number[][][]) => {
     const outerRing = rings[0];
     let isInside = false;
     for (let i = 0, j = outerRing.length - 1; i < outerRing.length; j = i++) {
        // GeoJSON coordinate format is [longitude, latitude]
        let [xi, yi] = outerRing[i]; // xi = lng, yi = lat
        let [xj, yj] = outerRing[j];
        
        let intersect = ((yi > lat) !== (yj > lat)) &&
           (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
     }
     return isInside;
  };

  if (geometry.type === 'Polygon') {
      return checkPolygon(geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates) {
          if (checkPolygon(polygon)) return true;
      }
  }
  return false;
};
