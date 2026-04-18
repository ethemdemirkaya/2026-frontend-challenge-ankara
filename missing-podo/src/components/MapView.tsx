import { type TimelineEvent } from "../utils/investigation";
import { getCoords } from "../utils/locations";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Create a custom icon for pins, since Leaflet's default marker can have path issues in React
const createPinIcon = (isTarget: boolean) => new L.DivIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 drop-shadow-md ${isTarget ? 'text-primary' : 'text-neutral'}" style="margin-left: -12px; margin-top: -24px;"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>`,
  className: "custom-leaflet-icon",
});

export const MapView = ({ events }: { events: TimelineEvent[] }) => {
  // Ankara default center
  const centerPosition: [number, number] = [39.9208, 32.8541];

  return (
    <div className="relative w-full aspect-video border border-base-content/10 overflow-hidden rounded-lg z-0">
      <MapContainer center={centerPosition} zoom={11} className="w-full h-full" scrollWheelZoom={false}>
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
              <Popup className="font-sans">
                <div className="uppercase font-bold text-[10px]">
                  <span className="block text-primary mb-1">{event.displayTime}</span>
                  {event.location}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};