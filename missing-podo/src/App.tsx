import { useEffect, useState, useMemo } from "react";
import { fetchFormData } from "./services/api";
import { FORM_IDS } from "./config";
import { processAllData, calculateInvestigationStats, type PersonRecord, type TimelineEvent } from "./utils/investigation";
import { getAnkaraRegions, isPointInGeoJsonPolygon } from "./utils/regions";
import { getCoordsFromEvent } from "./utils/locations";

// Bileşenler
import { Sidebar } from "./components/Sidebar";
import { StatsHeader } from "./components/StatsHeader";
import { ProfileCard } from "./components/ProfileCard";
import { NetworkPanel } from "./components/NetworkPanel";
import { MapView } from "./components/MapView";
import { TimelineView } from "./components/TimelineView";
import { OverviewBoard } from "./components/OverviewBoard";
import { Footer } from "./components/Footer";
import { InvestigationReport } from "./components/InvestigationReport";
import { SpotlightSearch } from "./components/SpotlightSearch";

function App() {
  const [data, setData] = useState<any>(null);
  const [processed, setProcessed] = useState<{
    people: PersonRecord[], 
    timeline: TimelineEvent[],
    duplicates?: {sourceId: string, sourceName: string, targetId: string, targetName: string}[]
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mergePairs, setMergePairs] = useState<Record<string, string>>({});
  
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [triggerSearch, setTriggerSearch] = useState(false);

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

  useEffect(() => {
    if (data) {
      const results = processAllData(data, mergePairs);
      setProcessed(results);
    }
  }, [mergePairs, data]);

  const filteredPeople = useMemo(() => {
    let basePeople = processed?.people || [];

    // Region Filter: Keep people who have at least one reliably-located event inside the selected region
    if (selectedRegionId) {
      const regions = getAnkaraRegions();
      const region = regions.find(r => r.id === selectedRegionId);
      if (region && region.feature && region.feature.geometry) {
        const FALLBACK_LAT = 39.9208;
        const FALLBACK_LNG = 32.8541;
        basePeople = basePeople.filter(p => p.events.some(e => {
          if (!e.location && !e.coordinates) return false;
          try {
            // Use getCoordsFromEvent to prefer API exact coordinates
            const [lat, lng] = getCoordsFromEvent(e.location, e.coordinates);
            // Skip events that resolved to the generic fallback — they cannot be placed
            const isFallback = Math.abs(lat - FALLBACK_LAT) < 0.0001 && Math.abs(lng - FALLBACK_LNG) < 0.0001;
            if (isFallback) return false;
            return isPointInGeoJsonPolygon([lat, lng], region.feature.geometry);
          } catch(err) { return false; }
        }));
      }
    }

    // Text Search Filter: Name, Location, Content, EventType
    const query = searchTerm.toLowerCase();
    if (!query) return basePeople;

    return basePeople.filter(p => {
      if (p.displayName.toLowerCase().includes(query)) return true;
      return p.events.some(e => 
         e.location?.toLowerCase().includes(query) ||
         e.content?.toLowerCase().includes(query) ||
         e.type.toLowerCase().includes(query)
      );
    });
  }, [processed, searchTerm, selectedRegionId]);

  const selectedPerson = useMemo(() => {
    return processed?.people.find(p => p.id === selectedPersonId) || null;
  }, [processed, selectedPersonId]);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4 text-center bg-neutral text-neutral-content">
      <span className="loading loading-ring loading-lg mb-4 text-primary"></span>
      <h1 className="text-sm sm:text-xl tracking-[0.1em] sm:tracking-[0.3em] font-light uppercase break-words max-w-full">İstihbarat Ağına Bağlanılıyor</h1>
    </div>
  );

  const handlePinClick = (event: TimelineEvent) => {
    // Nếu event có relatedPerson và primaryPerson chính là người hiện tại, thì chuyển sang relatedPerson
    if (selectedPersonId && event.primaryPerson === selectedPersonId && event.relatedPerson) {
      setSelectedPersonId(event.relatedPerson);
    } else {
      setSelectedPersonId(event.primaryPerson);
    }
  };

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
          <div className="flex-1 font-bold uppercase tracking-widest text-sm flex items-center gap-4">
            The Ankara Case
            <button 
              onClick={() => setTriggerSearch(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1 bg-neutral-focus hover:bg-neutral-focus/80 rounded-lg border border-base-content/10 transition-colors cursor-pointer group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="text-[10px] opacity-60 group-hover:opacity-90">Akıllı Arama</span>
              <kbd className="kbd kbd-xs bg-base-300 border-none opacity-40">Ctrl K</kbd>
            </button>
          </div>
          <div className="flex-none md:hidden">
             <button onClick={() => setTriggerSearch(true)} className="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
             </button>
          </div>
        </div>

        <StatsHeader 
          totalEvents={processed?.timeline.length || 0} 
          totalPeople={processed?.people.length || 0} 
          totalSightings={processed?.timeline.filter(e => e.type === 'sighting').length || 0} 
          confidenceScore={processed ? calculateInvestigationStats(processed.people, processed.timeline).confidenceScore : 0}
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-16">
          {selectedPerson === null ? (
            <OverviewBoard 
               totalEvents={processed?.timeline.length || 0} 
               allEvents={processed?.timeline || []} 
               people={processed?.people || []}
               onPinClick={handlePinClick} 
               selectedRegionId={selectedRegionId}
               onRegionClick={setSelectedRegionId}
               duplicates={processed?.duplicates}
               onMerge={(source, target) => setMergePairs(prev => ({...prev, [source]: target}))}
            />
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
                      <MapView 
                        events={selectedPerson.events} 
                        onPinClick={handlePinClick} 
                        hoveredEventId={hoveredEventId}
                      />
                    </div>
                  </div>

                  <div className="card bg-base-100 shadow-xl rounded-2xl border border-base-content/10">
                    <div className="card-body p-4 lg:p-6">
                      <h3 className="font-bold mb-6 lg:mb-8 uppercase tracking-widest border-l-4 border-primary pl-4">Zaman Çizelgesi & Faaliyet Günlüğü</h3>
                      <TimelineView 
                        person={selectedPerson} 
                        allPeople={processed?.people || []} 
                        hoveredEventId={hoveredEventId}
                        onEventHover={setHoveredEventId}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Footer />
        <div className="fixed bottom-6 right-6 z-[100] animate-bounce hover:animate-none">
           <InvestigationReport processed={processed} />
        </div>
        <SpotlightSearch 
           people={processed?.people || []} 
           externalOpen={triggerSearch}
           setExternalOpen={setTriggerSearch}
           onSelect={(id) => {
             setSelectedPersonId(id);
             document.getElementById('investigation-drawer')?.click();
           }} 
        />
      </div>

      <div className="drawer-side z-[99]">
        <label htmlFor="investigation-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <Sidebar 
          people={filteredPeople} 
          selectedId={selectedPersonId} 
          onSelect={(id) => {
             setSelectedPersonId(id);
             document.getElementById('investigation-drawer')?.click();
          }} 
          onSearch={setSearchTerm} 
          onSpotlight={() => setTriggerSearch(true)}
        />
      </div>
    </div>
  );
}

export default App;