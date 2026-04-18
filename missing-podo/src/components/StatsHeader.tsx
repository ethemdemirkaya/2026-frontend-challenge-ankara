interface StatsHeaderProps {
  totalEvents: number;
  totalPeople: number;
  totalSightings: number;
}

export const StatsHeader = ({ totalEvents, totalPeople, totalSightings }: StatsHeaderProps) => {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-base-100/50 border-b border-base-content/5">
      <div className="stats shadow bg-base-100 rounded-none">
        <div className="stat p-3">
          <div className="stat-title text-[10px] uppercase">Toplam İstihbarat</div>
          <div className="stat-value text-xl">{totalEvents}</div>
        </div>
      </div>
      <div className="stats shadow bg-base-100 rounded-none">
        <div className="stat p-3">
          <div className="stat-title text-[10px] uppercase">Tespit Edilen Şahıslar</div>
          <div className="stat-value text-xl">{totalPeople}</div>
        </div>
      </div>
      <div className="stats shadow bg-base-100 rounded-none">
        <div className="stat p-3">
          <div className="stat-title text-[10px] uppercase">Podo Görülme Vakası</div>
          <div className="stat-value text-xl text-primary">{totalSightings}</div>
        </div>
      </div>
      <div className="stats shadow bg-base-100 rounded-none">
        <div className="stat p-3">
          <div className="stat-title text-[10px] uppercase">Veri Güvenilirliği</div>
          <div className="stat-value text-xl">%84</div>
        </div>
      </div>
    </div>
  );
};