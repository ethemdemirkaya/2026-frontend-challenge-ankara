import type { PersonRecord } from "../utils/investigation";

export const NetworkPanel = ({ person }: { person: PersonRecord }) => {
  const connectionCount = person.connections.size;
  
  return (
    <div className="space-y-6 animate-fade-in lg:sticky lg:top-8">
      <div className="card bg-base-100 shadow-xl border border-secondary/20">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔗</span>
            <h3 className="font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1 flex-1">İrtibat ve Bağlantılar</h3>
          </div>
          
          {connectionCount > 0 ? (
            <div className="flex flex-col gap-4">
              {Array.from(person.connections).map(c => (
                <div key={c} className="flex items-center gap-4 bg-base-200/50 p-3 rounded-xl border border-base-content/5 hover:border-secondary transition-colors cursor-pointer group">
                  <div className="avatar placeholder">
                    <div className="bg-secondary text-secondary-content rounded-full w-10">
                      <span>{c.substring(0,2).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm mb-1">{c}</h4>
                    <p className="text-[10px] opacity-60 uppercase tracking-wider">Sistem Eşleşmesi</p>
                  </div>
                  <div className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="alert alert-warning shadow-sm rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="text-[11px] font-medium leading-relaxed">Bu şahsın bilinen bir doğrudan bağlantısı tespit edilemedi. Gölgelerde hareket ediyor olabilir.</span>
             </div>
          )}
        </div>
      </div>

      <div className="card bg-neutral text-neutral-content shadow-xl border border-neutral-focus">
        <div className="card-body p-6">
          <h3 className="font-bold mb-4 uppercase tracking-widest text-xs opacity-70 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Dedektif Analizi
          </h3>
          <div className="text-sm leading-relaxed space-y-3">
            <p>
              Şüpheli <strong className="text-accent">{person.displayName}</strong> profili dosyalandı. Veritabanında <strong>{person.events.length}</strong> ayrı vaka kesişimi var.
            </p>
            {connectionCount > 0 ? (
               <p className="border-l-2 border-secondary pl-3 text-secondary-content/90 font-medium">
                  Ağ algoritması gösteriyor ki <span className="font-bold underline decoration-secondary underline-offset-4 cursor-pointer">{Array.from(person.connections)[0]}</span> kilit isim olabilir. Dosya derinleştirilmeli.
               </p>
            ) : (
               <p className="text-warning italic text-xs">Yalnız kurt profili izliyor. Kameralardan fiziki takip önerilir.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};