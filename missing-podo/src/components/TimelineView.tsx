import type { PersonRecord } from "../utils/investigation";

interface TimelineViewProps {
  person: PersonRecord;
  allPeople: PersonRecord[];
}

export const TimelineView = ({ person, allPeople }: TimelineViewProps) => {
  return (
    <ul className="timeline timeline-vertical timeline-compact">
      {person.events.map((e, idx) => (
        <li key={e.id}>
          <hr className="bg-base-content/10"/>
          <div className="timeline-middle text-primary">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          </div>
          <div className="timeline-end mb-10 w-full pl-4">
            <time className="font-mono text-[10px] block mb-2 opacity-50">{e.displayTime}</time>
            <div className="flex justify-between items-start border border-base-content/5 p-4 bg-base-200/30 transition-colors hover:bg-base-200/60">
              <div>
                <div className="text-xs font-bold uppercase mb-1">
                  {e.type === 'checkin' ? `Konum Tespit: ${e.location}` : 
                   e.type === 'message' ? `İletişim Kuruldu: ${allPeople.find(p => p.id === e.relatedPerson)?.displayName || 'Bilinmiyor'}` : 
                   `Birlikte Görüldü: ${allPeople.find(p => p.id === e.relatedPerson)?.displayName || 'Bilinmiyor'}`}
                </div>
                <p className="text-xs opacity-60 italic">{e.content || 'İçerik verisine ulaşılamadı.'}</p>
              </div>
              <div className="badge badge-xs badge-neutral rounded-none uppercase tracking-wider">{e.type}</div>
            </div>
          </div>
          {idx !== person.events.length - 1 && <hr className="bg-base-content/10"/>}
        </li>
      ))}
      {person.events.length === 0 && (
        <div className="text-center opacity-50 py-10">Bu şahsa ait kronolojik faaliyet bulunmuyor.</div>
      )}
    </ul>
  );
};