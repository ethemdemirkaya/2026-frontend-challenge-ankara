import type { PersonRecord } from "../utils/investigation";

export const NetworkPanel = ({ person }: { person: PersonRecord }) => {
  return (
    <div className="space-y-4">
      <div className="card bg-neutral text-neutral-content rounded-none p-4 shadow-sm">
        <h3 className="font-bold border-b border-neutral-content/20 pb-2 mb-4 uppercase">Tespit Edilen Ağ</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(person.connections).map(c => (
            <div key={c} className="badge badge-secondary rounded-sm">{c}</div>
          ))}
          {person.connections.size === 0 && <p className="text-xs opacity-50">Bilinen bir teması yok.</p>}
        </div>
      </div>

      <div className="card bg-base-100 rounded-none p-4 shadow-sm border border-base-content/10">
        <h3 className="font-bold border-b border-base-content/10 pb-2 mb-4 uppercase">Analiz Özeti</h3>
        <p className="text-xs leading-relaxed opacity-70">
          Şahsın veritabanımızda toplam {person.events.length} faaliyet kaydı bulunmaktadır. İletişim ağındaki en belirgin temas noktası olan <span className="font-bold">{Array.from(person.connections)[0] || 'bilinmeyen şahıslar'}</span> ile olan etkileşimleri, soruşturma için kilit rol oynayabilir.
        </p>
      </div>
    </div>
  );
};