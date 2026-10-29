const API_KEY = import.meta.env.VITE_API_KEY;
const FOLDER_ID = import.meta.env.VITE_FOLDER_ID;
const API_MODEL = import.meta.env.VITE_API_MODEL || "yandexgpt-lite";

const SYSTEM_PROMPT = `Ты — МедИИ, медицинский ИИ-помощник. 
ВАЖНО: Пиши грамотно, без опечаток.
ПРАВИЛА:
1. МЕДИЦИНА: Дай развернутый ответ (150-250 слов). Структура: что делать → почему работает → чего избегать → уточняющие вопросы. Только безопасные советы.
2. НЕ МЕДИЦИНА: Ответь кратко. В конце добавь: "Кстати, я МедИИ — в основном помогаю с медицинскими вопросам. Если что-то беспокоит по здоровью — спрашивай!"
3. БЕЗОПАСНОСТЬ: Ожоги - прохладная вода. Раны - промыть водой. Боль - покой, ибупрофен/парацетамол.
4. ЗАПРЕТЫ: Никакого спирта на раны, никаких дозировок антибиотиков, никаких фраз "я ИИ, обратитесь к врачу".
5. СТИЛЬ: По-русски, без Markdown (звездочек, решеток), обычный текст с абзацами. Дружелюбно, но профессионально.`;

export async function requestMedicalResponse(text, chatHistory, onChunk) {
  const messages = [
    { role: "system", text: SYSTEM_PROMPT },
    ...chatHistory.slice(-4).map(msg => ({
      role: msg.role === "user" ? "user" : "assistant",
      text: msg.content
    })),
    { role: "user", text: text }
  ];

  // Используем новый endpoint Яндекса
  const response = await fetch(`/api/yandex/foundationModels/v1/completion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Api-Key ${API_KEY}`,
      "x-folder-id": FOLDER_ID
    },
    body: JSON.stringify({
      modelUri: `gpt://${FOLDER_ID}/${API_MODEL}/latest`,
      completionOptions: {
        stream: false,
        temperature: 0.4,
        maxTokens: "1000"
      },
      messages: messages
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Yandex API Error:", err);
    throw new Error(`Ошибка YandexGPT ${response.status}: ${err}`);
  }

  const data = await response.json();
  const result = data.result?.alternatives?.[0]?.message?.text || "Не удалось получить ответ";
  
  if (onChunk) {
    onChunk(result);
  }

  return result;
}