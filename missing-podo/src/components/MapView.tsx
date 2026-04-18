import { type TimelineEvent } from "../utils/investigation";
import { getCoords } from "../utils/locations";

interface MapViewProps {
  events: TimelineEvent[];
  onSelectEvent?: (id: string) => void;
}

export const MapView = ({ events, onSelectEvent }: MapViewProps) => {
  return (
    <div className="relative w-full aspect-video bg-base-200 border border-base-content/10 overflow-hidden group">
      {/* Harita Arka Planı (Sembolik Ankara Izgarası) */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* Ana Arterler - Sembolik */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.2" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.2" />
      </svg>

      {/* Olay Pinleri */}
      {events.map((event) => {
        if (event.type !== 'checkin' && !event.location) return null;
        const coords = getCoords(event.location || "");
        
        return (
          <div 
            key={event.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-20"
            style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            onClick={() => onSelectEvent?.(event.id)}
          >
            <div className="indicator">
              {/* Pin Görünümü */}
              <span className={`indicator-item badge badge-xs ${event.primaryPerson === 'podo' ? 'badge-primary' : 'badge-neutral'} border-none animate-ping opacity-50`}></span>
              <div className={`w-4 h-4 rounded-full border-2 border-base-100 shadow-lg ${event.primaryPerson === 'podo' ? 'bg-primary' : 'bg-neutral'}`}></div>
              
              {/* Tooltip (Etiket) */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-neutral text-neutral-content text-[8px] px-2 py-0.5 whitespace-nowrap uppercase font-bold tracking-tighter">
                  {event.location}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Harita Lejantı */}
      <div className="absolute bottom-4 left-4 bg-base-100/80 backdrop-blur p-2 border border-base-content/10 text-[10px] space-y-1 z-30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <span>HEDEF (PODO)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neutral"></div>
          <span>DİĞER ŞAHISLAR</span>
        </div>
      </div>
    </div>
  );
};