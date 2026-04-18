import { type TimelineEvent } from "../utils/investigation";
import { getCoordsFromEvent } from "../utils/locations";
import { getAnkaraRegions } from "../utils/regions";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, GeoJSON, Polyline, useMap, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Color-coded pin icons by role — dark, high-contrast colors
const createPinIcon = (role: 'podo' | 'related' | 'other', isHovered: boolean = false) => {
  // Color hex values (dark mode safe, visible on any map tile)
  const colorMap = {
    podo:    { base: '#dc2626', glow: 'rgba(220,38,38,0.7)' },  // deep red
    related: { base: '#b45309', glow: 'rgba(180,83,9,0.6)' },   // deep amber/brown
    other:   { base: '#334155', glow: 'rgba(51,65,85,0.5)' },   // dark slate
  };
  const col = colorMap[role];
  const hoverScale = isHovered ? 'transform: scale(1.8) translateY(-6px);' : '';
  const glowFilter = isHovered ? `filter: drop-shadow(0 0 8px ${col.glow});` : '';
  return new L.DivIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${col.base}" style="width:32px;height:32px;margin-left:-12px;margin-top:-28px;transition:all 0.25s;${hoverScale}${glowFilter}"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>`,
    className: `custom-leaflet-icon ${isHovered ? 'z-[1000]' : ''}`,
    iconAnchor: [12, 28],
  });
};

const MapScrollControls = () => {
  const map = useMapEvents({});
  const [showCtrlMsg, setShowCtrlMsg] = useState(false);

  useEffect(() => {
    map.scrollWheelZoom.disable();
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        map.scrollWheelZoom.enable();
        setShowCtrlMsg(false);
      } else {
        map.scrollWheelZoom.disable();
        setShowCtrlMsg(true);
        setTimeout(() => setShowCtrlMsg(false), 2000);
      }
    };
    const container = map.getContainer();
    container.addEventListener("wheel", handleWheel, { passive: true });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [map]);

  return showCtrlMsg ? (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-neutral/80 text-white px-4 py-2 rounded-full text-xs animate-fade-in backdrop-blur shadow-xl pointer-events-none">
      Yakınlaştırmak için CTRL tuşuna basılı tutarak kaydırın.
    </div>
  ) : null;
};

// Auto-fits map bounds to the visible pins whenever events change
const FitBounds = ({ coords }: { coords: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length === 0) return;
    if (coords.length === 1) {
      map.setView(coords[0], 14, { animate: true });
    } else {
      const bounds = L.latLngBounds(coords.map(c => L.latLng(c[0], c[1])));
      map.fitBounds(bounds, { padding: [60, 60], animate: true, maxZoom: 15 });
    }
  }, [JSON.stringify(coords)]);
  return null;
};

// Legend overlay for pin types
const MapLegend = () => (
  <div className="absolute bottom-4 right-4 z-[500] bg-base-100/90 backdrop-blur-md rounded-xl p-3 shadow-xl border border-base-content/10 text-xs space-y-1.5 pointer-events-none">
    <p className="font-bold uppercase tracking-widest opacity-50 text-[9px] mb-2">Pin Açıklaması</p>
    <div className="flex items-center gap-2">
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#dc2626">
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
      <span>Podo (Kayıp Şahıs)</span>
    </div>
    <div className="flex items-center gap-2">
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#b45309">
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
      <span>Podo ile İlgili Şahıs</span>
    </div>
    <div className="flex items-center gap-2">
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#334155">
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
      <span>Diğer İstihbarat Kaydı</span>
    </div>
    <div className="flex items-center gap-2 mt-1 border-t border-base-content/10 pt-1.5">
      <div className="w-8 border-t-2 border-dashed border-error shrink-0"></div>
      <span>Podo'nun Rotası</span>
    </div>
  </div>
);

export const MapView = ({ 
  events, onPinClick, hoveredEventId, showRegions, selectedRegionId, onRegionClick 
}: { 
  events: TimelineEvent[], onPinClick?: (event: TimelineEvent) => void,
  hoveredEventId?: string | null, showRegions?: boolean,
  selectedRegionId?: string | null, onRegionClick?: (id: string | null) => void 
}) => {
  const centerPosition: [number, number] = [39.9208, 32.8541];

  // Collect valid coords for bounds fitting
  const allValidCoords: [number, number][] = events
    .filter(e => e.location || e.coordinates)
    .map(e => getCoordsFromEvent(e.location, e.coordinates));

  // Build route: ALL events sorted chronologically
  const sortedForRoute = [...events]
    .filter(e => e.location || e.coordinates)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const routeCoords: [number, number][] = sortedForRoute.map(e =>
    getCoordsFromEvent(e.location, e.coordinates)
  );

  return (
    <div className="relative w-full aspect-video border border-base-content/10 overflow-hidden rounded-2xl shadow-inner z-0">
      <MapContainer center={centerPosition} zoom={10} className="w-full h-full" scrollWheelZoom={false}>
        <MapScrollControls />
        <FitBounds coords={allValidCoords} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* District regions with visible name labels */}
        {showRegions && getAnkaraRegions().map(region => {
          const isSelected = selectedRegionId === region.id;
          return (
            <GeoJSON
              key={`${region.id}-${isSelected ? 'selected' : 'unselected'}`}
              data={region.feature}
              style={{
                color: isSelected ? "#ff3e00" : "#3b82f6",
                fillColor: isSelected ? "#ff3e00" : "#3b82f6",
                fillOpacity: isSelected ? 0.25 : 0.04,
                weight: isSelected ? 2.5 : 1
              }}
              eventHandlers={{
                click: () => onRegionClick && onRegionClick(isSelected ? null : region.id)
              }}
              onEachFeature={(_feature: any, layer: any) => {
                // Show district name as a permanent tooltip on the polygon
                if (layer.bindTooltip) {
                  layer.bindTooltip(region.name, {
                    permanent: true,
                    direction: 'center',
                    className: 'region-label',
                    opacity: 0.85,
                  });
                }
              }}
            >
            </GeoJSON>
          );
        })}

        {/* Route polyline — full chronological path */}
        {routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#ef4444',
              weight: 3,
              dashArray: '10, 12',
              dashOffset: '0',
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Event pins */}
        {events.map((event, index) => {
          if (!event.location && !event.coordinates) return null;
          const [lat, lng] = getCoordsFromEvent(event.location, event.coordinates);

          // Small jitter to separate overlapping pins at same location
          const latJitter = (index % 5) * 0.003 - 0.006;
          const lngJitter = ((index * 7) % 5) * 0.003 - 0.006;

          const isPodo = event.primaryPerson === 'podo';
          const isRelated = event.relatedPerson === 'podo' || event.primaryPerson !== 'podo' && (event.relatedPerson?.length ?? 0) > 0;
          const role: 'podo' | 'related' | 'other' = isPodo ? 'podo' : (event.relatedPerson === 'podo' ? 'related' : 'other');
          const isHovered = hoveredEventId === event.id;

          return (
            <Marker
              key={event.id}
              position={[lat + latJitter, lng + lngJitter]}
              icon={createPinIcon(role, isHovered)}
            >
              <Popup className="font-sans min-w-[220px]">
                <div className="text-[11px]">
                  <span className="block text-primary font-bold mb-1 text-sm">{event.displayTime}</span>
                  <span className="block font-bold uppercase tracking-widest mb-1">{event.location}</span>
                  <span className="block opacity-60 capitalize mb-1">Tür: {event.type}</span>
                  {event.content && <span className="block italic opacity-80 border-l-2 border-primary/40 pl-2">"{event.content}"</span>}
                  {onPinClick && (
                    <button className="btn btn-xs mt-2 w-full btn-primary" onClick={() => onPinClick(event)}>Şüpheliyi İncele</button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend overlay — bottom right */}
      <MapLegend />
    </div>
  );
};