import { type TimelineEvent } from "../utils/investigation";
import { MapView } from "./MapView";

interface OverviewProps {
  totalEvents: number;
  allEvents: TimelineEvent[];
  onPinClick?: (id: string) => void;
}

export const OverviewBoard = ({ totalEvents, allEvents, onPinClick }: OverviewProps) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      
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
            <strong>Görev Talimatı:</strong> Sol taraftaki istihbarat havuzundan veya aşağıdaki <strong className="text-primary">Haritadan bir pine tıklayarak</strong> soruşturmayı derinleştirin.
          </p>
        </div>
      </div>

      {/* Tüm Ankara Haritası (Genel Görünüm) */}
      <div className="card bg-base-100 shadow-xl rounded-3xl border border-base-content/10">
        <div className="card-body p-6">
          <h3 className="font-bold mb-4 uppercase tracking-widest border-l-4 border-primary pl-4">Genel Saha Hareketliliği</h3>
          <p className="text-xs opacity-60 mb-4">Aşağıdaki harita, veritabanımızdaki tüm şahısların Ankara içerisindeki son bilinen konumlarını göstermektedir. Etkileşime geçmek için pinlere tıklayabilirsiniz.</p>
          <MapView events={allEvents} onPinClick={onPinClick} />
        </div>
      </div>
    </div>
  );
};