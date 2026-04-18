import type { PersonRecord } from "../utils/investigation";

interface SidebarProps {
  people: PersonRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSearch: (term: string) => void;
}

export const Sidebar = ({ people, selectedId, onSelect, onSearch }: SidebarProps) => {
  return (
    <aside className="w-80 bg-base-100 flex flex-col border-r border-base-content/10 shadow-2xl z-10">
      <div className="p-6 bg-neutral text-neutral-content">
        <h1 className="text-lg font-bold tracking-tighter">DOSYA: KAYIP PODO</h1>
        <div className="badge badge-error badge-sm rounded-none mt-2 font-bold uppercase">Öncelik: Çok Gizli</div>
      </div>
      
      <div className="p-4">
        <input 
          type="text" 
          placeholder="Şahıs Ara..." 
          className="input input-bordered input-sm w-full rounded-none bg-base-200"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <div className="menu w-full p-0">
          {people.map(p => (
            <button 
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`flex items-center gap-4 p-3 mb-1 transition-all border-l-4 ${selectedId === p.id ? 'bg-base-200 border-primary' : 'border-transparent hover:bg-base-200'}`}
            >
              <div className="flex-1 text-left">
                <div className="font-bold uppercase">{p.displayName}</div>
                <div className="text-[10px] opacity-50">{p.events.length} olay kaydı</div>
              </div>
              {p.id !== 'podo' && (
                <div className="radial-progress text-primary text-[10px]" style={{"--value": p.suspicionScore, "--size": "2rem"} as any}>
                  %{p.suspicionScore}
                </div>
              )}
            </button>
          ))}
          {people.length === 0 && (
            <div className="p-4 text-center text-xs opacity-50">Eşleşen şahıs bulunamadı.</div>
          )}
        </div>
      </div>
    </aside>
  );
};