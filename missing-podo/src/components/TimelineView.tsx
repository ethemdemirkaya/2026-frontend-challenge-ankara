import type { PersonRecord } from "../utils/investigation";

interface TimelineViewProps {
  person: PersonRecord;
  allPeople: PersonRecord[];
  hoveredEventId?: string | null;
  onEventHover?: (id: string | null) => void;
}

export const TimelineView = ({ person, allPeople, hoveredEventId, onEventHover }: TimelineViewProps) => {
  return (
    <ul className="timeline timeline-vertical timeline-compact">
      {person.events.map((e, idx) => {
        const isHovered = hoveredEventId === e.id;
        
        return (
          <li key={e.id}
              onMouseEnter={() => onEventHover?.(e.id)}
              onMouseLeave={() => onEventHover?.(null)}>
            <hr className="bg-base-content/10"/>
            <div className={`timeline-middle transition-transform duration-300 ${isHovered ? 'scale-150 text-error' : 'text-primary'}`}>
              <div className={`w-3 h-3 rounded-full ${isHovered ? 'bg-error shadow-[0_0_12px_hsl(var(--er))] animate-pulse' : 'bg-primary shadow-[0_0_8px_hsl(var(--p))]'}`}></div>
            </div>
            <div className="timeline-end mb-10 w-full pl-4 group">
              <time className="font-mono text-[10px] block mb-2 opacity-50 transition-colors group-hover:text-primary">{e.displayTime}</time>
              <div className={`flex justify-between items-start border p-4 transition-all duration-300 rounded-xl ${isHovered ? 'bg-base-200 border-primary shadow-xl scale-[1.02] ring-2 ring-primary/20' : 'bg-base-200/30 border-base-content/5 hover:bg-base-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30'}`}>
                <div className="flex-1 mr-4">
                  <div className="text-xs font-bold uppercase mb-1">
                    {e.type === 'checkin' ? `Konum Tespit: ${e.location}` : 
                     e.type === 'message' ? `İletişim Kuruldu: ${allPeople.find(p => p.id === e.relatedPerson)?.displayName || 'Bilinmiyor'}` : 
                     e.type === 'tip' ? `İsimsiz İhbar: ${e.location || 'Bilinmiyor'}` : 
                     e.type === 'note' ? `Kişisel Not: ${e.location || ''}` :
                     `Birlikte Görüldü: ${allPeople.find(p => p.id === e.relatedPerson)?.displayName || 'Bilinmiyor'}`}
                  </div>
                  <p className="text-xs opacity-60 italic whitespace-normal break-words">{e.content || 'İçerik verisine ulaşılamadı.'}</p>
                </div>
                <div className="tooltip tooltip-left shrink-0" data-tip="İstihbarat Kaynağı">
                  <div className={`badge badge-sm uppercase tracking-wider shadow-sm font-bold border-none text-white ${e.type === 'sighting' ? 'bg-error' : e.type === 'message' ? 'bg-info' : e.type === 'tip' ? 'bg-warning' : 'bg-neutral'}`}>{e.type}</div>
                </div>
              </div>
            </div>
            {idx !== person.events.length - 1 && <hr className="bg-base-content/10"/>}
          </li>
        )
      })}
      {person.events.length === 0 && (
        <div className="text-center opacity-50 py-10 flex flex-col items-center gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 opacity-20"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <p>Bu şahsa ait kronolojik faaliyet bulunmuyor.</p>
        </div>
      )}
    </ul>
  );
};