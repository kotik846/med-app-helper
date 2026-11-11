export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed' } });
  const key = process.env.YANDEX_API_KEY || process.env.VITE_API_KEY;
  const folder = process.env.YANDEX_FOLDER_ID || process.env.VITE_FOLDER_ID;
  if (!key || !folder) return res.status(500).json({ error: { message: 'На сервере не заданы YANDEX_API_KEY / YANDEX_FOLDER_ID' } });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!body.modelUri) body.modelUri = `gpt://${folder}/${process.env.VITE_API_MODEL || 'yandexgpt-lite'}/latest`;
    const upstream = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Api-Key ${key}` },
      body: JSON.stringify(body),
    });
    const data = await upstream.json().catch(() => null);
    return res.status(upstream.status).json(data || { error: { message: 'Пустой ответ Yandex' } });
  } catch (e) {
    return res.status(502).json({ error: { message: 'Не удалось связаться с YandexGPT: ' + e.message } });
  }
}