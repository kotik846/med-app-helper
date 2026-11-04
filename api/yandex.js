// api/yandex.js — Серверная функция для Vercel (скрывает ключи)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Читаем ключи из переменных окружения (на Vercel они будут спрятаны)
  const apiKey = process.env.VITE_API_KEY;
  const folderId = process.env.VITE_FOLDER_ID;

  if (!apiKey || !folderId) {
    return res.status(500).json({ error: 'Yandex credentials not configured' });
  }

  try {
    const { messages, modelUri, completionOptions } = req.body;

    const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Api-Key ${apiKey}`,
        'x-folder-id': folderId
      },
      body: JSON.stringify({
        modelUri: modelUri || `gpt://${folderId}/yandexgpt-lite/latest`,
        completionOptions: completionOptions || { stream: false, temperature: 0.4, maxTokens: 1000 },
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Yandex API Error:', data);
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}