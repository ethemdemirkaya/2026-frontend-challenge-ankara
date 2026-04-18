import { type TimelineEvent } from "../utils/investigation";
import { Pin, X, Clock, MapPin, MessageSquare, Eye, FileText, AlertTriangle, Download } from "lucide-react";

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

  // Tüm sayfayı yazdırmak yerine, sadece PDF/Çıktı için özel izole bir pencere açar
  const handleExportPDF = () => {
    if (items.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Lütfen PDF oluşturmak için tarayıcınızın pop-up engelleyicisini kapatın.");
      return;
    }

    const currentDate = new Date().toLocaleDateString('tr-TR');
    const currentTime = new Date().toLocaleTimeString('tr-TR');

    // Tablo satırlarını dinamik oluştur
    const rowsHtml = items.map((item, idx) => `
      <tr class="align-top border-b border-gray-400/50">
        <td class="border-r border-black p-3 text-center font-bold text-sm">${idx + 1}</td>
        <td class="border-r border-black p-3 font-mono text-xs">${item.displayTime}</td>
        <td class="border-r border-black p-3 uppercase font-bold text-xs">${item.type}</td>
        <td class="border-r border-black p-3 font-bold text-xs">${item.location || '-'}</td>
        <td class="p-3 italic text-xs leading-relaxed">
          "${item.content || 'İçerik verisine ulaşılamadı.'}"
        </td>
      </tr>
    `).join('');

    // Rapor için kullanılacak izole HTML belgesi
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Kanit_Tutanagi_${new Date().getTime()}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            @page { margin: 15mm; size: A4 portrait; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          /* Sayfa sonu geldiğinde tabloların ortadan bölünmesini engellemek için */
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        </style>
      </head>
      <body class="bg-white text-black p-8 max-w-5xl mx-auto font-sans">
        
        <div class="text-center mb-8 border-b-4 border-double border-black pb-6">
          <div class="flex justify-between items-center mb-4 px-4">
            <div class="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center text-[10px] font-bold text-center leading-tight">EMNİYET<br/>GM</div>
            <div class="text-center">
              <p class="text-xs uppercase font-bold tracking-[0.3em] mb-2">T.C. Ankara Emniyet Müdürlüğü</p>
              <h1 class="text-2xl font-black mb-1 tracking-tight">KANIT VE TESPİT TUTANAĞI</h1>
              <p class="text-xs opacity-80 italic font-mono mt-2">Vaka No: #2026-MISSING-PODO | Rapor Tarihi: ${currentDate}</p>
            </div>
            <div class="w-16 h-16 border-2 border-black rounded flex items-center justify-center text-[12px] font-bold text-center tracking-widest">GİZLİ</div>
          </div>
        </div>

        <table class="w-full border-2 border-black text-sm mb-16">
          <thead>
            <tr class="bg-gray-200 italic border-b-2 border-black text-left">
              <th class="border-r border-black p-3 w-10 text-center">#</th>
              <th class="border-r border-black p-3 w-32 text-xs tracking-wider">ZAMAN DAMGASI</th>
              <th class="border-r border-black p-3 w-28 text-xs tracking-wider">TÜR</th>
              <th class="border-r border-black p-3 w-40 text-xs tracking-wider">LOKASYON</th>
              <th class="p-3 text-xs tracking-wider">İSTİHBARAT DETAYI / İÇERİK</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="mt-16 flex justify-between px-16">
          <div class="text-center">
            <p class="text-xs font-bold uppercase mb-16 underline tracking-widest">İnceleyen Memur</p>
            <div class="w-48 h-px bg-black mx-auto"></div>
            <p class="text-[10px] mt-2 opacity-70">İmza / Sicil No</p>
          </div>
          <div class="text-center">
            <p class="text-xs font-bold uppercase mb-16 underline tracking-widest">Birlik Amiri Onayı</p>
            <div class="w-48 h-px bg-black mx-auto"></div>
            <p class="text-[10px] mt-2 opacity-70">İmza / Kaşe</p>
          </div>
        </div>

        <div class="mt-24 text-center border-t border-gray-300 pt-4">
          <p class="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-mono">
            UYARI: Bu belge resmi tahkikat evrakıdır. Yetkisiz kişilerle paylaşılamaz.<br/>
            Sistem Çıktı Saati: ${currentDate} - ${currentTime}
          </p>
        </div>

        <script>
          // CSS'in tam render olabilmesi için çok kısa bir bekleme süresi
          setTimeout(() => {
            window.print();
          }, 700);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-base-100 shadow-2xl z-[150] border-l border-base-content/10 flex flex-col animate-slide-in">

      {/* HEADER */}
      <div className="p-4 bg-primary text-primary-content flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <Pin className="w-5 h-5 fill-current" />
          <h2 className="font-bold uppercase tracking-widest text-sm">Kanıt Tahtası</h2>
          <span className="badge badge-sm badge-outline border-primary-content/30 text-[10px]">{items.length}</span>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* İÇERİK (PINLENENLER) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
            <Pin className="w-12 h-12" />
            <p className="text-xs uppercase tracking-tighter leading-relaxed">
              Henüz kanıt iğnelenmedi.<br />
              Zaman çizelgesindeki iğne ikonlarını kullanın.
            </p>
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
                  <div className="flex items-center gap-1 opacity-50">
                    <Clock className="w-3 h-3" />
                    <span className="text-[9px] font-mono">{item.displayTime}</span>
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-1 opacity-50 max-w-[100px]">
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

      {/* DIŞA AKTAR BUTONU */}
      <div className="p-4 border-t border-base-content/10 bg-base-200/50">
        <button
          onClick={handleExportPDF}
          disabled={items.length === 0}
          className="btn btn-primary btn-sm w-full gap-2 rounded-lg"
        >
          <Download className="w-4 h-4" />
          PDF Raporu Oluştur
        </button>
      </div>

    </div>
  );
};