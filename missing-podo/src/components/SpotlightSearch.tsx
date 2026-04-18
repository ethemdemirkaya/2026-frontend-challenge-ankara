import { useState, useEffect, useRef } from "react";
import { type PersonRecord } from "../utils/investigation";

export const SpotlightSearch = ({ people, onSelect }: { people: PersonRecord[], onSelect: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = query.trim() ? people.filter(p => 
    p.displayName.toLowerCase().includes(query.toLowerCase()) || 
    p.events.some(e => e.location?.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 5) : [];

  return (
    <div className="fixed inset-0 z-[9999] bg-base-300/80 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div 
         className="absolute inset-0" 
         onClick={() => setIsOpen(false)} 
      />
      
      <div className="relative bg-base-100 w-full max-w-2xl rounded-2xl shadow-2xl border border-base-content/10 overflow-hidden animate-fade-in-down">
        <div className="flex items-center px-4 py-3 border-b border-base-content/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-lg focus:ring-0"
            placeholder="Şahıs, konum veya içerik ara..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className="kbd kbd-sm opacity-50">ESC</kbd>
        </div>

        {query && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-50 px-4 py-2">Şüpheliler</h4>
            {results.length > 0 ? (
              results.map(p => (
                <button
                  key={p.id}
                  className="w-full text-left flex items-center gap-4 px-4 py-3 hover:bg-base-200 rounded-xl transition-colors group"
                  onClick={() => {
                    onSelect(p.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="avatar placeholder">
                     <div className="bg-primary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center font-bold">
                       {p.displayName.substring(0,2).toUpperCase()}
                     </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-base-content group-hover:text-primary transition-colors">{p.displayName}</h5>
                    <p className="text-xs opacity-60 line-clamp-1">{p.events.length} olay kaydı, Güvenlik Skoru: %{Math.round(100 - p.suspicionScore)}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                     <kbd className="kbd kbd-sm">↵</kbd>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center opacity-50 text-sm">
                "{query}" ile eşleşen bir kayıt bulunamadı.
              </div>
            )}
          </div>
        )}
        {!query && (
          <div className="px-6 py-6 border-t border-base-content/5 opacity-50 flex items-center gap-3 text-xs">
             <span>Öneriler:</span>
             <span className="badge badge-ghost border-base-content/20">Ahmet</span>
             <span className="badge badge-ghost border-base-content/20">Kızılay</span>
             <span className="badge badge-ghost border-base-content/20">Sincan</span>
          </div>
        )}
      </div>
    </div>
  );
};
