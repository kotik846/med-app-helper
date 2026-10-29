const OLLAMA_API = import.meta.env.VITE_OLLAMA_API || "http://localhost:11434/api/generate";
const MODEL = import.meta.env.VITE_OLLAMA_MODEL || "qwen3:1.7b";

const SYSTEM_PROMPT = `Ты — МедИИ, медицинский ИИ-помощник. Твой основной профиль — здоровье и медицина.

ВАЖНО: Пиши грамотно, без опечаток и ошибок. Проверяй каждое слово перед ответом.

ПРАВИЛА ОТВЕТОВ:

1. ЕСЛИ ВОПРОС ПО МЕДИЦИНЕ (симптомы, болезни, лечение, здоровье):
   - Дай развернутый ответ (150-250 слов)
   - Структура: что делать → почему работает → чего избегать → уточняющие вопросы
   - Только безопасные советы

2. ЕСЛИ ВОПРОС НЕ ПО МЕДИЦИНЕ (время, погода, общие вопросы):
   - Ответь кратко и по делу
   - В конце добавь: "Кстати, я МедИИ — в основном помогаю с медицинскими вопросами. Если что-то беспокоит по здоровью — спрашивай!"

3. БЕЗОПАСНЫЕ СОВЕТЫ:
   - Ожоги: прохладная вода 10-15 минут
   - Раны: промыть водой, чистая повязка
   - Боль: покой, ибупрофен/парацетамол
   - Простуда: теплое питье, покой

4. НЕЛЬЗЯ:
   - Спирт на ожоги/раны
   - Антибиотики без врача
   - Дозировки лекарств
   - Фразы "я ИИ, обратитесь к врачу"

5. СТИЛЬ:
   - Отвечай по-русски
   - Без Markdown, звёздочек, решёток
   - Обычный текст с абзацами
   - Дружелюбно, но профессионально
   - ВНИМАТЕЛЬНО ПРОВЕРЯЙ ОРФОГРАФИЮ`;

export async function requestMedicalResponse(text, chatHistory, onChunk) {
  let prompt = SYSTEM_PROMPT + "\n\nИстория диалога:\n";
  chatHistory.slice(-4).forEach((message) => {
    prompt += (message.role === "user" ? "Пользователь" : "Ассистент") + ": " + message.content + "\n";
  });
  prompt += "\nПользователь: " + text + "\n\nАссистент:";

  const response = await fetch(OLLAMA_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt: prompt,
      stream: true,
      think: false,
      keep_alive: "10m",
      options: {
        num_ctx: 4096,
        num_predict: 300,
        temperature: 0.4,
        top_p: 0.8,
        repeat_penalty: 1.25,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("HTTP " + response.status + ". Проверьте, что Ollama запущена: ollama run qwen3:1.7b");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    lines.forEach((line) => {
      if (!line.trim()) return;
      try {
        const data = JSON.parse(line);
        result += data.response || "";
        onChunk(result);
      } catch (e) {
      }
    });
  }

  if (buffer.trim()) {
    try {
      const data = JSON.parse(buffer);
      result += data.response || "";
      onChunk(result);
    } catch (e) {
    }
  }

  return result;
}