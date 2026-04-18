import type { PersonRecord } from "../utils/investigation";
import { Users, FileText, Search, LayoutDashboard, ShieldCheck, ChevronRight } from "lucide-react";

interface SidebarProps {
  people: PersonRecord[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onSearch: (term: string) => void;
}

export const Sidebar = ({ people, selectedId, onSelect, onSearch }: SidebarProps) => {
  return (
    <aside className="w-80 min-h-full bg-base-100 flex flex-col border-r border-base-content/10 shadow-2xl z-10">
      <div className="p-6 bg-neutral text-neutral-content">
        <h1 className="text-lg font-bold tracking-tighter">DOSYA: KAYIP PODO</h1>
        <div className="badge badge-error badge-sm rounded-none mt-2 font-bold uppercase">Öncelik: Çok Gizli</div>
      </div>
      
      {/* Genel Bakış Butonu */}
      <div className="p-4 border-b border-base-content/10">
        <button 
          onClick={() => onSelect(null)} 
          className={`btn btn-sm w-full rounded-none uppercase tracking-widest gap-2 ${selectedId === null ? 'btn-primary' : 'btn-outline'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Ana Rapor
        </button>
      </div>

      <div className="p-4 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
        <input 
          type="text" 
          placeholder="Şahıs Ara..." 
          className="input input-bordered input-sm w-full rounded-none bg-base-200 pl-10"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="menu w-full p-0">
          <div className="menu-title text-[10px] uppercase tracking-widest opacity-50 mb-2">Hedefler & Şüpheliler</div>
          {people.map(p => (
            <button 
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`flex items-center gap-4 p-3 mb-1 transition-all border-l-4 group ${selectedId === p.id ? 'bg-base-200 border-primary' : 'border-transparent hover:bg-base-200'}`}
            >
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <Users className={`w-3.5 h-3.5 ${selectedId === p.id ? 'text-primary' : 'opacity-40'}`} />
                  <div className="font-bold uppercase text-xs truncate">{p.displayName}</div>
                </div>
                <div className="text-[9px] opacity-40 ml-5 flex items-center gap-1">
                  <FileText className="w-2.5 h-2.5" /> {p.events.length} kayıt
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-all ${selectedId === p.id ? 'opacity-100 text-primary translate-x-1' : 'opacity-0 group-hover:opacity-40'}`} />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};