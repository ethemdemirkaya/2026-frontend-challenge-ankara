import type { PersonRecord } from "../utils/investigation";

export const ProfileCard = ({ person }: { person: PersonRecord }) => {
  const getEstimation = () => {
    if (person.id === 'podo') {
      return "Bu kayıt, aranan ana hedefe (Kayıp Şahıs) aittir. Diğer tüm bağlantılar, bu hedefin etrafındaki iletişim ağından ve konum trafiğinden elde edilmiştir.";
    }
    if (person.suspicionScore > 50) {
      return `YÜKSEK RİSK: Bu seviye (${person.suspicionScore}%), kişinin diğer şüphelilerle olan geniş iletişim ağı (Tespit edilen bağlantı: ${person.connections.size}) ve muhtemel 'Hedef Şahıs' temaslarına dayanılarak hesaplanmıştır. Derhal sahada araştırılması önerilir.`;
    }
    return `OLAĞAN RİSK: Bu skor (${person.suspicionScore}%), operasyon içerisinde kısıtlı bağlantısı (${person.connections.size} kişi) olduğu ve kritik eşiği aşmadığı için verilmiştir. İzlemeye devam ediliyor.`;
  };

  return (
    <div className="card bg-base-100 shadow-2xl rounded-3xl border-t-8 border-primary overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      {/* ÜST KISIM */}
      <div className="card-body gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* AVATAR */}
          <div className="avatar placeholder indicator shrink-0">
            {person.suspicionScore > 75 && (
              <span className="indicator-item badge badge-error animate-ping" />
            )}
            <div className="bg-neutral text-neutral-content w-24 h-24 rounded-2xl uppercase font-bold text-3xl shadow-lg border-2 border-base-content/10 flex items-center justify-center">
              {person.displayName.substring(0, 2)}
            </div>
          </div>

          {/* ORTA KISIM - İsim ve Badge'ler */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h2 className="card-title text-3xl sm:text-4xl font-black uppercase tracking-wide">
              {person.displayName}
            </h2>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <div className="badge badge-primary badge-outline rounded-xl uppercase text-xs sm:text-sm px-4 py-3 shadow-sm">
                Durum: Aktif Soruşturma
              </div>
              <div
                className={`badge rounded-xl font-bold uppercase text-xs sm:text-sm px-4 py-3 shadow-sm text-white border-none ${person.id === 'podo'
                  ? 'bg-error'
                  : person.suspicionScore > 50
                    ? 'bg-orange-500'
                    : 'bg-success'
                  }`}
              >
                Risk Seviyesi:{' '}
                {person.id === 'podo'
                  ? 'HEDEF ŞAHIS'
                  : person.suspicionScore > 50
                    ? 'KRİTİK'
                    : 'ORTA'}
              </div>
            </div>
          </div>

          {/* SAĞ KISIM - Risk Endeksi */}
          {person.id !== 'podo' && (
            <div className="shrink-0 bg-base-200/50 p-4 rounded-2xl border border-base-content/5 text-center sm:text-right w-full sm:w-auto sm:min-w-[180px]">
              <div className="text-xs opacity-50 mb-2 uppercase font-bold tracking-widest text-primary">
                Şüphe Endeksi
              </div>
              <progress
                className="progress progress-primary w-full h-3"
                value={person.suspicionScore}
                max="100"
              />
              <div className="text-3xl font-black mt-1 text-base-content/90">
                %{person.suspicionScore}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ALT KISIM - Sistem Karar Özeti */}
      <div className="bg-base-200/50 px-8 py-5 border-t border-base-content/10">
        <h3 className="font-bold text-[10px] tracking-widest uppercase opacity-50 mb-2 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clipRule="evenodd"
            />
          </svg>
          Sistem Karar Özeti & Raporlama
        </h3>
        <p className="text-sm opacity-80 leading-relaxed max-w-4xl">
          {getEstimation()}
        </p>
      </div>
    </div>
  );
};