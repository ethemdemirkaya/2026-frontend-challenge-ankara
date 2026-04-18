import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, X, User, MapPin, MessageSquare, Eye, FileText, AlertTriangle,
  Clock, Filter, SlidersHorizontal, ChevronRight, Check, CornerDownLeft,
  Radio, Layers, CalendarDays, Hash
} from "lucide-react";
import { type PersonRecord, type TimelineEvent } from "../utils/investigation";

type FilterType = 'all' | 'checkin' | 'message' | 'sighting' | 'note' | 'tip';
type FilterUrgency = 'all' | 'high' | 'medium' | 'low';

interface SearchResult {
  type: 'person' | 'event';
  person: PersonRecord;
  event?: TimelineEvent;
  score: number;
  matchField: string;
}

const EVENT_TYPE_META: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  checkin:  { label: 'Check-in',    color: 'text-blue-500',   Icon: MapPin },
  message:  { label: 'Mesaj',       color: 'text-violet-500', Icon: MessageSquare },
  sighting: { label: 'Görülme',     color: 'text-red-500',    Icon: Eye },
  note:     { label: 'Not',         color: 'text-amber-500',  Icon: FileText },
  tip:      { label: 'İhbar',       color: 'text-orange-500', Icon: AlertTriangle },
};

export const SpotlightSearch = ({
  people,
  onSelect,
  externalOpen,
  setExternalOpen,
}: {
  people: PersonRecord[];
  onSelect: (id: string) => void;
  externalOpen: boolean;
  setExternalOpen: (val: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (externalOpen) {
      setIsOpen(true);
      setExternalOpen(false); // Reset to allow repeated triggers
    }
  }, [externalOpen, setExternalOpen]);
  const [query, setQuery] = useState("");
  const [activeTypeFilter, setActiveTypeFilter] = useState<FilterType>('all');
  const [activeUrgency, setActiveUrgency] = useState<FilterUrgency>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveTypeFilter('all');
    setActiveUrgency('all');
    setShowFilters(false);
    setSelectedIdx(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
        if (!isOpen) setQuery("");
      }
      if (e.key === "Escape" && isOpen) close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 60);
  }, [isOpen]);

  // --- Search & filter logic ---
  const results: SearchResult[] = [];

  if (query.trim().length > 0 || activeTypeFilter !== 'all' || activeUrgency !== 'all') {
    const q = query.toLowerCase();

    people.forEach(person => {
      // Person name match
      if (q && person.displayName.toLowerCase().includes(q)) {
        results.push({ type: 'person', person, score: 100, matchField: 'İsim eşleşmesi' });
      }

      // Event-level matches
      person.events.forEach(event => {
        // Type filter
        if (activeTypeFilter !== 'all' && event.type !== activeTypeFilter) return;

        // Urgency filter (from rawData)
        const urgency = event.rawData?.urgency;
        if (activeUrgency !== 'all' && urgency !== activeUrgency) return;

        let matchScore = 0;
        let matchField = '';

        if (q) {
          if (event.location?.toLowerCase().includes(q)) { matchScore = 85; matchField = `Konum: ${event.location}`; }
          else if (event.content?.toLowerCase().includes(q)) { matchScore = 70; matchField = `İçerik eşleşmesi`; }
          else if (event.relatedPerson?.toLowerCase().includes(q)) { matchScore = 75; matchField = `İlgili kişi: ${event.relatedPerson}`; }
          // No text match when query provided
          if (!matchScore) return;
        } else {
          // Filter-only mode (no text query)
          matchScore = 50;
          matchField = activeTypeFilter !== 'all'
            ? `${EVENT_TYPE_META[event.type]?.label || event.type} olayı`
            : (activeUrgency !== 'all' ? `Aciliyet: ${urgency}` : '');
        }

        results.push({ type: 'event', person, event, score: matchScore, matchField });
      });
    });
  }

  // Deduplicate person entries, sort by score
  const dedupedResults: SearchResult[] = [];
  const seenPersonIds = new Set<string>();
  results
    .sort((a, b) => b.score - a.score)
    .forEach(r => {
      if (r.type === 'person') {
        if (!seenPersonIds.has(r.person.id)) {
          seenPersonIds.add(r.person.id);
          dedupedResults.push(r);
        }
      } else {
        dedupedResults.push(r);
      }
    });

  const finalResults = dedupedResults.slice(0, 8);

  // Handle keyboard navigation
  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, finalResults.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && finalResults[selectedIdx]) {
      const r = finalResults[selectedIdx];
      onSelect(r.person.id);
      close();
    }
  };

  const hasActiveFilters = activeTypeFilter !== 'all' || activeUrgency !== 'all';
  const isSearchActive = query.trim().length > 0 || hasActiveFilters;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-base-300/80 backdrop-blur-sm flex items-start justify-center pt-[12vh]">
      <div className="absolute inset-0" onClick={close} />

      <div className="relative bg-base-100 w-full max-w-2xl rounded-2xl shadow-2xl border border-base-content/10 overflow-hidden">

        {/* === Search Input Bar === */}
        <div className="flex items-center px-4 py-3 gap-3 border-b border-base-content/10">
          <Search className="w-5 h-5 text-base-content/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none py-1.5 text-base focus:ring-0 placeholder:text-base-content/30"
            placeholder="Şahıs adı, konum veya içerik ara..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
            onKeyDown={handleKeyNavigation}
          />
          <div className="flex items-center gap-2 shrink-0">
            {isSearchActive && (
              <button
                className="btn btn-ghost btn-xs gap-1 text-base-content/50"
                onClick={() => { setQuery(""); setActiveTypeFilter('all'); setActiveUrgency('all'); }}
              >
                <X className="w-3.5 h-3.5" />
                Temizle
              </button>
            )}
            <button
              className={`btn btn-ghost btn-xs gap-1 ${hasActiveFilters ? 'text-primary' : 'text-base-content/50'}`}
              onClick={() => setShowFilters(v => !v)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtrele
              {hasActiveFilters && <span className="badge badge-primary badge-xs">{[activeTypeFilter !== 'all', activeUrgency !== 'all'].filter(Boolean).length}</span>}
            </button>
            <kbd className="kbd kbd-sm opacity-40">ESC</kbd>
          </div>
        </div>

        {/* === Filter Panel === */}
        {showFilters && (
          <div className="border-b border-base-content/10 px-4 py-3 bg-base-200/40 space-y-3">
            {/* Event Type Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1 w-20 shrink-0">
                <Layers className="w-3 h-3" /> Tür
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'checkin', 'message', 'sighting', 'note', 'tip'] as FilterType[]).map(t => {
                  const meta = t !== 'all' ? EVENT_TYPE_META[t] : null;
                  const isActive = activeTypeFilter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setActiveTypeFilter(t)}
                      className={`btn btn-xs gap-1 rounded-full transition-all ${isActive ? 'btn-primary' : 'btn-ghost border border-base-content/15'}`}
                    >
                      {meta && <meta.Icon className={`w-3 h-3 ${isActive ? '' : meta.color}`} />}
                      {t === 'all' ? 'Tümü' : meta?.label}
                      {isActive && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Urgency Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1 w-20 shrink-0">
                <Radio className="w-3 h-3" /> Aciliyet
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'high', 'medium', 'low'] as FilterUrgency[]).map(u => {
                  const colors = { all: '', high: 'text-error', medium: 'text-warning', low: 'text-success' };
                  const labels = { all: 'Tümü', high: 'Yüksek', medium: 'Orta', low: 'Düşük' };
                  const isActive = activeUrgency === u;
                  return (
                    <button
                      key={u}
                      onClick={() => setActiveUrgency(u)}
                      className={`btn btn-xs rounded-full transition-all ${isActive ? 'btn-primary' : 'btn-ghost border border-base-content/15'}`}
                    >
                      {u !== 'all' && <span className={`w-2 h-2 rounded-full inline-block ${colors[u].replace('text-', 'bg-')}`}></span>}
                      <span className={isActive ? '' : colors[u]}>{labels[u]}</span>
                      {isActive && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active state summary */}
            {hasActiveFilters && (
              <p className="text-[10px] opacity-50 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Aktif filtre: {activeTypeFilter !== 'all' ? `Tür = ${EVENT_TYPE_META[activeTypeFilter]?.label}` : ''}{activeTypeFilter !== 'all' && activeUrgency !== 'all' ? ' · ' : ''}{activeUrgency !== 'all' ? `Aciliyet = ${activeUrgency}` : ''}
                {' '}— bu kriterleri karşılamayan tüm kayıtlar gizlendi.
              </p>
            )}
          </div>
        )}

        {/* === Results === */}
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto">
          {isSearchActive && finalResults.length > 0 ? (
            <div className="p-2">
              {/* Section headers */}
              {finalResults.some(r => r.type === 'person') && (
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1.5 px-3 py-2">
                  <User className="w-3 h-3" /> Şüpheliler
                </p>
              )}
              {finalResults.map((r, i) => {
                const isSelected = i === selectedIdx;
                if (r.type === 'person') {
                  return (
                    <button key={`person-${r.person.id}`}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-base-200'}`}
                      onClick={() => { onSelect(r.person.id); close(); }}
                      onMouseEnter={() => setSelectedIdx(i)}
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                        {r.person.displayName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{r.person.displayName}</p>
                        <p className="text-[11px] opacity-50 flex items-center gap-1">
                          <Hash className="w-3 h-3" />{r.person.events.length} olay
                          <span className="mx-1">·</span>
                          <span className={r.person.suspicionScore > 60 ? 'text-error' : r.person.suspicionScore > 30 ? 'text-warning' : 'text-success'}>
                            Şüphe: {r.person.suspicionScore}%
                          </span>
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-opacity ${isSelected ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-50'}`} />
                    </button>
                  );
                }

                // Event result
                const meta = r.event ? EVENT_TYPE_META[r.event.type] : null;
                const Icon = meta?.Icon || FileText;
                const urgency = r.event?.rawData?.urgency;
                const urgencyColor = urgency === 'high' ? 'text-error' : urgency === 'medium' ? 'text-warning' : 'text-success';

                if (i === 0 || finalResults[i-1]?.type === 'person') {
                  // Add section break before first event result
                }

                return (
                  <button key={`event-${r.event?.id}-${i}`}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isSelected ? 'bg-base-200 ring-1 ring-base-content/20' : 'hover:bg-base-200/60'}`}
                    onClick={() => { onSelect(r.person.id); close(); }}
                    onMouseEnter={() => setSelectedIdx(i)}
                  >
                    <div className={`w-9 h-9 rounded-xl bg-base-200 flex items-center justify-center shrink-0 ${meta?.color || ''}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">{r.person.displayName}</p>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-base-300 ${meta?.color || ''}`}>
                          {meta?.label}
                        </span>
                        {urgency && urgency !== 'low' && (
                          <span className={`text-[9px] font-bold uppercase ${urgencyColor}`}>
                            {urgency === 'high' ? '● YÜK' : '● ORT'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {r.event?.location && <><MapPin className="w-3 h-3 opacity-40 shrink-0" /><span className="text-[11px] opacity-50 truncate">{r.event.location}</span></>}
                        {r.event?.displayTime && <><Clock className="w-3 h-3 opacity-30 shrink-0 ml-1" /><span className="text-[11px] opacity-40">{r.event.displayTime}</span></>}
                      </div>
                      {r.event?.content && (
                        <p className="text-[11px] opacity-40 italic truncate mt-0.5">"{r.event.content}"</p>
                      )}
                    </div>
                    {isSelected && <CornerDownLeft className="w-4 h-4 opacity-40 shrink-0" />}
                  </button>
                );
              })}
            </div>
          ) : isSearchActive ? (
            <div className="px-6 py-10 text-center space-y-2">
              <Search className="w-8 h-8 opacity-20 mx-auto" />
              <p className="text-sm opacity-40">Bu kriterlere uyan kayıt bulunamadı.</p>
              {hasActiveFilters && (
                <button className="btn btn-xs btn-ghost opacity-50" onClick={() => { setActiveTypeFilter('all'); setActiveUrgency('all'); }}>
                  Filtreleri temizle
                </button>
              )}
            </div>
          ) : (
            /* Empty state — hints */
            <div className="px-5 py-5 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 flex items-center gap-1.5">
                <CalendarDays className="w-3 h-3" /> Hızlı Erişim
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Kağan', sub: 'En fazla olayda geçen isim', type: 'person' as const },
                  { label: 'Atakule', sub: 'En sık görülen lokasyon', type: 'location' as const },
                  { label: 'high urgency', sub: 'Yüksek aciliyetli mesajlar', type: 'urgency' as const },
                  { label: 'sighting', sub: 'Fiziksel görme kayıtları', type: 'type' as const },
                ].map(hint => (
                  <button key={hint.label}
                    onClick={() => hint.type === 'type' ? setActiveTypeFilter(hint.label as FilterType) : hint.type === 'urgency' ? setActiveUrgency('high') : setQuery(hint.label)}
                    className="text-left p-3 rounded-xl bg-base-200/50 hover:bg-base-200 border border-base-content/5 transition-colors group"
                  >
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{hint.label}</p>
                    <p className="text-[10px] opacity-40 mt-0.5">{hint.sub}</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] opacity-25 text-center">
                ↑↓ gezin · Enter seç · Ctrl+K kapat
              </p>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        {finalResults.length > 0 && isSearchActive && (
          <div className="px-4 py-2 border-t border-base-content/5 flex items-center justify-between">
            <p className="text-[10px] opacity-30 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {finalResults.length} sonuç · {activeTypeFilter !== 'all' ? `tür: ${EVENT_TYPE_META[activeTypeFilter]?.label}` : 'tüm türler'} · {activeUrgency !== 'all' ? `aciliyet: ${activeUrgency}` : 'tüm aciliyet'}
            </p>
            <p className="text-[10px] opacity-30">↑↓ — ↵ seç</p>
          </div>
        )}
      </div>
    </div>
  );
};
