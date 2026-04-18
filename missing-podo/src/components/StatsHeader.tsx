import { useState } from "react";

interface StatsHeaderProps {
  totalEvents: number;
  totalPeople: number;
  totalSightings: number;
}

export const StatsHeader = ({ totalEvents, totalPeople, totalSightings }: StatsHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-base-300 shadow-sm border-b border-base-content/10 z-10 relative">
      <div className={`collapse rounded-none ${isOpen ? 'collapse-open' : 'collapse-close'}`}>
        <div 
           className="collapse-title text-center text-[10px] sm:text-xs font-bold tracking-widest uppercase opacity-70 p-2 min-h-0 cursor-pointer hover:bg-base-200 transition-colors"
           onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '▴ İSTİHBARAT ÖZETİNİ GİZLE ▴' : '▾ İSTİHBARAT ÖZETİNİ GÖSTER ▾'}
        </div>
        <div className="collapse-content p-0 border-t border-base-content/5">
          <div className="p-4 sm:p-6 bg-base-200/50 backdrop-blur">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">

              {/* Toplam İstihbarat */}
              <div className="card bg-base-100 shadow-xl border border-base-content/5 transition-all hover:border-primary hover:-translate-y-1 group">
                <div className="card-body p-4 flex-row items-center gap-3 sm:gap-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-2xl group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-content transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] uppercase font-bold opacity-60 tracking-wider">Toplam İstihbarat</div>
                    <div className="text-2xl sm:text-3xl font-black text-base-content/90">{totalEvents}</div>
                  </div>
                </div>
              </div>

              {/* Tespit Edilen Şahıslar */}
              <div className="card bg-base-100 shadow-xl border border-base-content/5 transition-all hover:border-secondary hover:-translate-y-1 group">
                <div className="card-body p-4 flex-row items-center gap-3 sm:gap-4">
                  <div className="bg-secondary/10 text-secondary p-3 rounded-2xl group-hover:scale-110 group-hover:bg-secondary group-hover:text-secondary-content transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] uppercase font-bold opacity-60 tracking-wider">Tespit Edilen Şahıslar</div>
                    <div className="text-2xl sm:text-3xl font-black text-base-content/90">{totalPeople}</div>
                  </div>
                </div>
              </div>

              {/* Podo Görülme Vakası */}
              <div className="card bg-base-100 shadow-xl border border-base-content/5 transition-all hover:border-error hover:-translate-y-1 group">
                <div className="card-body p-4 flex-row items-center gap-3 sm:gap-4">
                  <div className="bg-error/10 text-error p-3 rounded-2xl group-hover:scale-110 group-hover:bg-error group-hover:text-error-content transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] uppercase font-bold opacity-60 tracking-wider">Podo Görülme Vakası</div>
                    <div className="text-2xl sm:text-3xl font-black text-base-content/90">{totalSightings}</div>
                  </div>
                </div>
              </div>

              {/* Veri Güvenilirliği */}
              <div className="card bg-base-100 shadow-xl border border-base-content/5 transition-all hover:border-info hover:-translate-y-1 group">
                <div className="card-body p-4 flex-row items-center gap-3 sm:gap-4">
                  <div className="bg-info/10 text-info p-3 rounded-2xl group-hover:scale-110 group-hover:bg-info group-hover:text-info-content transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] uppercase font-bold opacity-60 tracking-wider tooltip tooltip-top" data-tip="Hesaplanan Doğruluk Payı">Tahmini Doğruluk Oranı</div>
                    <div className="text-2xl sm:text-3xl font-black text-base-content/90">%84</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};