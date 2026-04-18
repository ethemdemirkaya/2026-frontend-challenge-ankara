import { API_BASE_URL, API_KEYS } from "../config";

// Jotform'dan gelen veriyi daha düz ve okunabilir bir objeye çeviren yardımcı fonksiyon
const parseJotformAnswers = (submissions: any[]) => {
  return submissions.map((sub) => {
    const parsedData: any = { id: sub.id, created_at: sub.created_at };
    const answers = sub.answers;

    // Her bir submission içindeki yanıtları döngüye al
    for (const key in answers) {
      if (answers[key].name && answers[key].answer !== undefined) {
        // Soru ismini key olarak, cevabı value olarak atıyoruz
        parsedData[answers[key].name] = answers[key].answer;
      }
    }
    return parsedData;
  });
};

export const fetchFormData = async (formId: string) => {
  for (const apiKey of API_KEYS) {
    try {
      if (apiKey.startsWith("YEDEK_API_KEY")) continue; // Yedekler girilmemişse atla
      const response = await fetch(`${API_BASE_URL}/form/${formId}/submissions?apiKey=${apiKey}&limit=100`);

      if (!response.ok) {
        throw new Error(`API Hatası: ${response.status}`);
      }

      const data = await response.json();
      if (data.responseCode !== 200) {
        throw new Error(data.message || 'API Limit Error');
      }

      return parseJotformAnswers(data.content || []);
    } catch (err: any) {
      console.warn(`API Error with key ${apiKey.substring(0, 5)}... : `, err.message);
      // Hata alınırsa döngü devam edip diğer key'i deneyecek
    }
  }

  console.error("Tüm API Key'leri denendi ancak veri alınamadı!");
  throw new Error("Tüm API Key'leri tüketilmiş veya geçersiz.");
};