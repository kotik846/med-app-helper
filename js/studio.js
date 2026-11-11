// js/studio.js
import { api, ApiError } from './api.js';
import { register, login, logout, bootstrap, getMe } from './auth.js';
import { createArticle, updateArticle, deleteArticle } from './articles.js';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify/dist/purify.es.mjs';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const enc = new TextEncoder();

const state = {
  me: null, articles: [], filter: 'all', sort: 'updated', query: '',
  selected: new Set(), editing: null, tags: [], status: 'draft',
  dirty: false, slugTouched: false, seeding: false,
};

/* ---------- утилиты ---------- */
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

const TR = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' };
const slugify = s => s.toLowerCase().split('').map(c => TR[c] ?? c).join('')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 200).replace(/-+$/g, '');
const uniqueSlug = base => { let s = base, n = 2; const taken = new Set(state.articles.map(a => a.slug)); while (taken.has(s)) s = `${base}-${n++}`; return s.slice(0, 200).replace(/-+$/g, ''); };

/* ---------- тосты и модалка ---------- */
function toast(msg, type = 'info', action = null, ttl = 5200) {
  const box = $('#toasts');
  while (box.children.length >= 4) box.firstChild.remove();
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `<span class="toast-msg">${esc(msg)}</span>`;
  if (action) { const b = document.createElement('button'); b.className = 'toast-action'; b.textContent = action.label; b.onclick = () => { el.remove(); action.fn(); }; el.append(b); }
  const x = document.createElement('button'); x.className = 'toast-x'; x.textContent = '✕'; x.onclick = () => el.remove(); el.append(x);
  const bar = document.createElement('i'); bar.className = 'toast-bar'; bar.style.animationDuration = ttl + 'ms'; el.append(bar);
  box.append(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 260); }, ttl);
}

let modalResolve = null;
function confirmModal(title, text, okLabel = 'Подтвердить') {
  $('#modal-title').textContent = title; $('#modal-text').textContent = text;
  $('#modal-ok').textContent = okLabel; $('#modal').hidden = false; $('#modal-ok').focus();
  return new Promise(res => { modalResolve = res; });
}
function closeModal(v) { $('#modal').hidden = true; if (modalResolve) { modalResolve(v); modalResolve = null; } }

/* ---------- ошибки ---------- */
const clearErrors = root => $$('[data-error-for]', root).forEach(el => el.textContent = '');
const showErrors = (root, details) => { for (const [f, m] of Object.entries(details || {})) { const el = $(`[data-error-for="${f}"]`, root); if (el) el.textContent = m; } };

let cooling = false, coolTimer = null;
function startCooldown(sec) {
  cooling = true; let left = sec;
  const btns = $$('.auth-submit');
  btns.forEach(b => { b.disabled = true; b.dataset.label = b.textContent; });
  clearInterval(coolTimer);
  const tick = () => {
    btns.forEach(b => b.textContent = `Подождите ${left} с`);
    if (left-- <= 0) { clearInterval(coolTimer); cooling = false; btns.forEach(b => { b.disabled = false; b.textContent = b.dataset.label; }); }
  };
  tick(); coolTimer = setInterval(tick, 1000);
}

function handleError(err, root) {
  if (err instanceof ApiError) {
    if (err.code === 'validation_failed') { if (root) { clearErrors(root); showErrors(root, err.details); } toast('Проверьте выделенные поля', 'error'); return; }
    if (err.code === 'already_exists') { if (root) { clearErrors(root); showErrors(root, { form: 'Такое значение уже занято' }); } toast('Значение уже занято', 'error'); return; }
    if (err.code === 'rate_limited') { startCooldown(60); toast('Слишком много запросов — подождите минуту', 'error'); return; }
    if (err.status === 401) { toast('Сессия истекла — войдите снова', 'error'); showAuth(); return; }
    toast(err.message || 'Ошибка API', 'error'); return;
  }
  toast('Сеть недоступна. Проверьте, что запущен npm run dev', 'error');
}

/* ---------- авторизация ---------- */
function showAuth() { $('#app').hidden = true; $('#auth-screen').hidden = false; }

async function enterStudio(me) {
  state.me = me;
  $('#user-name').textContent = me.display_name || me.username;
  $('#user-avatar').textContent = (me.display_name || me.username).slice(0, 1).toUpperCase();
  $('#auth-screen').hidden = true; $('#app').hidden = false;
  const saved = JSON.parse(localStorage.getItem('studio_view') || '{}');
  if (saved.filter) state.filter = saved.filter;
  if (saved.sort) state.sort = saved.sort;
  $('#sort').value = state.sort; syncFilterChips();
  await loadMine();
}

async function loadMine() {
  $('#article-list').innerHTML = '<div class="list-loading">Загрузка…</div>';
  try {
    const all = [];
    for (let page = 1; ; page++) {
      const r = await api('/me/articles', { query: { page, page_size: 100 } });
      all.push(...r.items);
      if (page * r.page_size >= r.total) break;
    }
    state.articles = all; state.selected.clear(); renderAll();
  } catch (err) { $('#article-list').innerHTML = ''; handleError(err); }
}

/* ---------- список ---------- */
function visible() {
  let a = [...state.articles];
  if (state.filter !== 'all') a = a.filter(x => x.status === state.filter);
  if (state.query) { const q = state.query.toLowerCase(); a = a.filter(x => (x.title + ' ' + x.description + ' ' + x.slug + ' ' + x.tags.join(' ')).toLowerCase().includes(q)); }
  const s = state.sort;
  a.sort((x, y) => s === 'title' ? x.title.localeCompare(y.title, 'ru')
    : s === 'views' ? y.views - x.views
    : s === 'created' ? new Date(y.created_at) - new Date(x.created_at)
    : new Date(y.updated_at) - new Date(x.updated_at));
  return a;
}

function renderStats() {
  $('#stat-pub').textContent = state.articles.filter(a => a.status === 'published').length;
  $('#stat-draft').textContent = state.articles.filter(a => a.status === 'draft').length;
  $('#stat-views').textContent = state.articles.reduce((s, a) => s + a.views, 0);
}

function renderList() {
  const list = $('#article-list');
  $('#list-empty').hidden = state.articles.length > 0;
  if (!state.articles.length) { list.innerHTML = ''; return; }
  const items = visible();
  if (!items.length) { list.innerHTML = '<div class="list-loading">Ничего не найдено по фильтрам</div>'; return; }
  list.innerHTML = items.map(a => `
    <div class="a-card${state.editing?.id === a.id ? ' is-active' : ''}" data-id="${a.id}">
      <label class="a-check" title="Выбрать"><input type="checkbox" data-check="${a.id}" ${state.selected.has(a.id) ? 'checked' : ''}></label>
      <div class="a-main">
        <div class="a-top"><span class="pill ${a.status === 'published' ? 'pill--pub' : 'pill--draft'}">${a.status === 'published' ? 'опубликовано' : 'черновик'}</span><span class="a-date">${fmtDate(a.updated_at)}</span></div>
        <h4>${esc(a.title)}</h4>
        <div class="a-meta"><span>👁 ${a.views}</span><span>❤️ ${a.likes}</span><span>💬 ${a.comments}</span><span class="a-slug mono">/${esc(a.slug)}</span></div>
      </div>
      <div class="a-actions">
        <button class="mini-icon" data-act="toggle" title="${a.status === 'published' ? 'Снять с публикации' : 'Опубликовать'}">${a.status === 'published' ? '📥' : '🚀'}</button>
        <button class="mini-icon" data-act="del" title="Удалить">🗑</button>
      </div>
    </div>`).join('');
}

function renderBulk() { const n = state.selected.size; $('#bulk-bar').hidden = !n; $('#bulk-count').textContent = `Выбрано: ${n}`; }
function renderAll() { renderStats(); renderList(); renderBulk(); }
function syncFilterChips() { $$('#filter-chips .chip').forEach(c => c.classList.toggle('is-active', c.dataset.filter === state.filter)); }

/* ---------- действия со статьями ---------- */
async function toggleStatus(a) {
  const next = a.status === 'published' ? 'draft' : 'published', prev = a.status;
  a.status = next; renderList(); renderStats();
  try {
    const upd = await updateArticle(a, { status: next });
    Object.assign(a, upd);
    if (state.editing?.id === a.id) { state.editing = upd; syncStatusSeg(); $('#version-badge').textContent = 'v' + upd.version; }
    toast(next === 'published' ? 'Статья опубликована' : 'Статья снята в черновики', 'success');
  } catch (err) { a.status = prev; handleError(err); }
  renderList(); renderStats();
}

async function removeArticles(list) {
  const ok = await confirmModal(
    list.length > 1 ? `Удалить ${list.length} статей?` : 'Удалить статью?',
    list.length > 1 ? 'Статьи будут удалены из блога. Отменить можно несколько секунд.' : `«${list[0].title}» будет удалена из блога.`,
    'Удалить');
  if (!ok) return;
  const backup = list.map(a => ({ ...a }));
  state.articles = state.articles.filter(a => !list.includes(a));
  list.forEach(a => state.selected.delete(a.id));
  if (state.editing && list.includes(state.editing)) resetEditor();
  renderAll();
  try { for (const a of list) await deleteArticle(a); offerUndo(backup); }
  catch (err) { state.articles.push(...backup); renderAll(); handleError(err); }
}

function offerUndo(backup) {
  toast(`Удалено: ${backup.length}`, 'info', {
    label: 'Вернуть',
    fn: async () => {
      for (const a of backup) {
        const body = { title: a.title, slug: a.slug, content: a.content, description: a.description, tags: a.tags, status: a.status };
        try { state.articles.unshift(await createArticle(body)); }
        catch (e) {
          if (e.code === 'already_exists') { try { state.articles.unshift(await createArticle({ ...body, slug: uniqueSlug(a.slug) })); } catch (e2) { handleError(e2); } }
          else handleError(e);
        }
      }
      renderAll(); toast('Восстановлено', 'success');
    },
  }, 8000);
}

async function bulkStatus(status) {
  const list = state.articles.filter(a => state.selected.has(a.id) && a.status !== status);
  if (!list.length) { toast('Нет статей для изменения', 'info'); return; }
  list.forEach(a => a.status = status); renderList(); renderStats();
  let ok = 0;
  for (const a of list) { try { Object.assign(a, await updateArticle(a, { status })); ok++; } catch (err) { handleError(err); } }
  state.selected.clear(); await loadMine(); toast(`Обновлено: ${ok}`, 'success');
}

/* ---------- редактор ---------- */
function markDirty(v) { state.dirty = v; $('#dirty-dot').hidden = !v; }
function syncStatusSeg() { $$('#status-seg button').forEach(b => b.classList.toggle('is-active', b.dataset.status === state.status)); }

function openEditor(a) {
  state.editing = a; state.tags = [...a.tags]; state.status = a.status; state.slugTouched = true;
  $('#f-title').value = a.title; $('#f-slug').value = a.slug; $('#f-desc').value = a.description || ''; $('#f-content').value = a.content;
  $('#editor-mode').textContent = 'Редактирование';
  $('#version-badge').hidden = false; $('#version-badge').textContent = 'v' + a.version;
  $('#delete-btn').hidden = false;
  renderTags(); syncStatusSeg(); updateCounts(); renderPreview(); clearErrors($('.editor')); markDirty(false); renderList();
  if (matchMedia('(max-width: 980px)').matches) $('.editor').scrollIntoView({ behavior: 'smooth' });
}

function resetEditor() {
  state.editing = null; state.tags = []; state.status = 'draft'; state.slugTouched = false;
  $('#f-title').value = ''; $('#f-slug').value = ''; $('#f-desc').value = ''; $('#f-content').value = '';
  $('#editor-mode').textContent = 'Новая статья'; $('#version-badge').hidden = true; $('#delete-btn').hidden = true;
  renderTags(); syncStatusSeg(); updateCounts(); renderPreview(); clearErrors($('.editor')); markDirty(false); renderList();
}

function renderTags() {
  const box = $('#tags-box'), input = $('#f-tag');
  $$('.tag-chip', box).forEach(el => el.remove());
  state.tags.forEach(t => {
    const chip = document.createElement('span'); chip.className = 'tag-chip';
    chip.innerHTML = `${esc(t)}<button type="button" title="Убрать">✕</button>`;
    chip.querySelector('button').onclick = () => { state.tags = state.tags.filter(x => x !== t); renderTags(); markDirty(true); };
    box.insertBefore(chip, input);
  });
}

function addTagFromInput() {
  const input = $('#f-tag'), t = slugify(input.value);
  input.value = '';
  if (!t || state.tags.includes(t)) return;
  if (state.tags.length >= 10) { toast('Максимум 10 тегов', 'error'); return; }
  state.tags.push(t); renderTags(); markDirty(true);
}

function updateCounts() {
  const c = $('#f-content').value, words = c.trim() ? c.trim().split(/\s+/).length : 0;
  $('#content-count').textContent = `${words} слов · ${c.length} знаков · ~${words ? Math.max(1, Math.ceil(words / 180)) : 0} мин чтения`;
  $('#desc-count').textContent = `${$('#f-desc').value.length}/500`;
}

function renderPreview() {
  const title = $('#f-title').value.trim(), md = (title ? '# ' + title + '\n\n' : '') + $('#f-content').value;
  $('#preview').innerHTML = md.trim() ? DOMPurify.sanitize(marked.parse(md)) : '<p class="preview-empty">Предпросмотр появится здесь…</p>';
}
const previewSoon = debounce(renderPreview, 120);

const collect = () => ({ title: $('#f-title').value.trim(), slug: $('#f-slug').value.trim(), content: $('#f-content').value, description: $('#f-desc').value.trim(), tags: [...state.tags], status: state.status });

function validate(d) {
  const e = {};
  if (!d.title || d.title.length > 200) e.title = 'Заголовок: от 1 до 200 символов';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug) || d.slug.length > 200) e.slug = 'Slug: латиница a-z, цифры и одиночные дефисы';
  if (!d.content || d.content.length > 100000) e.content = 'Текст: от 1 до 100 000 символов';
  if (d.description.length > 500) e.description = 'Описание: до 500 символов';
  if (d.tags.length > 10 || d.tags.some(t => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t) || t.length > 40)) e.tags = 'Теги: латиница, цифры, дефисы; до 10 тегов по 40 символов';
  return e;
}

const diff = (old, d) => {
  const c = {};
  for (const k of ['title', 'slug', 'content', 'description', 'status']) if (old[k] !== d[k]) c[k] = d[k];
  if (JSON.stringify(old.tags) !== JSON.stringify(d.tags)) c.tags = d.tags;
  return c;
};

function setSaving(v) { const b = $('#save-btn'); b.disabled = v; b.innerHTML = v ? 'Сохраняю…' : 'Сохранить <kbd>Ctrl+S</kbd>'; }

async function save() {
  const root = $('.editor'); clearErrors(root);
  const data = collect(), errs = validate(data);
  if (Object.keys(errs).length) { showErrors(root, errs); toast('Проверьте поля', 'error'); return; }
  setSaving(true);
  try {
    if (state.editing) {
      const changes = diff(state.editing, data);
      if (!Object.keys(changes).length) { toast('Нет изменений', 'info'); return; }
      let updated;
      try { updated = await updateArticle(state.editing, changes); }
      catch (err) {
        if (err.code === 'version_conflict') {
          const fresh = await api(`/articles/${state.editing.id}`);
          const ok = await confirmModal('Версия изменилась', 'Статью изменили в другом окне. Перезаписать своими правками?', 'Перезаписать');
          if (!ok) { openEditor(fresh); return; }
          updated = await updateArticle(fresh, changes);
        } else throw err;
      }
      const i = state.articles.findIndex(a => a.id === updated.id);
      if (i > -1) state.articles[i] = updated;
      state.editing = updated;
      $('#version-badge').textContent = 'v' + updated.version;
      toast('Статья сохранена', 'success');
    } else {
      const created = await createArticle(data);
      state.articles.unshift(created);
      state.editing = created; state.slugTouched = true;
      $('#editor-mode').textContent = 'Редактирование';
      $('#version-badge').hidden = false; $('#version-badge').textContent = 'v' + created.version;
      $('#delete-btn').hidden = false;
      toast('Статья создана', 'success');
    }
    markDirty(false); renderAll();
  } catch (err) { handleError(err, root); }
  finally { setSaving(false); }
}

/* ---------- готовые медицинские статьи ---------- */
const SEED = [
  {
    title: 'Температура у взрослого: что делать дома',
    slug: 'temperatura-u-vzroslogo',
    description: 'Когда сбивать температуру, как пить воду и какие признаки означают, что пора к врачу. Спокойный план действий без паники.',
    tags: ['health', 'first-aid', 'fever'],
    status: 'published',
    content: `## Когда температура — это нормально

Повышение температуры — защитная реакция: так организм мешает вирусам и бактериям размножаться. У взрослых лихорадкой обычно считают значения выше 38 °C.

## Что делать дома

- **Пейте больше жидкости.** Вода, морсы, некрепкий чай — маленькими глотками, но часто.
- **Отдыхайте.** Сон и покой помогают иммунитету работать эффективнее.
- **Проветривайте комнату.** Оптимально 20–22 °C и умеренная влажность.
- **Не кутайтесь.** Лёгкая одежда и одеяло по самочувствию.

Жаропонижающие (парацетамол или ибупрофен) принимают по инструкции к препарату, если температура плохо переносится. Не чередуйте препараты без назначения врача.

## Чего избегать

- Обтираний спиртом и уксусом — это опасно.
- Горячих ванн и бань при лихорадке.
- Антибиотиков «на всякий случай»: они не действуют на вирусы.

## Когда срочно к врачу

> Температура выше 39,5 °C держится более трёх дней, появились сыпь, сильная головная боль, одышка, боль в груди, спутанность сознания или признаки обезвоживания — обращайтесь за медицинской помощью немедленно.

*Информация носит справочный характер и не заменяет консультацию врача.*`,
  },
  {
    title: 'Ожоги: первая помощь за 5 шагов',
    slug: 'pervaya-pomoshch-pri-ozhogah',
    description: 'Прохладная вода, чистая повязка и никаких народных средств. Что делать в первые минуты после ожога.',
    tags: ['first-aid', 'burns', 'health'],
    status: 'published',
    content: `## Шаг 1. Охладите место ожога

Держите обожжённый участок под **прохладной проточной водой 20 минут**. Это уменьшает глубину повреждения и боль. Не используйте лёд — он усиливает травму тканей.

## Шаг 2. Снимите всё лишнее

Аккуратно снимите кольца, браслеты и одежду рядом с ожогом, пока не появился отёк. Прилипшую ткань не отрывайте.

## Шаг 3. Закройте ожог

Наложите чистую неприлипающую повязку или пищевую плёнку свободно, без давления. Это защищает рану от инфекции.

## Шаг 4. Обезбольте при необходимости

Подойдут парацетамол или ибупрофен по инструкции к препарату.

## Шаг 5. Оцените серьёзность

> Срочно к врачу: ожог больше ладони пострадавшего, ожоги лица, кистей, стоп и суставов, любые химические и электрические ожоги, белый или обугленный участок кожи, нарастающая боль, гной или температура.

## Чего делать нельзя

- Мазать маслом, сметаной, зубной пастой.
- Прокалывать пузыри.
- Прикладывать лёд и вату прямо к ране.

*Информация носит справочный характер и не заменяет консультацию врача.*`,
  },
  {
    title: 'Как подготовиться к визиту к врачу',
    slug: 'podgotovka-k-vrachu',
    description: 'Чек-лист: дневник симптомов, список лекарств и три главных вопроса. Чтобы приём прошёл с максимальной пользой.',
    tags: ['checkup', 'health', 'lifestyle'],
    status: 'published',
    content: `## За день до приёма

- **Запишите симптомы.** Когда начались, как часто, что усиливает и что облегчает.
- **Соберите список лекарств.** Названия, дозировки, БАДы — всё, что принимаете регулярно.
- **Подготовьте документы.** Результаты прошлых анализов, выписки, снимки.

## Три главных вопроса

Сформулируйте заранее и запишите:

1. Что со мной происходит и почему?
2. Какие варианты действий есть и что будет, если ничего не делать?
3. Какие признаки означают, что нужно обратиться снова или срочно?

## Во время приёма

- Отвечайте честно про образ жизни: сон, алкоголь, курение, нагрузки.
- Просите повторить или записать непонятные назначения.
- Уточните, как правильно принимать лекарства и чего избегать.

## После приёма

> Запишите рекомендации в первые часы, пока помните детали. Сохраняйте назначения и результаты обследований в одной папке — они пригодятся на следующем приёме.

*Информация носит справочный характер и не заменяет консультацию врача.*`,
  },
  {
    title: 'Гигиена сна: 7 правил без таблеток',
    slug: 'gigiena-sna',
    description: 'Режим, темнота, прохлада и ритуал отхода ко сну. Что действительно работает против бессонницы.',
    tags: ['sleep', 'lifestyle', 'health'],
    status: 'published',
    content: `## 1. Один режим каждый день

Ложитесь и вставайте в одно время, включая выходные. Это главный якорь циркадных ритмов.

## 2. Темнота и прохлада

Спальня: 18–20 °C, плотные шторы или маска для сна, тишина или белый шум.

## 3. Экраны — за час до сна

Синий свет и лента новостей бодрят мозг. Замените телефон книгой или тёплым душем.

## 4. Кофеин — до обеда

После 14:00 кофе, крепкий чай и энергетики лучше исключить: период выведения кофеина — около 6 часов.

## 5. Кровать — только для сна

Не работайте и не смотрите сериалы в кровати: мозг должен связывать её со сном.

## 6. Ритуал замедления

10–15 минут спокойных действий: дыхание, растяжка, дневник благодарности.

## 7. Не спится — встаньте

Если сон не идёт 20 минут, перейдите в другую комнату и займитесь чем-то спокойным при тусклом свете, пока не захочется спать.

> Если бессонница длится больше трёх недель, есть громкий храп с остановками дыхания или сильная дневная сонливость — обратитесь к врачу.

*Информация носит справочный характер и не заменяет консультацию врача.*`,
  },
  {
    title: 'Домашняя аптечка: что действительно нужно',
    slug: 'domashnyaya-aptechka',
    description: 'Перевязка, инструменты и базовые препараты. Список без лишнего и правила хранения.',
    tags: ['first-aid', 'health', 'home'],
    status: 'published',
    content: `## Перевязка и антисептика

- Стерильные марлевые салфетки и бинты разных размеров.
- Пластыри бактерицидные и рулонный.
- Антисептик для кожи вокруг раны (например, хлоргексидин).
- Эластичный бинт и косыночная повязка.

## Инструменты

- Электронный термометр.
- Ножницы с тупым концом, пинцет.
- Одноразовые перчатки.
- Холодовый пакет для ушибов и ожогов.

## Базовые препараты

- Жаропонижающее/обезболивающее: парацетамол и ибупрофен.
- Антигистаминное средство.
- Соли для оральной регидратации.
- Личные препараты, назначенные врачом членам семьи.

## Правила хранения

- Сухое, тёмное, недоступное для детей место.
- Раз в 6 месяцев проверяйте сроки годности.
- Храните инструкции и коробки с названиями.

## Чего в аптечке быть не должно

> Антибиотики «про запас», спиртовые растворы для обработки ран, просроченные препараты и лекарства без понятного назначения.

*Информация носит справочный характер и не заменяет консультацию врача.*`,
  },
];

async function seed() {
  if (state.seeding) return;
  state.seeding = true;
  const btns = [$('#seed-btn'), $('#seed-btn-2')];
  btns.forEach(b => { b.disabled = true; b.dataset.label = b.textContent; });
  let created = 0;
  for (let i = 0; i < SEED.length; i++) {
    btns.forEach(b => b.textContent = `Создаю ${i + 1}/${SEED.length}…`);
    const a = SEED[i];
    try {
      let art;
      try { art = await createArticle({ ...a }); }
      catch (e) {
        if (e.code === 'already_exists') art = await createArticle({ ...a, slug: uniqueSlug(a.slug) });
        else throw e;
      }
      state.articles.unshift(art); created++; renderStats(); renderList();
    } catch (e) { console.error(e); }
  }
  state.seeding = false;
  btns.forEach(b => { b.disabled = false; b.textContent = b.dataset.label; });
  toast(created ? `Добавлено статей: ${created}` : 'Не удалось создать статьи', created ? 'success' : 'error');
  renderAll();
}

/* ---------- привязка событий ---------- */
function bindUI() {
  // вкладки входа
  $('#tab-login').onclick = () => { $('#tab-login').classList.add('is-active'); $('#tab-register').classList.remove('is-active'); $('#login-form').hidden = false; $('#register-form').hidden = true; };
  $('#tab-register').onclick = () => { $('#tab-register').classList.add('is-active'); $('#tab-login').classList.remove('is-active'); $('#register-form').hidden = false; $('#login-form').hidden = true; };

  $('#login-form').addEventListener('submit', async e => {
    e.preventDefault(); clearErrors(e.target);
    const f = new FormData(e.target), btn = $('.auth-submit', e.target);
    btn.disabled = true; btn.textContent = 'Входим…';
    try { await login(f.get('email').trim(), f.get('password')); const me = await getMe(); toast(`С возвращением, ${me.display_name || me.username}!`, 'success'); await enterStudio(me); }
    catch (err) { handleError(err, e.target); }
    finally { if (!cooling) { btn.disabled = false; btn.textContent = 'Войти'; } }
  });

  $('#register-form').addEventListener('submit', async e => {
    e.preventDefault(); clearErrors(e.target);
    const f = new FormData(e.target), btn = $('.auth-submit', e.target);
    const username = f.get('username').trim(), email = f.get('email').trim(), password = f.get('password');
    const errs = {};
    if (!/^[a-z0-9_]{3,32}$/.test(username)) errs.username = '3–32 символа: a-z, 0-9, _';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) errs.email = 'Некорректный email';
    const bytes = enc.encode(password).length;
    if (bytes < 12 || bytes > 72) errs.password = `Пароль: 12–72 байта (сейчас ${bytes})`;
    if (Object.keys(errs).length) { showErrors(e.target, errs); return; }
    btn.disabled = true; btn.textContent = 'Создаём аккаунт…';
    try { await register(username, email, password); const me = await getMe(); toast('Аккаунт создан. Добро пожаловать!', 'success'); await enterStudio(me); }
    catch (err) { handleError(err, e.target); }
    finally { if (!cooling) { btn.disabled = false; btn.textContent = 'Создать аккаунт'; } }
  });

  $('#register-form [name="password"]').addEventListener('input', e => { $('#reg-pass-count').textContent = `${enc.encode(e.target.value).length}/72 байт`; });

  $('#logout-btn').onclick = async () => { await logout().catch(() => {}); state.me = null; state.articles = []; resetEditor(); showAuth(); toast('Вы вышли', 'info'); };

  // список
  $('#article-list').addEventListener('click', async e => {
    const check = e.target.closest('[data-check]');
    if (check) { const id = +check.dataset.check; check.checked ? state.selected.add(id) : state.selected.delete(id); renderBulk(); return; }
    const card = e.target.closest('.a-card'); if (!card) return;
    const a = state.articles.find(x => x.id === +card.dataset.id); if (!a) return;
    const act = e.target.closest('[data-act]');
    if (act) { if (act.dataset.act === 'toggle') await toggleStatus(a); if (act.dataset.act === 'del') await removeArticles([a]); return; }
    openEditor(a);
  });

  $('#search').addEventListener('input', debounce(e => { state.query = e.target.value.trim(); renderList(); }, 120));
  $('#filter-chips').addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    state.filter = c.dataset.filter; syncFilterChips(); renderList();
    localStorage.setItem('studio_view', JSON.stringify({ filter: state.filter, sort: state.sort }));
  });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; renderList(); localStorage.setItem('studio_view', JSON.stringify({ filter: state.filter, sort: state.sort })); });

  $('#bulk-pub').onclick = () => bulkStatus('published');
  $('#bulk-draft').onclick = () => bulkStatus('draft');
  $('#bulk-del').onclick = () => removeArticles(state.articles.filter(a => state.selected.has(a.id)));
  $('#bulk-clear').onclick = () => { state.selected.clear(); renderList(); renderBulk(); };

  $('#seed-btn').onclick = seed;
  $('#seed-btn-2').onclick = seed;
  $('#new-btn').onclick = async () => { if (state.dirty && !(await confirmModal('Сбросить черновик?', 'Есть несохранённые изменения.', 'Сбросить'))) return; resetEditor(); $('#f-title').focus(); };
  $('#reset-btn').onclick = async () => { if (state.dirty && !(await confirmModal('Сбросить изменения?', 'Несохранённые правки будут потеряны.', 'Сбросить'))) return; state.editing ? openEditor(state.editing) : resetEditor(); };
  $('#delete-btn').onclick = () => state.editing && removeArticles([state.editing]);
  $('#save-btn').onclick = save;

  // поля редактора
  $('#f-title').addEventListener('input', () => { markDirty(true); if (!state.slugTouched && !state.editing) $('#f-slug').value = slugify($('#f-title').value); previewSoon(); });
  $('#f-slug').addEventListener('input', () => { state.slugTouched = true; markDirty(true); });
  $('#slug-regen').onclick = () => { $('#f-slug').value = slugify($('#f-title').value); markDirty(true); };
  $('#f-desc').addEventListener('input', () => { markDirty(true); updateCounts(); });
  $('#f-content').addEventListener('input', () => { markDirty(true); updateCounts(); previewSoon(); });
  $('#f-tag').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTagFromInput(); }
    if (e.key === 'Backspace' && !e.target.value && state.tags.length) { state.tags.pop(); renderTags(); markDirty(true); }
  });
  $('#f-tag').addEventListener('blur', addTagFromInput);
  $('#status-seg').addEventListener('click', e => { const b = e.target.closest('[data-status]'); if (!b) return; state.status = b.dataset.status; syncStatusSeg(); markDirty(true); });
  $('#view-seg').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (!b) return; $('#editor-body').dataset.view = b.dataset.view; $$('#view-seg button').forEach(x => x.classList.toggle('is-active', x === b)); });
  $('#preview-size').addEventListener('input', e => { $('#preview').style.fontSize = e.target.value + 'px'; });

  // модалка
  $('#modal-ok').onclick = () => closeModal(true);
  $('#modal-cancel').onclick = () => closeModal(false);
  $('#modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(false); });

  // клавиатура
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#modal').hidden) closeModal(false);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !$('#app').hidden) { e.preventDefault(); save(); }
  });
  window.addEventListener('beforeunload', e => { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });
}

/* ---------- старт ---------- */
async function init() {
  bindUI();
  try { const me = await bootstrap(); if (me) await enterStudio(me); else showAuth(); }
  catch { showAuth(); }
  $('#boot').hidden = true;
}
init();