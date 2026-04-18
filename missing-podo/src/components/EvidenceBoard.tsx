import { type TimelineEvent } from "../utils/investigation";
import { Pin, X, Clock, MapPin, MessageSquare, Eye, FileText, AlertTriangle } from "lucide-react";

interface EvidenceBoardProps {
  items: TimelineEvent[];
  onRemove: (event: TimelineEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceBoard = ({ items, onRemove, isOpen, onClose }: EvidenceBoardProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sighting': return <Eye className="w-4 h-4 text-error" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-info" />;
      case 'checkin': return <MapPin className="w-4 h-4 text-primary" />;
      case 'note': return <FileText className="w-4 h-4 text-neutral" />;
      case 'tip': return <AlertTriangle className="w-4 h-4 text-warning" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-base-100 shadow-2xl z-[150] border-l border-base-content/10 flex flex-col animate-slide-in print:hidden">
      <div className="p-4 bg-primary text-primary-content flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <Pin className="w-5 h-5 fill-current" />
          <h2 className="font-bold uppercase tracking-widest text-sm">Kanıt Tahtası</h2>
          <span className="badge badge-sm badge-outline text-[10px]">{items.length}</span>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
            <Pin className="w-12 h-12" />
            <p className="text-xs uppercase tracking-tighter">Henüz kanıt iğnelenmedi.<br/>Zaman çizelgesindeki iğne ikonlarını kullanın.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="card bg-base-200 shadow-sm border border-base-content/5 relative group animate-fade-in">
              <button 
                onClick={() => onRemove(item)}
                className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="card-body p-3">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(item.type)}
                  <div className="text-[10px] font-bold uppercase opacity-60">{item.type}</div>
                </div>
                <p className="text-xs italic leading-tight mb-2 line-clamp-3">"{item.content || 'İçerik yok'}"</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-base-content/5">
                   <div className="flex items-center gap-1 opacity-40">
                      <Clock className="w-3 h-3" />
                      <span className="text-[9px]">{item.displayTime}</span>
                   </div>
                   {item.location && (
                     <div className="flex items-center gap-1 opacity-40 max-w-[100px]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="text-[9px] truncate">{item.location}</span>
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-base-content/10 bg-base-200/50">
         <button 
           onClick={() => window.print()} 
           disabled={items.length === 0}
           className="btn btn-primary btn-sm w-full gap-2 rounded-lg"
         >
            <FileText className="w-4 h-4" />
            Dosyayı Kapat & Yazdır
         </button>
      </div>
    </div>
  );
};
