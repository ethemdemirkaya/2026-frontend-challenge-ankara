import type { PersonRecord, TimelineEvent } from "../utils/investigation";
import { getCoordsFromEvent, calculateDistance } from "../utils/locations";
import { AlertTriangle, Pin, PinOff } from "lucide-react";

interface TimelineViewProps {
  person: PersonRecord;
  allPeople: PersonRecord[];
  hoveredEventId?: string | null;
  onEventHover?: (id: string | null) => void;
  pinnedIds?: string[];
  onPin?: (event: TimelineEvent) => void;
}

export const TimelineView = ({ person, allPeople, hoveredEventId, onEventHover, pinnedIds = [], onPin }: TimelineViewProps) => {
  return (
    <ul className="timeline timeline-vertical timeline-compact print:block w-full">
      {person.events.map((e, idx) => {
        const isHovered = hoveredEventId === e.id;
        const isPinned = pinnedIds.includes(e.id);

        // --- Conflict Engine logic ---
        let anomaly = null;
        if (idx > 0) {
          const prev = person.events[idx - 1];
          const coords1 = getCoordsFromEvent(prev.location, prev.coordinates);
          const coords2 = getCoordsFromEvent(e.location, e.coordinates);

          const distance = calculateDistance(coords1, coords2);
          const timeDiffHours = Math.abs(e.dateObj.getTime() - prev.dateObj.getTime()) / (1000 * 60 * 60);

          if (timeDiffHours > 0) {
            const speed = distance / timeDiffHours;
            // threshold: > 80km/h is suspicious in city, > 120km/h is impossible in 5-10 min intervals
            if (speed > 80 && distance > 1) {
              anomaly = {
                distance: distance.toFixed(1),
                speed: speed.toFixed(0),
                time: Math.round(timeDiffHours * 60)
              };
            }
          }
        }

        return (
          <li key={e.id}
            onMouseEnter={() => onEventHover?.(e.id)}
            onMouseLeave={() => onEventHover?.(null)}
            className="print:mb-8 print:block w-full">

            <hr className="bg-base-content/10 print:hidden" />

            <div className={`timeline-middle transition-transform duration-300 ${isHovered ? 'scale-150 text-error' : 'text-primary'}`}>
              <div className={`w-3 h-3 rounded-full ${isHovered ? 'bg-error shadow-[0_0_12px_hsl(var(--er))] animate-pulse' : 'bg-primary shadow-[0_0_8px_hsl(var(--p))]'}`}></div>
            </div>

            <div className="timeline-end mb-8 w-full pl-2 sm:pl-4 group">

              {/* --- YENİLENEN ANOMALİ (ALERT) TASARIMI --- */}
              {anomaly && (
                <div className="alert alert-error shadow-sm mb-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 print:hidden transition-all">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-xs sm:text-sm whitespace-nowrap uppercase tracking-wider">Lojistik Çelişki</span>
                  </div>
                  <div className="text-xs sm:text-sm flex-1 opacity-90">
                    <span className="font-bold">{anomaly.distance}km</span> mesafe <span className="font-bold">{anomaly.time} dk</span> içinde katedildi.
                  </div>
                  <div className="badge badge-outline bg-base-100 text-error font-mono font-bold text-[10px] sm:text-xs shrink-0">
                    ~{anomaly.speed} km/s
                  </div>
                </div>
              )}

              <time className="font-mono text-[10px] block mb-2 opacity-50 transition-colors group-hover:text-primary pl-1">{e.displayTime}</time>

              {/* --- YENİLENEN ETKİNLİK KARTI TASARIMI --- */}
              <div className={`flex flex-col sm:flex-row justify-between items-start gap-4 border p-4 transition-all duration-300 rounded-xl ${isHovered ? 'bg-base-200 border-primary shadow-lg sm:scale-[1.01] ring-1 ring-primary/20' : 'bg-base-200/30 border-base-content/5 hover:bg-base-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30'}`}>

                <div className="flex-1 w-full min-w-0">
                  <div className="text-xs font-bold uppercase mb-1.5 text-base-content/80">
                    {e.type === 'checkin' ? `Konum Tespit: ${e.location}` :
                      e.type === 'message' ? `İletişim Kuruldu: ${allPeople.find(p => p.id === e.relatedPerson)?.displayName || 'Bilinmiyor'}` :
                        e.type === 'tip' ? `İsimsiz İhbar: ${e.location || 'Bilinmiyor'}` :
                          e.type === 'note' ? `Kişisel Not: ${e.location || ''}` :
                            `Birlikte Görüldü: ${allPeople.find(p => p.id === e.relatedPerson)?.displayName || 'Bilinmiyor'}`}
                  </div>
                  <p className="text-xs sm:text-sm opacity-70 italic whitespace-normal break-words leading-relaxed">
                    {e.content || 'İçerik verisine ulaşılamadı.'}
                  </p>
                </div>

                {/* Mobilde alt alta, PC'de sağ tarafa hizalanmış butonlar */}
                <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-base-content/10">
                  <div className="tooltip sm:tooltip-left" data-tip="İstihbarat Kaynağı">
                    <div className={`badge badge-sm uppercase tracking-wider font-bold border-none text-white ${e.type === 'sighting' ? 'bg-error' : e.type === 'message' ? 'bg-info' : e.type === 'tip' ? 'bg-warning' : 'bg-neutral'}`}>
                      {e.type}
                    </div>
                  </div>
                  <button
                    onClick={() => onPin?.(e)}
                    className={`btn btn-circle btn-sm sm:btn-xs border-none print:hidden ${isPinned ? 'btn-primary' : 'btn-ghost bg-base-100 sm:bg-transparent opacity-100 sm:opacity-20 sm:hover:opacity-100'}`}
                  >
                    {isPinned ? <Pin className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-white fill-current" /> : <Pin className="w-3.5 h-3.5 sm:w-3 sm:h-3" />}
                  </button>
                </div>

              </div>
            </div>

            {idx !== person.events.length - 1 && <hr className="bg-base-content/10" />}
          </li>
        )
      })}

      {person.events.length === 0 && (
        <div className="text-center opacity-40 py-12 flex flex-col items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <p className="text-sm font-medium">Bu şahsa ait kronolojik faaliyet bulunmuyor.</p>
        </div>
      )}
    </ul>
  );
};