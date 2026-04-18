import { useEffect, useState, useMemo } from "react";
import { fetchFormData } from "./services/api";
import { FORM_IDS } from "./config";
import { processAllData, type PersonRecord, type TimelineEvent } from "./utils/investigation";

// Bileşenler
import { Sidebar } from "./components/Sidebar";
import { StatsHeader } from "./components/StatsHeader";
import { ProfileCard } from "./components/ProfileCard";
import { NetworkPanel } from "./components/NetworkPanel";
import { MapView } from "./components/MapView";
import { TimelineView } from "./components/TimelineView";
import { OverviewBoard } from "./components/OverviewBoard";
import { Footer } from "./components/Footer";

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
      } catch (err) {
        console.error("API Hatası:", err);
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
    return processed?.people.find(p => p.id === selectedPersonId) || null;
  }, [processed, selectedPersonId]);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-neutral text-neutral-content">
      <span className="loading loading-ring loading-lg mb-4 text-primary"></span>
      <h1 className="text-xl tracking-[0.3em] font-light uppercase">İstihbarat Ağına Bağlanılıyor</h1>
    </div>
  );

  return (
    <div className="drawer lg:drawer-open h-screen bg-base-300 font-sans text-sm">
      <input id="investigation-drawer" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col h-screen overflow-hidden relative">
        <div className="w-full navbar bg-neutral text-neutral-content lg:hidden shadow-md">
          <div className="flex-none">
            <label htmlFor="investigation-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
          <div className="flex-1 font-bold uppercase tracking-widest text-sm">
            The Ankara Case
          </div>
        </div>

        <StatsHeader 
          totalEvents={processed?.timeline.length || 0} 
          totalPeople={processed?.people.length || 0} 
          totalSightings={data?.sightings?.length || 0} 
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-16">
          {selectedPerson === null ? (
            <OverviewBoard totalEvents={processed?.timeline.length || 0} allEvents={processed?.timeline || []} onPinClick={(id) => setSelectedPersonId(id)} />
          ) : (
            <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8 animate-fade-in">
              <ProfileCard person={selectedPerson} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-1">
                  <NetworkPanel person={selectedPerson} />
                </div>

                <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                  <div className="card bg-base-100 shadow-xl rounded-2xl border border-base-content/10">
                    <div className="card-body p-4 lg:p-6">
                      <h3 className="font-bold mb-4 uppercase tracking-widest border-l-4 border-primary pl-4">Saha Operasyon Haritası</h3>
                      <MapView events={selectedPerson.events} onPinClick={(id) => setSelectedPersonId(id)} />
                    </div>
                  </div>

                  <div className="card bg-base-100 shadow-xl rounded-2xl border border-base-content/10">
                    <div className="card-body p-4 lg:p-6">
                      <h3 className="font-bold mb-6 lg:mb-8 uppercase tracking-widest border-l-4 border-primary pl-4">Zaman Çizelgesi & Faaliyet Günlüğü</h3>
                      <TimelineView person={selectedPerson} allPeople={processed?.people || []} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Footer />
      </div>

      <div className="drawer-side z-50">
        <label htmlFor="investigation-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <Sidebar 
          people={filteredPeople} 
          selectedId={selectedPersonId} 
          onSelect={(id) => {
             setSelectedPersonId(id);
             document.getElementById('investigation-drawer')?.click();
          }} 
          onSearch={setSearchTerm} 
        />
      </div>
    </div>
  );
}

export default App;