import type { PersonRecord } from "../utils/investigation";

export const ProfileCard = ({ person }: { person: PersonRecord }) => {
  return (
    <div className="card bg-base-100 shadow-xl rounded-none border-t-4 border-primary">
      <div className="card-body flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
        <div className="avatar placeholder">
          <div className="bg-neutral text-neutral-content w-24 h-24 uppercase font-bold text-3xl">
            {person.displayName.substring(0,2)}
          </div>
        </div>
        <div className="flex-1 w-full">
          <h2 className="card-title text-3xl sm:text-4xl font-black uppercase mb-1 break-words whitespace-normal">{person.displayName}</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mt-2">
            <div className="badge badge-outline rounded-none uppercase text-xs sm:text-sm p-4 sm:p-2">Durum: Aktif Soruşturma</div>
            <div className="badge badge-outline rounded-none font-bold uppercase text-xs sm:text-sm p-4 sm:p-2">
              Risk Seviyesi: {person.id === 'podo' ? 'HEDEF ŞAHIS' : (person.suspicionScore > 50 ? 'KRİTİK' : 'ORTA')}
            </div>
          </div>
        </div>
        {person.id !== 'podo' && (
          <div className="text-right">
            <div className="text-xs opacity-50 mb-1 uppercase font-bold tracking-widest">Şüphe Endeksi</div>
            <progress className="progress progress-primary w-56" value={person.suspicionScore} max="100"></progress>
            <div className="text-2xl font-black">%{person.suspicionScore}</div>
          </div>
        )}
      </div>
    </div>
  );
};