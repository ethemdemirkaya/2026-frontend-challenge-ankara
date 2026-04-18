import { type PersonRecord, type TimelineEvent, calculateInvestigationStats } from "../utils/investigation";
import { useEffect, useState, useRef } from "react";
import { 
  Eye, MessageSquare, MapPin, FileText, AlertTriangle, 
  LayoutDashboard, Search, Calendar, FolderArchive, 
  Scale, PenTool, CheckCircle2, Info, Flame, History, 
  BarChart3, ShieldCheck, ChevronRight
} from "lucide-react";

interface Props {
  processed: { people: PersonRecord[], timeline: TimelineEvent[] } | null;
}

export function InvestigationReport({ processed }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'analysis' | 'timeline'>('summary');
  const [animationPhase, setAnimationPhase] = useState(0);
  const [userConclusion, setUserConclusion] = useState("");
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      const phases = [100, 300, 500, 700];
      phases.forEach((delay, i) => {
        setTimeout(() => setAnimationPhase(i + 1), delay);
      });
    } else {
      setAnimationPhase(0);
    }
  }, [isOpen]);

  if (!processed) return null;

  const people = processed.people;
  const events = processed.timeline;

  if (people.length === 0 || events.length === 0) return null;

  // --- Gerçek veri hesaplamaları ---
  const sortedPeople = [...people].sort((a, b) => b.events.length - a.events.length);
  const primeSuspect = sortedPeople[0];
  const secondarySuspects = sortedPeople.slice(1, 4);

  // Olayları dateObj'e göre sırala (timestamp string'e güvenme)
  const sortedEvents = [...events].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  const lastEvent = sortedEvents[0];
  const firstEvent = [...events].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];
  const recentEvents = sortedEvents.slice(0, 5);

  // Olay türü dağılımı — gerçek tip adları küçük harf
  const eventTypes = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // En çok görülen lokasyon hesaplaması sadece frekans listesi için kalsın
  const locationFreq: Record<string, number> = {};
  events.forEach(e => { if (e.location) locationFreq[e.location] = (locationFreq[e.location] || 0) + 1; });

  const messageCount = eventTypes['message'] || 0;
  const checkinCount = eventTypes['checkin'] || 0;
  const noteCount = eventTypes['note'] || 0;
  const tipCount = eventTypes['tip'] || 0;

  // Kaç farklı şahsın birbirine bağlantısı var
  const connectedPeople = people.filter(p => p.connections.size > 0).length;

  const totalEvents = events.length;
  const suspectRatio = primeSuspect ? (primeSuspect.events.length / totalEvents) * 100 : 0;
 
  // Güven skoru ve diğer istatistikler (merkezi hesaplamadan al)
  const { confidenceScore, sightingCount, hotLocation } = calculateInvestigationStats(people, events);

  // Neden bu karara varıldı
  const reasonings: string[] = [];
  if (primeSuspect && primeSuspect.events.length > 1) {
    reasonings.push(`${primeSuspect.displayName} sistemde toplam ${primeSuspect.events.length} ayrı olayda kayıt altına alınmış ve tüm olayların %${Math.round(suspectRatio)}ini oluşturuyor.`);
  }
  if (primeSuspect?.connections.size > 0) {
    reasonings.push(`${primeSuspect.displayName}'ın ${Array.from(primeSuspect.connections).join(', ')} ile doğrudan iletişim veya fiziksel temas kaydı mevcut.`);
  }
  if (hotLocation) {
    reasonings.push(`"${hotLocation[0]}" konumu ${hotLocation[1]} farklı olayda tekrar eden sıcak bölge olarak öne çıkıyor.`);
  }
  if (sightingCount > 0) {
    reasonings.push(`${sightingCount} fiziksel görme kaydı, şüphelilerin Podo ile aynı anda aynı bölgede bulunduğunu doğruluyor.`);
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sighting': return <Eye className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'checkin': return <MapPin className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'tip': return <AlertTriangle className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'sighting': return 'Fiziksel Görülme';
      case 'message': return 'Mesaj';
      case 'checkin': return 'Check-in';
      case 'note': return 'Kişisel Not';
      case 'tip': return 'Anonim İhbar';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sighting': return 'text-amber-400';
      case 'message': return 'text-sky-400';
      case 'checkin': return 'text-emerald-400';
      case 'note': return 'text-violet-400';
      case 'tip': return 'text-rose-400';
      default: return 'text-base-content';
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        className="group relative btn btn-primary btn-sm sm:btn-md shadow-xl hover:shadow-primary/30 transition-all duration-300 overflow-hidden"
        onClick={() => {
          modalRef.current?.showModal();
          setIsOpen(true);
        }}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary-focus to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="relative flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="font-semibold tracking-wide">Nihai Rapor</span>
        </span>
      </button>

      {/* Modal */}
      <dialog
        ref={modalRef}
        className="modal modal-bottom sm:modal-middle backdrop-blur-md"
        onClose={() => setIsOpen(false)}
      >
        <div className="modal-box max-w-4xl p-0 bg-base-300 border border-base-content/10 shadow-2xl">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-base-200 via-base-200 to-base-300 border-b border-base-content/10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
            <div className="relative px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <FolderArchive className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl tracking-tight">Podo Kayıp Vakası</h3>
                    <p className="text-xs text-base-content/60 uppercase tracking-widest">Karar Raporu · {totalEvents} Kayıt</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-base-content/50 uppercase tracking-wider mb-1">Güven Skoru</div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-base-content/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                        style={{ width: isOpen ? `${confidenceScore}%` : '0%' }}
                      />
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-400">%{confidenceScore}</span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-1 mt-5 p-1 bg-base-300/50 rounded-lg">
                {[
                  { id: 'summary', label: 'Özet & Karar', icon: <BarChart3 className="w-4 h-4" /> },
                  { id: 'analysis', label: 'Veri Analizi', icon: <Search className="w-4 h-4" /> },
                  { id: 'timeline', label: 'Zaman Serisi', icon: <History className="w-4 h-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === tab.id
                      ? 'bg-base-100 shadow-sm text-base-content'
                      : 'text-base-content/50 hover:text-base-content/80'
                      }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[400px] overflow-y-auto max-h-[60vh]">

            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="space-y-5">
                {/* Stats Grid */}
                <div
                  style={{
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: animationPhase >= 1 ? 'translateY(0)' : 'translateY(16px)',
                    opacity: animationPhase >= 1 ? 1 : 0
                  }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                  {[
                    { value: totalEvents, label: 'Toplam Kayıt', color: 'text-primary' },
                    { value: sightingCount, label: 'Fiziksel Görülme', color: 'text-amber-400' },
                    { value: people.length, label: 'Şahıs Kaydı', color: 'text-sky-400' },
                    { value: connectedPeople, label: 'Bağlantılı Kişi', color: 'text-violet-400' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-base-200 rounded-xl p-4 border border-base-content/5">
                      <div className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-base-content/50 uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Key Findings */}
                <div
                  style={{
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: '150ms',
                    transform: animationPhase >= 2 ? 'translateY(0)' : 'translateY(16px)',
                    opacity: animationPhase >= 2 ? 1 : 0
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {/* Prime Suspect */}
                  <div className="relative group bg-gradient-to-br from-error/10 to-error/5 rounded-2xl p-5 border border-error/20 hover:border-error/30 transition-colors">
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-error animate-pulse" />
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-error" />
                      <h4 className="text-xs font-bold text-error uppercase tracking-widest">En Kritik Şüpheli</h4>
                    </div>
                    <p className="text-2xl font-bold mb-2">{primeSuspect?.displayName}</p>
                    <p className="text-xs text-base-content/60 leading-relaxed">
                      {primeSuspect?.events.length} kayıt · {primeSuspect?.connections.size} bağlantı · 
                      Şüphe puanı: <span className="text-error font-bold">{primeSuspect?.suspicionScore}</span>
                    </p>
                  </div>

                  {/* Sıcak Bölge / Son Konum */}
                  <div className="relative bg-gradient-to-br from-info/10 to-info/5 rounded-2xl p-5 border border-info/20 hover:border-info/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-info" />
                      <h4 className="text-xs font-bold text-info uppercase tracking-widest">Son Bilinen Konum</h4>
                    </div>
                    <p className="text-2xl font-bold mb-1">{lastEvent?.location || "Bilinmiyor"}</p>
                    <p className="text-xs text-base-content/60">
                      {lastEvent?.displayTime} · {lastEvent?.type && getTypeName(lastEvent.type)}
                    </p>
                    {hotLocation && hotLocation[0] !== lastEvent?.location && (
                      <p className="text-xs text-warning mt-2 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Sıcak bölge: <strong>{hotLocation[0]}</strong> ({hotLocation[1]} olay)
                      </p>
                    )}
                  </div>
                </div>

                {/* Investigator Reasoning */}
                <div
                  style={{
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: '250ms',
                    transform: animationPhase >= 3 ? 'translateY(0)' : 'translateY(16px)',
                    opacity: animationPhase >= 3 ? 1 : 0
                  }}
                  className="bg-base-200 rounded-2xl p-5 border border-base-content/10"
                >
                  <h4 className="font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2 text-warning">
                    <Scale className="w-4 h-4" /> Karar Gerekçesi (Sistematik Değerlendirme)
                  </h4>
                  <ul className="space-y-2">
                    {reasonings.map((r, i) => (
                      <li key={i} className="flex gap-3 text-sm text-base-content/80">
                        <span className="mt-1 text-warning shrink-0">▸</span>
                        <span>{r}</span>
                      </li>
                    ))}
                    {firstEvent && <li className="flex gap-3 text-sm text-base-content/80">
                      <span className="mt-1 text-warning shrink-0">▸</span>
                      <span>Vaka zaman aralığı: <strong>{firstEvent.displayTime}</strong> ile <strong>{lastEvent?.displayTime}</strong> arasında.</span>
                    </li>}
                  </ul>
                </div>

                {/* User Conclusion */}
                <div
                  style={{
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: '350ms',
                    transform: animationPhase >= 4 ? 'translateY(0)' : 'translateY(16px)',
                    opacity: animationPhase >= 4 ? 1 : 0
                  }}
                  className="bg-gradient-to-r from-success/10 via-success/5 to-transparent rounded-2xl p-5 border border-success/20"
                >
                  <h4 className="font-bold text-success uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                    <PenTool className="w-4 h-4" /> Dedektif Kararı (Sizin Değerlendirmeniz)
                  </h4>
                  <textarea
                    className="w-full bg-base-300/60 border border-base-content/10 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-success/50 min-h-[100px] placeholder-base-content/30"
                    placeholder={`Buraya kendi değerlendirmenizi yazın...\n\nÖrn: "${primeSuspect?.displayName} ile ${Array.from(primeSuspect?.connections || [])[0] || 'diğer şahıslar'} arasındaki ${messageCount} mesaj kaydı ve ${sightingCount} fiziksel görülme göz önüne alındığında, Podo'nun en son ${lastEvent?.location || 'belirtilen konumda'} olduğunu düşünüyorum..."`}
                    value={userConclusion}
                    onChange={e => setUserConclusion(e.target.value)}
                  />
                  {userConclusion && (
                    <div className="mt-3 p-3 bg-success/10 rounded-xl border border-success/20 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <p className="text-xs text-success font-medium">Değerlendirme kaydedildi — Bu sekme açık kaldığı sürece korunur.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-4">Olay Türü Dağılımı</h4>
                  <div className="space-y-3">
                    {Object.entries(eventTypes).map(([type, count], i) => {
                      const percentage = (count / totalEvents) * 100;
                      return (
                        <div key={type} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium flex items-center gap-2 ${getTypeColor(type)}`}>
                              <span>{getTypeIcon(type)}</span>
                              {getTypeName(type)}
                            </span>
                            <span className="font-mono text-sm text-base-content/50">{count} kayıt (%{Math.round(percentage)})</span>
                          </div>
                          <div className="h-2 bg-base-content/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary/60 rounded-full transition-all duration-700 group-hover:bg-primary"
                              style={{ width: `${percentage}%`, transitionDelay: `${i * 100}ms` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* En sık lokasyonlar */}
                {Object.keys(locationFreq).length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-4">🔥 En Sık Geçen Konumlar</h4>
                    <div className="space-y-2">
                      {Object.entries(locationFreq).sort((a,b) => b[1]-a[1]).slice(0, 5).map(([loc, cnt], i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 border border-base-content/5">
                          <div className="flex items-center gap-3">
                            <span className="text-base-content/40 font-mono text-xs w-5">#{i+1}</span>
                            <span className="font-medium text-sm">{loc}</span>
                          </div>
                          <span className="font-mono text-xs text-base-content/50 bg-base-content/5 px-2 py-1 rounded">{cnt} olay</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secondary Suspects */}
                {secondarySuspects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-4">Diğer Bağlantılar (Şüphe Skoruna Göre)</h4>
                    <div className="space-y-2">
                      {secondarySuspects.map((person, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 border border-base-content/5 hover:border-base-content/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-base-content/10 flex items-center justify-center text-sm font-bold">
                              {person.displayName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium block">{person.displayName}</span>
                              <span className="text-xs text-base-content/40">{person.events.length} olay · {person.connections.size} bağlantı</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-xs text-base-content/50 bg-base-content/5 px-2 py-1 rounded block">Şüphe: {person.suspicionScore}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div>
                <h4 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-4">Son 5 Olay (Yeniden Eskiye)</h4>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-base-content/10" />
                  <div className="space-y-4">
                    {recentEvents.map((event, i) => (
                      <div key={event.id || i} className="relative flex gap-4 pl-10">
                        <div className={`absolute left-2 w-5 h-5 rounded-full border-2 border-base-300 flex items-center justify-center ${i === 0 ? 'bg-primary border-primary' : 'bg-base-200'}`}>
                          {i === 0 && <div className="w-2 h-2 rounded-full bg-base-100" />}
                        </div>
                        <div className={`flex-1 p-4 rounded-xl border transition-colors ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-base-200/50 border-base-content/5'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={getTypeColor(event.type)}>{getTypeIcon(event.type)}</span>
                                <span className="font-semibold text-sm">{getTypeName(event.type)}</span>
                                {event.primaryPerson && <span className="text-xs text-base-content/40">· {event.primaryPerson}</span>}
                              </div>
                              <p className="text-sm text-base-content/70">{event.location || 'Konum belirtilmedi'}</p>
                              {event.content && <p className="text-xs text-base-content/40 mt-1 line-clamp-2 italic">"{event.content}"</p>}
                            </div>
                            <time className="text-xs text-base-content/40 font-mono whitespace-nowrap shrink-0">{event.displayTime}</time>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-base-200/50 border-t border-base-content/5 flex items-center justify-between">
            <p className="text-xs text-base-content/40 italic">
              * Tüm veriler Jotform API'sinden gerçek zamanlı çekilmektedir.
            </p>
            <form method="dialog">
              <button className="btn btn-sm btn-ghost hover:bg-base-content/5">Kapat</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop bg-base-300/80">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}