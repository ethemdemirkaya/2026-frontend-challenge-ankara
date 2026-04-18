import { type TimelineEvent } from "../utils/investigation";
import { getCoords } from "../utils/locations";

export const MapView = ({ events }: { events: TimelineEvent[] }) => {
  return (
    <div className="relative w-full aspect-video bg-neutral/5 border border-base-content/10 overflow-hidden group rounded-lg">
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {events.map((event, index) => {
        if (!event.location) return null;
        const baseCoords = getCoords(event.location);
        
        // Üst üste binmeyi önlemek için dinamik offset (Jitter) hesaplama
        const offsetX = (index % 5) * 1.5 - 3; 
        const offsetY = ((index * 7) % 5) * 1.5 - 3;
        
        const isTarget = event.primaryPerson === 'podo' || event.relatedPerson === 'podo';

        return (
          <div 
            key={event.id}
            className="absolute -translate-x-1/2 -translate-y-full cursor-pointer transition-all hover:scale-125 z-20 hover:z-50 group/pin"
            style={{ left: `${baseCoords.x + offsetX}%`, top: `${baseCoords.y + offsetY}%` }}
          >
            {/* SVG Pin İkonu */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className={`w-6 h-8 drop-shadow-md ${isTarget ? 'text-primary animate-bounce' : 'text-neutral'}`}
            >
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            
            {/* Etiket */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-base-100 text-base-content text-[10px] px-2 py-1 whitespace-nowrap uppercase font-bold shadow-lg border border-base-content/10 rounded">
                <span className="block text-primary">{event.displayTime}</span>
                {event.location}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};