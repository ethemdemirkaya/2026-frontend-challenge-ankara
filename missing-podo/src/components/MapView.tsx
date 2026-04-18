import { type TimelineEvent } from "../utils/investigation";
import { getCoords } from "../utils/locations";
import { ANKARA_GEOJSON, getAnkaraRegions } from "../utils/regions";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, GeoJSON, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Create a custom icon for pins, since Leaflet's default marker can have path issues in React
const createPinIcon = (isTarget: boolean, isHovered: boolean = false) => new L.DivIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 drop-shadow-md transition-all duration-300 ${isHovered ? 'scale-[1.7] -translate-y-4 text-error drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]' : (isTarget ? 'text-primary hover:scale-125 hover:-translate-y-2' : 'text-neutral hover:scale-125 hover:-translate-y-2')}" style="margin-left: -12px; margin-top: -24px;"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>`,
  className: `custom-leaflet-icon ${isHovered ? 'z-[1000]' : ''}`,
});

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
    
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [map]);

  return showCtrlMsg ? (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-neutral/80 text-white px-4 py-2 rounded-full text-xs animate-fade-in backdrop-blur shadow-xl pointer-events-none">
      Yakınlaştırmak için CTRL tuşuna basılı tutarak kaydırın.
    </div>
  ) : null;
};

export const MapView = ({ 
  events, onPinClick, hoveredEventId, showRegions, selectedRegionId, onRegionClick 
}: { 
  events: TimelineEvent[], onPinClick?: (event: TimelineEvent) => void,
  hoveredEventId?: string | null, showRegions?: boolean,
  selectedRegionId?: string | null, onRegionClick?: (id: string | null) => void 
}) => {
  // Ankara default center
  const centerPosition: [number, number] = [39.9208, 32.8541];

  return (
    <div className="relative w-full aspect-video border border-base-content/10 overflow-hidden rounded-2xl shadow-inner z-0">
      <MapContainer center={centerPosition} zoom={10} className="w-full h-full" scrollWheelZoom={false}>
        <MapScrollControls />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {showRegions && getAnkaraRegions().map(region => {
          const isSelected = selectedRegionId === region.id;
          return (
            <GeoJSON 
              key={`${region.id}-${isSelected ? 'selected' : 'unselected'}`}
              data={region.feature}
              style={{
                color: isSelected ? "#ff3e00" : "#3b82f6",
                fillColor: isSelected ? "#ff3e00" : "#3b82f6",
                fillOpacity: isSelected ? 0.3 : 0.05,
                weight: isSelected ? 3 : 1
              }}
              eventHandlers={{
                click: () => onRegionClick && onRegionClick(isSelected ? null : region.id)
              }}
            >
              <Popup className="font-sans font-bold uppercase tracking-widest text-[10px]">{region.name} (Tıkla ve Filtrele)</Popup>
            </GeoJSON>
          );
        })}

        {events.length > 1 && (() => {
           const sortedEvents = [...events]
             .filter(e => e.location)
             .sort((a,b) => new Date(a.dateObj).getTime() - new Date(b.dateObj).getTime());
           
           const routeCoords: [number, number][] = sortedEvents.map((event) => {
             const originalIndex = events.findIndex(e => e.id === event.id);
             const [lat, lng] = getCoords(event.location!);
             // Jitter for identical points to prevent complete overlap
             const latJitter = (originalIndex % 5) * 0.005 - 0.01;
             const lngJitter = ((originalIndex * 7) % 5) * 0.005 - 0.01;
             return [lat + latJitter, lng + lngJitter];
           });

           return <Polyline positions={routeCoords} pathOptions={{ color: '#ef4444', weight: 4, dashArray: '8, 10', opacity: 0.7 }} />;
        })()}

        {events.map((event, index) => {
          if (!event.location) return null;
          const [lat, lng] = getCoords(event.location);
          
          // Jitter for identical points to prevent complete overlap
          const latJitter = (index % 5) * 0.005 - 0.01;
          const lngJitter = ((index * 7) % 5) * 0.005 - 0.01;
          
          const isTarget = event.primaryPerson === 'podo' || event.relatedPerson === 'podo';
          const isHovered = hoveredEventId === event.id;

          return (
            <Marker 
              key={event.id} 
              position={[lat + latJitter, lng + lngJitter]}
              icon={createPinIcon(isTarget, isHovered)}
            >
              <Popup className="font-sans min-w-[200px]">
                <div className="uppercase font-bold text-[10px]">
                  <span className="block text-primary mb-1 text-sm">{event.displayTime}</span>
                  {event.location}
                  {onPinClick && (
                     <button className="btn btn-xs mt-2 w-full btn-primary" onClick={() => onPinClick(event)}>Şüpheliyi İncele</button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};