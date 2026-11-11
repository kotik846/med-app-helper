import { init, pull, listSync, getBySlugSync, view, isOnline } from './store.js';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = iso => iso ? new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
let md = s => `<pre style="white-space:pre-wrap">${esc(s)}</pre>`;

(async () => {
  try {
    const [m, d] = await Promise.all([import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js'), import('https://cdn.jsdelivr.net/npm/dompurify/dist/purify.es.mjs')]);
    md = s => d.default.sanitize(m.marked.parse(s));
  } catch {}
})();

function published() { return listSync().filter(a => a.status === 'published'); }
function render() {
  const q = $('#search').value.trim().toLowerCase(), sort = $('#sort').value;
  let a = published();
  if (q) a = a.filter(x => (x.title + ' ' + x.description + ' ' + x.tags.join(' ')).toLowerCase().includes(q));
  a.sort((x, y) => sort === 'views' ? y.views - x.views : sort === 'title' ? x.title.localeCompare(y.title, 'ru') : new Date(y.published_at || y.created_at) - new Date(x.published_at || x.created_at));
  $('#count').textContent = `Статей: ${a.length}`;
  $('#list').innerHTML = a.length ? a.map(x => `
    <article class="card" data-slug="${esc(x.slug)}">
      <div class="tags">${x.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      <h2>${esc(x.title)}</h2>
      <p>${esc(x.description || x.content.slice(0, 140))}</p>
      <div class="meta"><span>${fmt(x.published_at || x.created_at)}</span><span>👁 ${x.views}</span><span>❤️ ${x.likes}</span></div>
    </article>`).join('') : '<div class="empty">Статьи не найдены. Откройте Студию и добавьте материалы.</div>';
  const b = $('#mode');
  b.textContent = isOnline() ? 'API подключён' : 'Локальный режим';
  b.classList.toggle('online', isOnline());
}
async function open(slug) {
  const a = getBySlugSync(slug); if (!a) return;
  await view(a.id);
  $('#article').innerHTML = `<h1>${esc(a.title)}</h1><div class="meta"><span>${fmt(a.published_at || a.created_at)}</span><span>${esc(a.author?.display_name || a.author?.username || 'МедИИ')}</span><span>👁 ${a.views}</span></div><div class="body">${md(a.content)}</div>`;
  $('#modal').hidden = false; document.body.style.overflow = 'hidden';
  history.replaceState(null, '', '/blog.html?article=' + encodeURIComponent(slug));
  render();
}
function close() { $('#modal').hidden = true; document.body.style.overflow = ''; history.replaceState(null, '', '/blog.html'); }

$('#list').addEventListener('click', e => { const c = e.target.closest('.card'); if (c) open(c.dataset.slug); });
$('#search').addEventListener('input', render);
$('#sort').addEventListener('change', render);
$('#close').onclick = close;
$('#modal').addEventListener('click', e => { if (e.target === e.currentTarget) close(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) close(); });

(async () => {
  await init(); render();
  const slug = new URLSearchParams(location.search).get('article');
  if (slug) open(slug);
  pull().then(render);
})();