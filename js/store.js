import { API_URL, SITE_KEY } from './config.js';

const LS = 'medii_store_v1';
const SESSION = 'medii_session_v1';
const ACCOUNTS = 'medii_accounts_v1';
const REFRESH = 'blog_refresh_' + SITE_KEY;
let access = null, online = false;

const now = () => new Date().toISOString();
const uid = () => Date.now() + Math.floor(Math.random() * 1e4);

const SEED = [
  { title: 'Температура у взрослого: что делать дома', slug: 'temperatura-u-vzroslogo', description: 'Когда сбивать температуру и когда срочно к врачу.', tags: ['health', 'first-aid'], content: '## Что делать дома\n\n- Пейте больше жидкости маленькими глотками.\n- Отдыхайте, проветривайте комнату (20–22 °C).\n- Не кутайтесь; жаропонижающее — по инструкции.\n\n## Чего избегать\n\n- Обтираний спиртом и уксусом.\n- Антибиотиков «на всякий случай».\n\n> Срочно к врачу: температура выше 39,5 °C более трёх дней, сыпь, одышка, боль в груди.\n\n*Информация носит справочный характер и не заменяет консультацию врача.*' },
  { title: 'Ожоги: первая помощь за 5 шагов', slug: 'pervaya-pomoshch-pri-ozhogah', description: 'Прохладная вода, чистая повязка, никаких народных средств.', tags: ['first-aid', 'burns'], content: '## Шаги\n\n1. Охлаждайте прохладной проточной водой 20 минут.\n2. Снимите кольца и одежду рядом с ожогом.\n3. Закройте чистой неприлипающей повязкой.\n4. Обезбольте по инструкции.\n\n> К врачу: ожог больше ладони, лицо/кисти/суставы, химический или электрический ожог.\n\nНельзя: масло, лёд, прокалывать пузыри.\n\n*Информация носит справочный характер и не заменяет консультацию врача.*' },
  { title: 'Как подготовиться к визиту к врачу', slug: 'podgotovka-k-vrachu', description: 'Чек-лист: дневник симптомов, список лекарств, три вопроса.', tags: ['checkup', 'health'], content: '## За день до приёма\n\n- Запишите симптомы: когда начались, что усиливает.\n- Соберите список лекарств и БАДов.\n- Подготовьте прошлые анализы.\n\n## Три вопроса врачу\n\n1. Что со мной и почему?\n2. Какие варианты действий есть?\n3. Какие признаки требуют срочного обращения?\n\n*Информация носит справочный характер и не заменяет консультацию врача.*' },
  { title: 'Гигиена сна: 7 правил без таблеток', slug: 'gigiena-sna', description: 'Режим, темнота, прохлада и ритуал отхода ко сну.', tags: ['sleep', 'lifestyle'], content: '## Правила\n\n1. Один режим сна каждый день.\n2. Спальня 18–20 °C, темнота и тишина.\n3. Экраны — за час до сна.\n4. Кофеин — до обеда.\n5. Кровать — только для сна.\n\n> Бессонница больше трёх недель — повод обратиться к врачу.\n\n*Информация носит справочный характер и не заменяет консультацию врача.*' },
  { title: 'Домашняя аптечка: что действительно нужно', slug: 'domashnyaya-aptechka', description: 'Перевязка, инструменты и базовые препараты без лишнего.', tags: ['first-aid', 'home'], content: '## Состав\n\n- Стерильные салфетки, бинты, пластыри.\n- Антисептик для кожи вокруг раны.\n- Термометр, ножницы, перчатки.\n- Парацетамол и ибупрофен, антигистаминное.\n\n## Хранение\n\nСухое, тёмное, недоступное для детей место. Проверяйте сроки годности.\n\n*Информация носит справочный характер и не заменяет консультацию врача.*' },
];

function read() {
  try { const d = JSON.parse(localStorage.getItem(LS)); if (d && Array.isArray(d.articles)) return d; } catch {}
  const d = { articles: SEED.map((a, i) => ({ ...a, id: i + 1, status: 'published', views: 40 + i * 17, likes: 0, comments: 0, version: 1, author: { username: 'medii', display_name: 'Редакция МедИИ' }, created_at: now(), updated_at: now(), published_at: now() })) };
  localStorage.setItem(LS, JSON.stringify(d));
  return d;
}
const write = d => localStorage.setItem(LS, JSON.stringify(d));

class ApiError extends Error { constructor(status, code, message) { super(message); this.status = status; this.code = code; } }

async function remote(path, { method = 'GET', body, query, auth = false } = {}) {
  const url = new URL(API_URL + path, location.origin);
  for (const [k, v] of Object.entries(query || {})) if (v != null && v !== '') url.searchParams.set(k, v);
  const h = { 'X-Site-Key': SITE_KEY };
  if (body !== undefined) h['Content-Type'] = 'application/json';
  if (auth && access) h.Authorization = 'Bearer ' + access;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { method, headers: h, body: body !== undefined ? JSON.stringify(body) : undefined, signal: ctrl.signal });
    if ((res.headers.get('content-type') || '').includes('text/html')) throw new ApiError(0, 'html', 'Сервер вернул HTML вместо JSON');
    if (!res.ok) { const e = await res.json().catch(() => null); const er = e?.error; throw new ApiError(res.status, er?.code || 'http', er?.message || res.statusText); }
    online = true;
    return res.status === 204 ? null : res.json();
  } catch (e) {
    if (e instanceof ApiError) throw e;
    online = false;
    throw new ApiError(0, 'network', 'API недоступен');
  } finally { clearTimeout(t); }
}

async function hashPassword(password, salt) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + password));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const loadAccounts = () => { try { return JSON.parse(localStorage.getItem(ACCOUNTS)) || []; } catch { return []; } };
const saveAccounts = a => localStorage.setItem(ACCOUNTS, JSON.stringify(a));
async function upsertLocalAccount(username, email, password) {
  const accounts = loadAccounts();
  const salt = crypto.randomUUID();
  const passwordHash = await hashPassword(password, salt);
  const i = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
  const rec = { username, email: email.toLowerCase(), display_name: username, salt, passwordHash, created_at: now() };
  if (i > -1) accounts[i] = { ...accounts[i], ...rec }; else accounts.push(rec);
  saveAccounts(accounts);
}

export const isOnline = () => online;
export const getSession = () => { try { return JSON.parse(localStorage.getItem(SESSION)); } catch { return null; } };
const setSession = s => { if (s) localStorage.setItem(SESSION, JSON.stringify(s)); else localStorage.removeItem(SESSION); };
const getRefresh = () => localStorage.getItem(REFRESH);

export async function init() {
  read();
  const s = getSession();
  if (s?._mode === 'remote') {
    const r = getRefresh();
    if (r) {
      try {
        const t = await remote('/auth/refresh', { method: 'POST', body: { refresh_token: r } });
        access = t.access_token; localStorage.setItem(REFRESH, t.refresh_token);
        const me = await remote('/me', { auth: true });
        setSession({ ...me, _mode: 'remote' });
      } catch (e) { if (e.status === 401 || e.status === 403) { setSession(null); access = null; localStorage.removeItem(REFRESH); } }
    } else setSession(null);
  }
  await pull();
}

export async function pull() {
  try {
    const r = await remote('/articles', { query: { page: 1, page_size: 100 } });
    const d = read();
    const map = new Map(d.articles.map(a => [a.slug, a]));
    for (const a of r.items || []) map.set(a.slug, { ...a, _remote: true });
    d.articles = [...map.values()]; write(d); online = true;
  } catch { online = false; }
}

export const listSync = () => read().articles;
export const getBySlugSync = slug => read().articles.find(a => a.slug === slug) || null;

function authRejection(e) {
  if (e.code === 'invalid_credentials' || e.status === 401) return 'Неверный email или пароль';
  if (e.code === 'already_exists' || e.status === 409) return 'Email или логин уже занят';
  if (e.code === 'validation_failed') return 'Проверьте правильность полей';
  return e.message || 'Ошибка авторизации';
}
const isRealRejection = e => e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 429;

async function localLogin(email, password) {
  const acc = loadAccounts().find(a => a.email === email.toLowerCase());
  if (!acc) throw new Error('Локальный аккаунт не найден. Зарегистрируйтесь.');
  if (await hashPassword(password, acc.salt) !== acc.passwordHash) throw new Error('Неверный пароль');
  const session = { username: acc.username, display_name: acc.display_name, email: acc.email, _mode: 'local', _local: true };
  setSession(session);
  return { session, remote: false };
}
async function localRegister(username, email, password) {
  const accounts = loadAccounts();
  if (accounts.some(a => a.email === email.toLowerCase())) throw new Error('Email уже занят');
  if (accounts.some(a => a.username === username)) throw new Error('Логин уже занят');
  await upsertLocalAccount(username, email, password);
  const session = { username, display_name: username, email: email.toLowerCase(), _mode: 'local', _local: true };
  setSession(session);
  return { session, remote: false };
}

export async function login(email, password) {
  try {
    const t = await remote('/auth/login', { method: 'POST', body: { email, password } });
    access = t.access_token; localStorage.setItem(REFRESH, t.refresh_token);
    const me = await remote('/me', { auth: true });
    await upsertLocalAccount(me.username, email, password).catch(() => {});
    const session = { ...me, email, _mode: 'remote' };
    setSession(session);
    return { session, remote: true };
  } catch (e) {
    if (isRealRejection(e)) throw new Error(authRejection(e));
    return localLogin(email, password);
  }
}
export async function register(username, email, password) {
  try {
    const t = await remote('/auth/register', { method: 'POST', body: { username, email, password } });
    access = t.access_token; localStorage.setItem(REFRESH, t.refresh_token);
    const me = await remote('/me', { auth: true });
    await upsertLocalAccount(username, email, password).catch(() => {});
    const session = { ...me, email, _mode: 'remote' };
    setSession(session);
    return { session, remote: true };
  } catch (e) {
    if (isRealRejection(e)) throw new Error(authRejection(e));
    return localRegister(username, email, password);
  }
}
export async function logout() {
  const r = getRefresh();
  if (r) { try { await remote('/auth/logout', { method: 'POST', body: { refresh_token: r } }); } catch {} }
  access = null; localStorage.removeItem(REFRESH); setSession(null);
}

function author() { const s = getSession(); return s ? { username: s.username, display_name: s.display_name || s.username } : { username: 'medii', display_name: 'Редакция МедИИ' }; }

export async function create(data) {
  const d = read();
  let slug = data.slug;
  if (d.articles.some(a => a.slug === slug)) slug += '-' + Date.now().toString(36).slice(-4);
  const a = { ...data, id: uid(), views: 0, likes: 0, comments: 0, version: 1, author: author(), created_at: now(), updated_at: now(), published_at: data.status === 'published' ? now() : null };
  d.articles.unshift(a); write(d);
  if (access) { try { const r = await remote('/articles', { method: 'POST', body: { ...data, slug }, auth: true }); Object.assign(a, r, { _remote: true }); write(d); } catch {} }
  return a;
}
export async function update(id, changes) {
  const d = read(); const a = d.articles.find(x => x.id === id); if (!a) throw new Error('Статья не найдена');
  Object.assign(a, changes, { updated_at: now(), version: (a.version || 1) + 1 });
  if (changes.status === 'published' && !a.published_at) a.published_at = now();
  write(d);
  if (access && a._remote) { try { const r = await remote('/articles/' + a.id, { method: 'PATCH', body: changes, auth: true }); Object.assign(a, r); write(d); } catch {} }
  return a;
}
export async function remove(id) {
  const d = read(); const a = d.articles.find(x => x.id === id);
  d.articles = d.articles.filter(x => x.id !== id); write(d);
  if (access && a?._remote) { try { await remote('/articles/' + a.id, { method: 'DELETE', auth: true }); } catch {} }
  return a;
}
export async function view(id) { const d = read(); const a = d.articles.find(x => x.id === id); if (a) { a.views++; write(d); } }
export async function seed() { let n = 0; for (const s of SEED) { if (!read().articles.some(a => a.slug === s.slug)) { await create({ ...s, status: 'published' }); n++; } } return n; }