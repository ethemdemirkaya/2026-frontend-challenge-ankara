import { type TimelineEvent, type PersonRecord } from "../utils/investigation";
import { MapView } from "./MapView";
import { NetworkGraphView } from "./NetworkGraphView";

interface OverviewProps {
  totalEvents: number;
  allEvents: TimelineEvent[];
  people: PersonRecord[];
  onPinClick?: (event: TimelineEvent) => void;
  selectedRegionId?: string | null;
  onRegionClick?: (id: string | null) => void;
  duplicates?: {sourceId: string, sourceName: string, targetId: string, targetName: string}[];
  onMerge?: (sourceId: string, targetId: string) => void;
}

export const OverviewBoard = ({ totalEvents, allEvents, people, onPinClick, selectedRegionId, onRegionClick, duplicates, onMerge }: OverviewProps) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {duplicates && duplicates.length > 0 && (
        <div className="alert bg-warning/20 border border-warning/50 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div className="flex-1">
            <h3 className="font-bold text-sm tracking-widest uppercase">Dedektif Yapay Zeka Uyarısı: Olası Veri Tekrarı</h3>
            <p className="text-xs mt-1">Sistem, birden fazla kaydın aynı kişiye ait olabileceğini tespit etti. Bunu mu demek istediniz?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {duplicates.map((dup, i) => (
                 <div key={i} className="flex items-center gap-2 bg-base-100 p-2 rounded border border-base-300">
                    <span className="font-bold text-xs">{dup.sourceName}</span>
                    <span className="text-xs opacity-50">vs</span>
                    <span className="font-bold text-xs">{dup.targetName}</span>
                    <button 
                       className="btn btn-xs btn-primary ml-2" 
                       onClick={() => onMerge && onMerge(dup.sourceId, dup.targetId)}
                    >
                       Eşleştir (Birleştir)
                    </button>
                 </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Vaka Özeti */}
      <div className="card bg-base-100 shadow-2xl rounded-3xl border border-error/20 overflow-hidden">
        <div className="card-body relative z-10 bg-gradient-to-br from-error/10 to-transparent">
          <h2 className="card-title text-3xl font-black uppercase text-error">Vaka Bildirimi: Kayıp Podo</h2>
          <p className="text-base-content/80 leading-relaxed mt-2 text-justify">
            Ankara'da gerçekleşen büyük bir etkinliğin ardından hedef şahıs <strong className="text-primary">Podo</strong>, farklı lokasyonlarda çeşitli şahıslarla birlikte görülmüş ve ardından tamamen ortadan kaybolmuştur. Elimizdeki istihbarat verileri (Check-in kayıtları, kesilen iletişim mesajları, saha gözlemleri ve kişisel notlar) parçalı ve dağınıktır.
          </p>
          <p className="text-base-content/80 leading-relaxed text-justify">
            Bu sistem; dağınık haldeki {totalEvents} adet veri kaydını analiz ederek ilişkileri ortaya çıkarmak, Podo'nun son rotasını haritalandırmak ve iletişim ağındaki en şüpheli kişileri tespit etmek amacıyla oluşturulmuştur. 
            <br/><br/>
            <strong>Görev Talimatı:</strong> Sol taraftaki istihbarat havuzundan veya aşağıdaki <strong className="text-primary">Haritadan bir pine/bölgeye tıklayarak</strong> aramayı sınırlandırıp soruşturmayı derinleştirin.
          </p>
        </div>
      </div>

      {/* Tüm Ankara Haritası (Genel Görünüm) */}
      <div className="card bg-base-100 shadow-xl rounded-3xl border border-base-content/10">
        <div className="card-body p-6">
          <h3 className="font-bold mb-4 uppercase tracking-widest border-l-4 border-primary pl-4 flex items-center justify-between">
            Genel Saha Hareketliliği
            {selectedRegionId && <span className="badge badge-primary badge-outline text-[10px] animate-pulse">Bölgesel Filtre Aktif</span>}
          </h3>
          <p className="text-xs opacity-60 mb-4">Haritadaki renkli poligon bölgelerine tıklayarak aramayı daraltabilir veya doğrudan pinlere basarak şüphelileri inceleyebilirsiniz.</p>
          <MapView 
            events={allEvents} 
            onPinClick={onPinClick} 
            showRegions={true} 
            selectedRegionId={selectedRegionId} 
            onRegionClick={onRegionClick} 
            useFlyTo={true}
          />
        </div>
      </div>

      {/* Ağ Bağlantı Grafiği (Force Graph) */}
      {people && people.length > 0 && (
        <div className="card bg-base-100 shadow-xl rounded-3xl border border-base-content/10 mt-8">
          <div className="card-body p-6">
            <h3 className="font-bold mb-4 uppercase tracking-widest border-l-4 border-secondary pl-4">
              Kapsamlı Ağ Analizi (Sistem Bağlantıları)
            </h3>
            <p className="text-xs opacity-60 mb-4">Şüphelilerin birbiriyle olan tüm iletişim ve ortak lokasyon bağlantıları aşağıda görselleştirilmiştir. İncelemek istediğiniz kişinin düğümüne tıklayabilirsiniz.</p>
            <div className="w-full h-[600px] bg-neutral rounded-2xl overflow-hidden shadow-inner relative">
               <NetworkGraphView people={people} onPersonClick={(id) => onPinClick && onPinClick({ primaryPerson: id } as any)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};