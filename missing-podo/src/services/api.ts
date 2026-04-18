import { API_BASE_URL, API_KEY } from "../config";

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
  const response = await fetch(`${API_BASE_URL}/form/${formId}/submissions?apiKey=${API_KEY}&limit=100`);
  if (!response.ok) {
    throw new Error(`API Hatası: ${response.status}`);
  }
  const data = await response.json();
  return parseJotformAnswers(data.content || []);
};