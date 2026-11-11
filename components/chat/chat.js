import { requestMedicalResponse } from '/services/ai.js';
import './chat.css';

const STORAGE_KEY = 'medii_chat_v2';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function resolveRoot(container) {
  if (container instanceof Element) return container;
  if (typeof container === 'string') return document.querySelector(container);
  for (const s of ['[data-medii-chat]', '#chat-root', '#chat-container', '.chat-container', '#chat', '.chat', '[data-chat]', 'main', '#app']) {
    const el = document.querySelector(s); if (el) return el;
  }
  const el = document.createElement('section'); document.body.append(el); return el;
}
function parseSections(text) {
  const chunks = String(text).split(/\[([^\]]+)\]/);
  const out = [];
  if (chunks.length > 1) for (let i = 1; i < chunks.length; i += 2) out.push({ title: chunks[i].trim(), body: (chunks[i + 1] || '').trim() });
  if (!out.length) out.push({ title: 'ОТВЕТ', body: String(text).trim() });
  return out;
}
function sectionMeta(title) {
  const t = title.toLowerCase();
  if (t.includes('первая')) return { cls: 'aid', icon: '🚑' };
  if (t.includes('почему')) return { cls: 'why', icon: '💡' };
  if (t.includes('избег')) return { cls: 'avoid', icon: '⚠️' };
  if (t.includes('врач')) return { cls: 'urgent', icon: '🏥' };
  return { cls: 'plain', icon: '💬' };
}

export function renderChat(container, options = {}) {
  const root = resolveRoot(container);
  if (!root) return null;
  root.dataset.mediiView = 'chat';
  root.classList.add('medii-chat-root');
  root.classList.remove('medii-home-root');
  root.innerHTML = `
    <div class="mchat">
      <div class="mchat-bg" aria-hidden="true"><i></i><i></i></div>
      <header class="mchat-hero">
        <button class="mchat-back" type="button" title="На главную">←</button>
        <div class="mchat-brand">
          <span class="mchat-logo">+</span>
          <div class="mchat-heading">
            <h1>МедИИ <span>помощник</span></h1>
            <p>Ответ по блокам: первая помощь → почему помогает → чего избегать → когда к врачу.</p>
          </div>
        </div>
        <nav class="mchat-links"><a href="/blog.html">Блог</a><a href="/studio.html">Студия</a></nav>
      </header>
      <svg class="mchat-ecg" viewBox="0 0 320 40" aria-hidden="true"><path pathLength="320" d="M0 20 H58 L70 20 79 6 90 34 101 14 110 20 H158 L170 20 179 5 190 35 201 16 210 20 H320"/></svg>
      <main class="mchat-log" aria-live="polite"></main>
      <footer class="mchat-composer">
        <div class="mchat-disclaimer">⚠️ Информация носит справочный характер и не заменяет консультацию врача.</div>
        <div class="mchat-inputrow">
          <textarea class="mchat-input" rows="1" placeholder="Напишите, что вас беспокоит…"></textarea>
          <button class="mchat-send" type="button">Отправить</button>
        </div>
        <div class="mchat-tools"><span class="mchat-hint">Enter — отправить · Shift+Enter — новая строка</span><button class="mchat-clear" type="button">Очистить диалог</button></div>
      </footer>
    </div>`;

  const log = root.querySelector('.mchat-log');
  const input = root.querySelector('.mchat-input');
  const send = root.querySelector('.mchat-send');
  const clear = root.querySelector('.mchat-clear');
  const back = root.querySelector('.mchat-back');

  let history = [];
  try { history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch {}
  let busy = false;
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-30)));
  const scroll = () => log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });

  function addUser(text) { const el = document.createElement('div'); el.className = 'mchat-msg user'; el.innerHTML = `<div class="mchat-bubble">${esc(text)}</div>`; log.append(el); scroll(); }
  function addAI(text) {
    const el = document.createElement('div'); el.className = 'mchat-msg ai';
    const cards = parseSections(text).map(s => { const m = sectionMeta(s.title); return `<section class="mchat-card ${m.cls}"><h3>${m.icon} ${esc(s.title)}</h3><p>${esc(s.body).replace(/\n/g, '<br>')}</p></section>`; }).join('');
    el.innerHTML = `<div class="mchat-head"><span class="mchat-ava">+</span><span class="mchat-name">МедИИ</span><span class="mchat-tag">по полочкам</span></div><div class="mchat-cards">${cards}</div>`;
    log.append(el); scroll();
  }
  function welcome() {
    const el = document.createElement('div'); el.className = 'mchat-welcome';
    el.innerHTML = `<p>Здравствуйте! Я — МедИИ. Опишите жалобу: что беспокоит, как давно и насколько сильно. Отвечу структурированно и безопасно.</p><div class="mchat-quick">${['Температура 38,5', 'Похоже на ОРВИ', 'Ожог кипятком', 'Болит горло', 'Болит живот', 'Головная боль'].map(q => `<button type="button" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>`;
    log.append(el);
  }
  function typing(on) {
    let t = log.querySelector('.mchat-typing');
    if (on && !t) { t = document.createElement('div'); t.className = 'mchat-msg ai mchat-typing'; t.innerHTML = '<div class="mchat-head"><span class="mchat-ava">+</span><span class="mchat-name">МедИИ</span></div><div class="mchat-dots"><i></i><i></i><i></i></div>'; log.append(t); scroll(); }
    if (!on && t) t.remove();
  }
  async function ask(text) {
    if (busy || !text.trim()) return;
    busy = true; send.disabled = true;
    const q = text.trim(); input.value = ''; input.style.height = 'auto';
    log.querySelector('.mchat-welcome')?.remove();
    addUser(q); typing(true);
    history.push({ role: 'user', content: q }); save();
    try {
      const answer = await requestMedicalResponse(q, history.slice(0, -1));
      typing(false); addAI(answer);
      history.push({ role: 'assistant', content: answer }); save();
    } catch { typing(false); addAI('[ОТВЕТ]\nНе удалось получить ответ. Попробуйте ещё раз.'); }
    busy = false; send.disabled = false; input.focus();
  }
  function clearChat() { if (!confirm('Очистить диалог?')) return; history = []; localStorage.removeItem(STORAGE_KEY); log.innerHTML = ''; welcome(); input.focus(); }

  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 140) + 'px'; });
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input.value); } });
  send.addEventListener('click', () => ask(input.value));
  clear.addEventListener('click', clearChat);
  log.addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) ask(b.dataset.q); });
  back.addEventListener('click', async () => { const { renderHome } = await import('../home/home.js'); renderHome(root); });

  if (history.length) history.forEach(m => m.role === 'user' ? addUser(m.content) : addAI(m.content));
  else welcome();
  setTimeout(() => input.focus(), 50);
  if (options.initialQuestion) setTimeout(() => ask(options.initialQuestion), 350);

  return { ask, clear: clearChat };
}

export const initChat = renderChat;
export const createChat = renderChat;
export const mountChat = renderChat;
export function Chat(container) { return renderChat(container); }
export default renderChat;