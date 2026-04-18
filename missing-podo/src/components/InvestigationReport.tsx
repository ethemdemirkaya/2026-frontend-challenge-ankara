import { type PersonRecord, type TimelineEvent } from "../utils/investigation";
import { useEffect, useState, useRef } from "react";

interface Props {
  processed: { people: PersonRecord[], timeline: TimelineEvent[] } | null;
}

export function InvestigationReport({ processed }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'analysis' | 'timeline'>('summary');
  const [animationPhase, setAnimationPhase] = useState(0);
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

  // Calculations
  const sortedPeople = [...people].sort((a, b) => b.events.length - a.events.length);
  const primeSuspect = sortedPeople[0];
  const secondarySuspects = sortedPeople.slice(1, 4);

  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const lastEvent = sortedEvents[0];
  const recentEvents = sortedEvents.slice(0, 5);

  // Event distribution
  const eventTypes = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sightings = eventTypes['SIGHTING'] || 0;
  const messages = (eventTypes['MESSAGE'] || 0) + (eventTypes['CHECKIN'] || 0);
  const totalConnections = events.length;

  // Confidence calculation
  const suspectRatio = primeSuspect ? (primeSuspect.events.length / totalConnections) * 100 : 0;
  const confidenceScore = Math.min(95, Math.round(50 + suspectRatio + (sightings > 0 ? 15 : 0)));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SIGHTING': return '👁';
      case 'MESSAGE': return '💬';
      case 'CHECKIN': return '📍';
      case 'ALERT': return '⚠';
      default: return '📌';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SIGHTING': return 'text-amber-400';
      case 'MESSAGE': return 'text-sky-400';
      case 'CHECKIN': return 'text-emerald-400';
      case 'ALERT': return 'text-rose-400';
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
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <span className="text-xl">🗂</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl tracking-tight">Podo Kayıp Vakası</h3>
                      <p className="text-xs text-base-content/60 uppercase tracking-widest">Karar Raporu</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-base-content/50 uppercase tracking-wider mb-1">Güven Skoru</div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-base-content/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                        style={{ width: isOpen ? `${confidenceScore}%` : '0%' }}
                      />
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-400">{confidenceScore}%</span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-1 mt-5 p-1 bg-base-300/50 rounded-lg">
                {[
                  { id: 'summary', label: 'Özet', icon: '📊' },
                  { id: 'analysis', label: 'Analiz', icon: '🔍' },
                  { id: 'timeline', label: 'Zaman Çizgisi', icon: '📅' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-base-100 shadow-sm text-base-content'
                      : 'text-base-content/50 hover:text-base-content/80'
                      }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[400px]">

            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="space-y-5">
                {/* Stats Grid */}
                <div
                  className="grid grid-cols-3 gap-3 opacity-0 translate-y-4"
                  style={{
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: '100ms',
                    transform: animationPhase >= 1 ? 'translateY(0)' : 'translateY(16px)',
                    opacity: animationPhase >= 1 ? 1 : 0
                  }}
                >
                  {[
                    { value: totalConnections, label: 'Toplam Olay', color: 'text-primary' },
                    { value: sightings, label: 'Fiziksel Görülme', color: 'text-amber-400' },
                    { value: people.length, label: 'Şahıs Kaydı', color: 'text-sky-400' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-base-200 rounded-xl p-4 border border-base-content/5">
                      <div className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-base-content/50 uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Key Findings */}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0"
                  style={{
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: '200ms',
                    transform: animationPhase >= 2 ? 'translateY(0)' : 'translateY(16px)',
                    opacity: animationPhase >= 2 ? 1 : 0
                  }}
                >
                  {/* Prime Suspect */}
                  <div className="relative group bg-gradient-to-br from-error/10 to-error/5 rounded-2xl p-5 border border-error/20 hover:border-error/30 transition-colors">
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-error animate-pulse" />
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🔴</span>
                      <h4 className="text-xs font-bold text-error uppercase tracking-widest">Ana Şüpheli</h4>
                    </div>
                    <p className="text-2xl font-bold mb-2">{primeSuspect?.displayName}</p>
                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-base-content/10 font-mono text-xs">
                        {primeSuspect?.events.length} olay
                      </span>
                      <span className="text-base-content/40">merkezinde</span>
                    </div>
                  </div>

                  {/* Last Location */}
                  <div className="relative bg-gradient-to-br from-info/10 to-info/5 rounded-2xl p-5 border border-info/20 hover:border-info/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">📍</span>
                      <h4 className="text-xs font-bold text-info uppercase tracking-widest">Son Konum</h4>
                    </div>
                    <p className="text-2xl font-bold mb-2">{lastEvent?.location || "Bilinmiyor"}</p>
                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-base-content/10 font-mono text-xs">
                        {new Date(lastEvent?.timestamp || '').toLocaleString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Conclusion */}
                <div
                  className="relative bg-gradient-to-r from-success/10 via-success/5 to-transparent rounded-2xl p-5 border border-success/20 opacity-0"
                  style={{
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: '300ms',
                    transform: animationPhase >= 3 ? 'translateY(0)' : 'translateY(16px)',
                    opacity: animationPhase >= 3 ? 1 : 0
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center text-2xl shrink-0">
                      🧠
                    </div>
                    <div>
                      <h4 className="font-bold text-success mb-2 flex items-center gap-2">
                        <span>Yapay Zeka Tahmini</span>
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-success/20">v2.4</span>
                      </h4>
                      <p className="text-sm text-base-content/80 leading-relaxed">
                        Büyük ihtimalle Podo şu an <strong className="text-success">{lastEvent?.location}</strong> bölgesinde,
                        <strong className="text-error"> {primeSuspect?.displayName}</strong> ile birlikte bulunuyor.
                        Saha ekibi derhal yönlendirilmeli.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                {/* Event Distribution */}
                <div>
                  <h4 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-4">Olay Dağılımı</h4>
                  <div className="space-y-3">
                    {Object.entries(eventTypes).map(([type, count], i) => {
                      const percentage = (count / totalConnections) * 100;
                      return (
                        <div key={type} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium flex items-center gap-2 ${getTypeColor(type)}`}>
                              <span>{getTypeIcon(type)}</span>
                              {type}
                            </span>
                            <span className="font-mono text-sm text-base-content/50">{count}</span>
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

                {/* Secondary Suspects */}
                {secondarySuspects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-4">Diğer Bağlantılar</h4>
                    <div className="space-y-2">
                      {secondarySuspects.map((person, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 border border-base-content/5 hover:border-base-content/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-base-content/10 flex items-center justify-center text-sm">
                              {person.displayName.charAt(0)}
                            </div>
                            <span className="font-medium">{person.displayName}</span>
                          </div>
                          <span className="font-mono text-xs text-base-content/50 bg-base-content/5 px-2 py-1 rounded">
                            {person.events.length} olay
                          </span>
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
                <h4 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-4">Son Hareketler</h4>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-base-content/10" />

                  <div className="space-y-4">
                    {recentEvents.map((event, i) => (
                      <div
                        key={i}
                        className="relative flex gap-4 pl-10"
                      >
                        {/* Node */}
                        <div className={`absolute left-2 w-5 h-5 rounded-full border-2 border-base-300 flex items-center justify-center ${i === 0 ? 'bg-primary border-primary' : 'bg-base-200'
                          }`}>
                          {i === 0 && <div className="w-2 h-2 rounded-full bg-base-100" />}
                        </div>

                        {/* Content */}
                        <div className={`flex-1 p-4 rounded-xl border transition-colors ${i === 0
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-base-200/50 border-base-content/5'
                          }`}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={getTypeColor(event.type)}>{getTypeIcon(event.type)}</span>
                                <span className="font-semibold">{event.type}</span>
                              </div>
                              <p className="text-sm text-base-content/70">{event.location || 'Konum belirtilmedi'}</p>
                            </div>
                            <time className="text-xs text-base-content/40 font-mono whitespace-nowrap">
                              {new Date(event.timestamp).toLocaleString('tr-TR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </time>
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
              * Bu rapor mevcut verilerin algoritmik analizi ile üretilmiştir.
            </p>
            <form method="dialog">
              <button className="btn btn-sm btn-ghost hover:bg-base-content/5">
                Kapat
              </button>
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