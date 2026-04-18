# 🕵️ Missing Podo - Ankara Intelligence Dashboard

Ankara'da gerçekleşen büyük bir etkinlik sonrası kaybolan **Podo**'nun izini sürmek için geliştirilmiş, yüksek teknolojili bir dedektiflik ve istihbarat analiz platformu.

## 📋 Proje Hakkında

"Missing Podo", karmaşık ve parçalı istihbarat verilerini (check-inler, saha gözlemleri, mesaj kayıtları ve kişisel notlar) anlamlı birer kanıta dönüştürmek için tasarlanmıştır. Sistem, birden fazla kaynaktan gelen veriyi harmanlar, şüpheliler arasındaki sosyal ağı haritalandırır ve şahsın son görüldüğü noktaları kronolojik olarak takip eder.

## 🚀 Öne Çıkan Özellikler

### 1. 🔍 Gelişmiş "Spotlight" Araması (Ctrl+K)

- **Akıllı Filtreleme:** Olay türüne (Mesaj, Görülme, Check-in, İhbar) göre anında daraltma.
- **Aciliyet Analizi:** Yüksek öncelikli (Urgency: High) kayıtları anında tespit etme.
- **Ağırlıklı Sıralama:** İsim, konum ve içerik eşleşmelerine göre skorlanmış sonuçlar.

### 2. 🗺️ İnteraktif Saha Operasyon Haritası

- **Dinamik Rota Takibi:** Hedef şahsın ve şüphelilerin zaman içindeki hareketlerini kesikli çizgilerle görselleştirme.
- **Bölgesel GeoJSON Filtresi:** Ankara'nın ilçelerine tıklayarak o bölgedeki tüm hareketliliği izole etme.
- **Sosyal Bağlantı Katmanı:** Harita üzerinde şüphelilerin Podo ile kesiştiği "sıcak noktaları" görselleştirme.

### 3. 🕸️ Kapsamlı Ağ Analizi (Force Graph)

Şüpheliler arasındaki gizli bağları, iletişim trafiğini ve ortak lokasyonları fizik tabanlı bir grafikte analiz etme.

### 4. 📊 İstihbarat Raporlama (Nihai Rapor)

- **Otomatik Güven Skoru:** Verilerin tutarlılığına göre vaka çözülme olasılığı hesaplaması.
- **Kişiselleştirilmiş Karar:** Dedektiflerinkendi notlarını ekleyebileceği ve sistem çıkarımlarıyla karşılaştırabileceği final modülü.

## 🛠️ Teknoloji Yığını

- **Frontend:** React, TypeScript, Tailwind CSS 4.
- **UI Bileşenleri:** DaisyUI (Modern & Dark Dashboard teması).
- **Harita:** React-Leaflet & OpenStreetMap.
- **Görselleştirme:** React Force Graph 2D (Network Analysis).
- **İkonlar:** Lucide React (Profesyonel istihbarat stili).
- **Veri İşleme:** Jotform API & Custom Levenshtein Duplicate Detection.

## 📥 Kurulum

Projeyi yerel ortamınızda çalıştırmak için şu adımları izleyin:

**1. Depoyu Klonlayın:**

```bash
git clone https://github.com/ethemdemirkaya/2026-frontend-challenge-ankara.git
cd missing-podo
```

**2. Bağımlılıkları Yükleyin:**

```bash
npm install
# veya
yarn install
```

**3. Uygulamayı Başlatın:**

```bash
npm run dev
```

**4. Arama Panelini Açın:** Uygulama içindeyken `Ctrl + K` (veya Mac için `Cmd + K`) tuşlarına basarak gelişmiş arama özelliğini başlatın.

## 🗄️ Veri Yapısı ve API

Dashboard, Jotform API üzerinden sağlanan 5 farklı veri kaynağını işlemektedir:

- **Checkins:** GPS koordinatlı konum bildirimleri.
- **Messages:** Şahıslar arası iletişim ve aciliyet durumları.
- **Sightings:** Üçüncü şahıslar tarafından bildirilen fiziksel görülme vakaları.
- **Personal Notes:** Dedektif notları ve isim analizleri.
- **Tips:** Anonim ihbarlar.

## 🛡️ Güvenlik ve Gizlilik

Bu platform Ankara Merkezli Operasyon Merkezi için özel olarak tasarlanmıştır. Tüm veriler "Need-to-Know" (Bilmesi Gereken) prensibiyle işlenmektedir.

---

*İstihbarat Dashboard © 2026 - Ankara Vaka Hareket Merkezi*