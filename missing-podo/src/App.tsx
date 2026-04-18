import { useEffect, useState } from "react";
import { fetchFormData } from "./services/api";
import { FORM_IDS } from "./config";

interface InvestigationData {
  checkins: any[];
  messages: any[];
  sightings: any[];
  personalNotes: any[];
  anonymousTips: any[];
}

function App() {
  const [data, setData] = useState<InvestigationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("checkins");

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [
          checkins,
          messages,
          sightings,
          personalNotes,
          anonymousTips,
        ] = await Promise.all([
          fetchFormData(FORM_IDS.checkins),
          fetchFormData(FORM_IDS.messages),
          fetchFormData(FORM_IDS.sightings),
          fetchFormData(FORM_IDS.personalNotes),
          fetchFormData(FORM_IDS.anonymousTips),
        ]);

        setData({
          checkins,
          messages,
          sightings,
          personalNotes,
          anonymousTips,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load investigation data.");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-base-200">
        <div className="flex flex-col items-center gap-6">
          <span className="loading loading-bars loading-lg text-primary"></span>
          <p className="text-lg font-medium text-base-content/70">Connecting to Jotform servers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-base-200 p-4">
        <div className="alert alert-error max-w-lg shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <h3 className="font-bold">Connection Error</h3>
            <div className="text-xs">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="investigation-drawer" type="checkbox" className="drawer-toggle" />
      
      {/* Main Content */}
      <div className="drawer-content flex flex-col bg-base-200 min-h-screen">
        
        {/* Top Navbar */}
        <div className="navbar bg-base-100 border-b border-base-300 px-4 lg:px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex-none lg:hidden">
            <label htmlFor="investigation-drawer" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
          <div className="flex-1">
            <h1 className="text-lg lg:text-xl font-bold uppercase tracking-wide">The Ankara Case</h1>
          </div>
          <div className="flex-none gap-2">
            <div className="form-control">
              <input type="text" placeholder="Search records..." className="input input-bordered input-sm w-32 md:w-64" />
            </div>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-8">
                  <span className="text-xs">INV</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Dashboard Body */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Investigation Overview</h2>
            <p className="text-base-content/70">Review the collected data to trace the chain of Podo's last sightings.</p>
          </div>

          {/* Stats Component - Fully Responsive */}
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-8 bg-base-100">
            <div className="stat">
              <div className="stat-title">Check-ins</div>
              <div className="stat-value text-primary">{data?.checkins.length || 0}</div>
              <div className="stat-desc">Locations recorded</div>
            </div>
            <div className="stat">
              <div className="stat-title">Messages</div>
              <div className="stat-value text-secondary">{data?.messages.length || 0}</div>
              <div className="stat-desc">Intercepted communications</div>
            </div>
            <div className="stat">
              <div className="stat-title">Sightings</div>
              <div className="stat-value text-accent">{data?.sightings.length || 0}</div>
              <div className="stat-desc">Eyewitness reports</div>
            </div>
            <div className="stat">
              <div className="stat-title">Tips & Notes</div>
              <div className="stat-value">{(data?.personalNotes.length || 0) + (data?.anonymousTips.length || 0)}</div>
              <div className="stat-desc">Additional intelligence</div>
            </div>
          </div>

          {/* Data Explorer Section */}
          <div className="card bg-base-100 shadow-sm w-full">
            <div className="card-body p-0">
              {/* Tabs for Data Categories */}
              <div className="tabs tabs-bordered pt-4 px-4">
                <button className={`tab tab-lg ${activeTab === 'checkins' ? 'tab-active font-bold' : ''}`} onClick={() => setActiveTab('checkins')}>Check-ins</button>
                <button className={`tab tab-lg ${activeTab === 'messages' ? 'tab-active font-bold' : ''}`} onClick={() => setActiveTab('messages')}>Messages</button>
                <button className={`tab tab-lg ${activeTab === 'sightings' ? 'tab-active font-bold' : ''}`} onClick={() => setActiveTab('sightings')}>Sightings</button>
              </div>

              {/* Data Table Area */}
              <div className="overflow-x-auto p-4">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Timestamp</th>
                      <th>Data Output (Raw)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Placeholder map to verify data structure */}
                    {data && data[activeTab as keyof InvestigationData].slice(0, 5).map((record, index) => (
                      <tr key={record.id || index}>
                        <td className="font-mono text-xs opacity-70">{record.id}</td>
                        <td className="whitespace-nowrap">{new Date(record.created_at).toLocaleString()}</td>
                        <td className="w-full max-w-xs truncate">{JSON.stringify(record)}</td>
                        <td>
                          <button 
                            className="btn btn-xs btn-outline"
                            onClick={() => console.log(record)}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data && data[activeTab as keyof InvestigationData].length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-base-content/50">No records found for this category.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="card-actions justify-end p-4 border-t border-base-200">
                <span className="text-xs text-base-content/50">Showing top 5 records. Check console for full object structure.</span>
              </div>
            </div>
          </div>

        </main>
      </div> 

      {/* Sidebar / Drawer */}
      <div className="drawer-side z-20">
        <label htmlFor="investigation-drawer" className="drawer-overlay"></label> 
        <div className="w-72 min-h-full bg-base-100 border-r border-base-300 flex flex-col">
          <div className="p-4 border-b border-base-300 h-16 flex items-center">
            <span className="font-bold text-lg tracking-widest">DASHBOARD</span>
          </div>
          <ul className="menu p-4 flex-1 gap-2">
            <li>
              <h2 className="menu-title">Data Sources</h2>
              <ul>
                <li><a className="active">Database Records</a></li>
                <li><a>Entity Extraction</a></li>
              </ul>
            </li>
            <li>
              <h2 className="menu-title">Investigation Tools</h2>
              <ul>
                <li><a>Suspect Profiling</a></li>
                <li><a>Location Map</a></li>
                <li><a>Timeline Reconstruction</a></li>
              </ul>
            </li>
          </ul>
          <div className="p-4 border-t border-base-300 text-xs text-center text-base-content/50">
            Secure Connection Established
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;