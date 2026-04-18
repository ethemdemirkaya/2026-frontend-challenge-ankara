import { useEffect, useState, useMemo } from "react";
import { fetchFormData } from "./services/api";
import { FORM_IDS } from "./config";
import { processAllData, type PersonRecord, type TimelineEvent } from "./utils/investigation";

// Bileşenleri İçe Aktarıyoruz
import { Sidebar } from "./components/Sidebar";
import { StatsHeader } from "./components/StatsHeader";
import { ProfileCard } from "./components/ProfileCard";
import { NetworkPanel } from "./components/NetworkPanel";
import { MapView } from "./components/MapView";
import { TimelineView } from "./components/TimelineView";

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
      
      <Sidebar 
        people={filteredPeople} 
        selectedId={selectedPersonId} 
        onSelect={setSelectedPersonId} 
        onSearch={setSearchTerm} 
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <StatsHeader 
          totalEvents={processed?.timeline.length || 0} 
          totalPeople={processed?.people.length || 0} 
          totalSightings={data?.sightings?.length || 0} 
        />

        <div className="flex-1 overflow-y-auto p-8">
          {selectedPerson && (
            <div className="max-w-5xl mx-auto space-y-8">
              
              <ProfileCard person={selectedPerson} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-1">
                  <NetworkPanel person={selectedPerson} />
                </div>

                <div className="lg:col-span-2 space-y-8">
                  
                  <div className="bg-base-100 p-6 shadow-sm border border-base-content/10">
                    <h3 className="font-bold mb-4 uppercase tracking-widest border-l-4 border-primary pl-4">Saha Operasyon Haritası</h3>
                    <MapView events={selectedPerson.events} />
                  </div>

                  <div className="bg-base-100 p-6 shadow-sm border border-base-content/10">
                    <h3 className="font-bold mb-8 uppercase tracking-widest border-l-4 border-primary pl-4">Zaman Çizelgesi & Faaliyet Günlüğü</h3>
                    <TimelineView person={selectedPerson} allPeople={processed?.people || []} />
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