import { type TimelineEvent } from "../utils/investigation";
import { getCoords } from "../utils/locations";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Create a custom icon for pins, since Leaflet's default marker can have path issues in React
const createPinIcon = (isTarget: boolean) => new L.DivIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 drop-shadow-md transition-all duration-300 hover:scale-125 hover:-translate-y-2 ${isTarget ? 'text-primary' : 'text-neutral'}" style="margin-left: -12px; margin-top: -24px;"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>`,
  className: "custom-leaflet-icon",
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

export const MapView = ({ events, onPinClick }: { events: TimelineEvent[], onPinClick?: (event: TimelineEvent) => void }) => {
  // Ankara default center
  const centerPosition: [number, number] = [39.9208, 32.8541];

  return (
    <div className="relative w-full aspect-video border border-base-content/10 overflow-hidden rounded-2xl shadow-inner z-0">
      <MapContainer center={centerPosition} zoom={11} className="w-full h-full" scrollWheelZoom={false}>
        <MapScrollControls />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {events.map((event, index) => {
          if (!event.location) return null;
          const [lat, lng] = getCoords(event.location);
          
          // Jitter for identical points to prevent complete overlap
          const latJitter = (index % 5) * 0.005 - 0.01;
          const lngJitter = ((index * 7) % 5) * 0.005 - 0.01;
          
          const isTarget = event.primaryPerson === 'podo' || event.relatedPerson === 'podo';

          return (
            <Marker 
              key={event.id} 
              position={[lat + latJitter, lng + lngJitter]}
              icon={createPinIcon(isTarget)}
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