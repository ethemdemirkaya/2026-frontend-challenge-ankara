import { useEffect, useState, useMemo } from "react";
import { fetchFormData } from "./services/api";
import { FORM_IDS } from "./config";
import { processAllData, type PersonRecord, type TimelineEvent } from "./utils/investigation";

function App() {
  const [data, setData] = useState<any>(null);
  const [processed, setProcessed] = useState<{people: PersonRecord[], timeline: TimelineEvent[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const [checkins, messages, sightings, notes, tips] = await Promise.all([
          fetchFormData(FORM_IDS.checkins),
          fetchFormData(FORM_IDS.messages),
          fetchFormData(FORM_IDS.sightings),
          fetchFormData(FORM_IDS.personalNotes),
          fetchFormData(FORM_IDS.anonymousTips),
        ]);
        const allRaw = { checkins, messages, sightings, notes, tips };
        const results = processAllData(allRaw);
        setData(allRaw);
        setProcessed(results);
        setSelectedPersonId('podo');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const filteredPeople = useMemo(() => {
    return processed?.people.filter(p => p.displayName.toLowerCase().includes(searchTerm.toLowerCase())) || [];
  }, [processed, searchTerm]);

  const selectedPerson = useMemo(() => {
    return processed?.people.find(p => p.id === selectedPersonId);
  }, [processed, selectedPersonId]);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-neutral text-neutral-content">
      <span className="loading loading-ring loading-lg mb-4"></span>
      <h1 className="text-xl tracking-[0.3em] font-light uppercase">İstihbarat Verileri Analiz Ediliyor</h1>
    </div>
  );

  return (
    <div className="flex h-screen bg-base-300 font-mono text-sm overflow-hidden">
      
      {/* Sol Panel: Şüpheli Listesi */}
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          <div className="menu w-full p-0">
            {filteredPeople.map(p => (
              <button 
                key={p.id}
                onClick={() => setSelectedPersonId(p.id)}
                className={`flex items-center gap-4 p-3 mb-1 transition-all border-l-4 ${selectedPersonId === p.id ? 'bg-base-200 border-primary' : 'border-transparent hover:bg-base-200'}`}
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
            {filteredPeople.length === 0 && (
              <div className="p-4 text-center text-xs opacity-50">Eşleşen şahıs bulunamadı.</div>
            )}
          </div>
        </div>
      </aside>

      {/* Ana Panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* İstatistik Başlığı */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-base-100/50 border-b border-base-content/5">
          <div className="stats shadow bg-base-100 rounded-none">
            <div className="stat p-3">
              <div className="stat-title text-[10px] uppercase">Toplam İstihbarat</div>
              <div className="stat-value text-xl">{processed?.timeline.length}</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100 rounded-none">
            <div className="stat p-3">
              <div className="stat-title text-[10px] uppercase">Tespit Edilen Şahıslar</div>
              <div className="stat-value text-xl">{processed?.people.length}</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100 rounded-none">
            <div className="stat p-3">
              <div className="stat-title text-[10px] uppercase">Podo Görülme Vakası</div>
              <div className="stat-value text-xl text-primary">{data.sightings.length}</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100 rounded-none">
            <div className="stat p-3">
              <div className="stat-title text-[10px] uppercase">Veri Güvenilirliği</div>
              <div className="stat-value text-xl">%84</div>
            </div>
          </div>
        </div>

        {/* İçerik Alanı */}
        <div className="flex-1 overflow-y-auto p-8">
          {selectedPerson && (
            <div className="max-w-5xl mx-auto space-y-8">
              
              {/* Profil Kartı */}
              <div className="card bg-base-100 shadow-xl rounded-none border-t-4 border-primary">
                <div className="card-body flex-row items-center gap-8">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content w-24 h-24 uppercase font-bold text-3xl">
                      {selectedPerson.displayName.substring(0,2)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="card-title text-4xl font-black uppercase mb-1">{selectedPerson.displayName}</h2>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="badge badge-outline rounded-none uppercase">Durum: Aktif Soruşturma</div>
                      <div className="badge badge-outline rounded-none font-bold uppercase">
                        Risk Seviyesi: {selectedPerson.id === 'podo' ? 'HEDEF ŞAHIS' : (selectedPerson.suspicionScore > 50 ? 'KRİTİK' : 'ORTA')}
                      </div>
                    </div>
                  </div>
                  {selectedPerson.id !== 'podo' && (
                    <div className="text-right">
                      <div className="text-xs opacity-50 mb-1 uppercase font-bold tracking-widest">Şüphe Endeksi</div>
                      <progress className="progress progress-primary w-56" value={selectedPerson.suspicionScore} max="100"></progress>
                      <div className="text-2xl font-black">%{selectedPerson.suspicionScore}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detay Sekmeleri */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Sol Sütun: Bağlantılar ve Notlar */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="card bg-neutral text-neutral-content rounded-none p-4 shadow-sm">
                    <h3 className="font-bold border-b border-neutral-content/20 pb-2 mb-4 uppercase">Tespit Edilen Ağ</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedPerson.connections).map(c => (
                        <div key={c} className="badge badge-secondary rounded-none">{c}</div>
                      ))}
                      {selectedPerson.connections.size === 0 && <p className="text-xs opacity-50">Bilinen bir teması yok.</p>}
                    </div>
                  </div>
                  
                  <div className="card bg-base-100 rounded-none p-4 shadow-sm border border-base-content/10">
                    <h3 className="font-bold border-b border-base-content/10 pb-2 mb-4 uppercase">Analiz Özeti</h3>
                    <p className="text-xs leading-relaxed opacity-70">
                      Şahsın veritabanımızda toplam {selectedPerson.events.length} faaliyet kaydı bulunmaktadır. İletişim ağındaki en belirgin temas noktası olan <span className="font-bold">{Array.from(selectedPerson.connections)[0] || 'bilinmeyen şahıslar'}</span> ile olan etkileşimleri, hedef Podo'nun son rotasını belirlemek adına kilit rol oynayabilir.
                    </p>
                  </div>
                </div>

                {/* Sağ Sütun: Zaman Çizelgesi (Timeline) */}
                <div className="lg:col-span-2">
                  <div className="bg-base-100 p-6 shadow-sm border border-base-content/10">
                    <h3 className="font-bold mb-8 uppercase tracking-widest border-l-4 border-primary pl-4">Zaman Çizelgesi & Faaliyet Günlüğü</h3>
                    
                    <ul className="timeline timeline-vertical timeline-compact">
                      {selectedPerson.events.map((e, idx) => (
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
                                   e.type === 'message' ? `İletişim Kuruldu: ${processed?.people.find(p => p.id === e.relatedPerson)?.displayName || 'Bilinmiyor'}` : 
                                   `Birlikte Görüldü: ${processed?.people.find(p => p.id === e.relatedPerson)?.displayName || 'Bilinmiyor'}`}
                                </div>
                                <p className="text-xs opacity-60 italic">{e.content || 'İçerik verisine ulaşılamadı.'}</p>
                              </div>
                              <div className="badge badge-xs badge-neutral rounded-none uppercase tracking-wider">{e.type}</div>
                            </div>
                          </div>
                          {idx !== selectedPerson.events.length - 1 && <hr className="bg-base-content/10"/>}
                        </li>
                      ))}
                    </ul>
                    {selectedPerson.events.length === 0 && (
                      <div className="text-center opacity-50 py-10">Bu şahsa ait kronolojik faaliyet bulunmuyor.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;