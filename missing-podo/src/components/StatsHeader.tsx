import { useState, useEffect } from "react";

interface StatsHeaderProps {
  totalEvents: number;
  totalPeople: number;
  totalSightings: number;
}

export const StatsHeader = ({ totalEvents, totalPeople, totalSightings }: StatsHeaderProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Mobil görünümde varsayılan olarak kapalı tut
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, []);

  return (
    <div className="bg-base-100 border-b border-base-content/5 z-10 w-full">
      <div className={`collapse collapse-arrow rounded-none ${isOpen ? 'collapse-open' : 'collapse-close'}`}>
        <input type="checkbox" checked={isOpen} onChange={() => setIsOpen(!isOpen)} /> 
        <div className="collapse-title text-sm font-medium uppercase tracking-widest bg-base-200 lg:hidden p-4">
          <div className="flex gap-2 items-center">
            {isOpen ? 'İstatistikleri Gizle' : 'Toplam İstihbarat İstatistiklerini Göster'} 
          </div>
        </div>
        <div className="collapse-content p-0 lg:p-0">
          <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-base-100/50">
            <div className="stats shadow bg-base-100 rounded-none border border-base-content/5 hover:border-primary transition-colors">
              <div className="stat p-3">
                <div className="stat-title text-[10px] uppercase font-bold opacity-70">Toplam İstihbarat</div>
                <div className="stat-value text-xl">{totalEvents}</div>
              </div>
            </div>
            <div className="stats shadow bg-base-100 rounded-none border border-base-content/5 hover:border-primary transition-colors">
              <div className="stat p-3">
                <div className="stat-title text-[10px] uppercase font-bold opacity-70">Tespit Edilen Şahıslar</div>
                <div className="stat-value text-xl">{totalPeople}</div>
              </div>
            </div>
            <div className="stats shadow bg-base-100 rounded-none border border-base-content/5 hover:border-primary transition-colors">
              <div className="stat p-3">
                <div className="stat-title text-[10px] uppercase font-bold opacity-70">Podo Görülme Vakası</div>
                <div className="stat-value text-xl text-primary">{totalSightings}</div>
              </div>
            </div>
            <div className="stats shadow bg-base-100 rounded-none border border-base-content/5 hover:border-primary transition-colors">
              <div className="stat p-3">
                <div className="stat-title text-[10px] uppercase font-bold opacity-70">Veri Güvenilirliği</div>
                <div className="stat-value text-xl tooltip tooltip-bottom" data-tip="Hesaplanan Doğruluk Payı">%84</div>
                <div className="stat-desc mt-1">Tahmini Doğruluk Oranı</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};