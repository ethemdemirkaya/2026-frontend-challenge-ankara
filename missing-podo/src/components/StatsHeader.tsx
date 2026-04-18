import { useState } from "react";
import { Database, Users, Eye, ShieldCheck, ChevronUp, ChevronDown } from "lucide-react";

interface StatsHeaderProps {
  totalEvents: number;
  totalPeople: number;
  totalSightings: number;
}

export const StatsHeader = ({ totalEvents, totalPeople, totalSightings }: StatsHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const StatsContent = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
      {/* Toplam İstihbarat */}
      <div className="card bg-base-100 shadow-xl border border-base-content/5 transition-all cursor-default hover:border-primary hover:-translate-y-1 group">
        <div className="card-body p-4 flex-row items-center gap-3 sm:gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-2xl group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-content transition-all shadow-sm">
            <Database className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold opacity-60 tracking-wider">Toplam İstihbarat</div>
            <div className="text-2xl sm:text-3xl font-black text-base-content/90">{totalEvents}</div>
          </div>
        </div>
      </div>

      {/* Tespit Edilen Şahıslar */}
      <div className="card bg-base-100 shadow-xl border border-base-content/5 transition-all cursor-default hover:border-secondary hover:-translate-y-1 group">
        <div className="card-body p-4 flex-row items-center gap-3 sm:gap-4">
          <div className="bg-secondary/10 text-secondary p-3 rounded-2xl group-hover:scale-110 group-hover:bg-secondary group-hover:text-secondary-content transition-all shadow-sm">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold opacity-60 tracking-wider">Tespit Edilen Şahıslar</div>
            <div className="text-2xl sm:text-3xl font-black text-base-content/90">{totalPeople}</div>
          </div>
        </div>
      </div>

      {/* Podo Görülme Vakası */}
      <div className="card bg-base-100 shadow-xl border border-base-content/5 transition-all cursor-default hover:border-error hover:-translate-y-1 group">
        <div className="card-body p-4 flex-row items-center gap-3 sm:gap-4">
          <div className="bg-error/10 text-error p-3 rounded-2xl group-hover:scale-110 group-hover:bg-error group-hover:text-error-content transition-all shadow-sm">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold opacity-60 tracking-wider">Podo Görülme Vakası</div>
            <div className="text-2xl sm:text-3xl font-black text-base-content/90">{totalSightings}</div>
          </div>
        </div>
      </div>

      {/* Veri Güvenilirliği */}
      <div className="card bg-base-100 shadow-xl border border-base-content/5 transition-all cursor-default hover:border-info hover:-translate-y-1 group">
        <div className="card-body p-4 flex-row items-center gap-3 sm:gap-4">
          <div className="bg-info/10 text-info p-3 rounded-2xl group-hover:scale-110 group-hover:bg-info group-hover:text-info-content transition-all shadow-sm">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold opacity-60 tracking-wider tooltip tooltip-top" data-tip="Hesaplanan Doğruluk Payı">Tahmini Doğruluk Oranı</div>
            <div className="text-2xl sm:text-3xl font-black text-base-content/90">%84</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-base-300 shadow-sm border-b border-base-content/10 z-10 relative">
      <div className="hidden md:block p-4 sm:p-6 bg-base-200/50 backdrop-blur">
        <StatsContent />
      </div>
      <div className={`md:hidden collapse rounded-none ${isOpen ? 'collapse-open' : 'collapse-close'}`}>
        <div
          className="collapse-title text-center text-[10px] sm:text-xs font-bold tracking-widest uppercase opacity-70 p-2 min-h-0 cursor-pointer hover:bg-base-200 transition-colors flex items-center justify-center gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {isOpen ? 'İSTİHBARAT ÖZETİNİ GİZLE' : 'İSTİHBARAT ÖZETİNİ GÖSTER'}
        </div>
        <div className="collapse-content p-0 border-t border-base-content/5">
          <div className="p-4 bg-base-200/50 backdrop-blur">
            <StatsContent />
          </div>
        </div>
      </div>
    </div>
  );
};