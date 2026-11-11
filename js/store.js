import { API_URL, SITE_KEY } from './config.js';

const LS = 'medii_store_v1';
const SESSION = 'medii_session_v1';
const ACCOUNTS = 'medii_accounts_v1';
const REFRESH = 'blog_refresh_' + SITE_KEY;
let access = null, online = false;

const now = () => new Date().toISOString();
const uid = () => Date.now() + Math.floor(Math.random() * 1e4);

const SEED = [
  {
    title: 'Температура 38,5 у взрослого: что делать в первые 2 часа',
    slug: 'temperatura-38-5-chto-delat',
    description: 'Пошаговый план: когда сбивать, какие препараты, как пить воду, когда вызывать скорую.',
    tags: ['temperature', 'first-aid', 'fever'],
    content: `## Первые 30 минут

1. **Измерьте температуру** электронным термометром (под мышкой 5 минут или орально 3 минуты).
2. **Разденьтесь до лёгкой одежды** — не кутайтесь, даже если знобит.
3. **Выпейте 400-500 мл тёплой жидкости** — вода, морс, компот. Пейте маленькими глотками каждые 5 минут.
4. **Проветрите комнату** до 20-22°C, закройте батарею мокрым полотенцем если воздух сухой.

## Через час

Если температура выше 38,5°C и вы плохо себя чувствуете:
- **Парацетамол 500 мг** — 1 таблетка, запить водой. Повторить через 6 часов если нужно. Максимум 4 таблетки в сутки.
- **Или ибупрофен 400 мг** — 1 таблетка после еды. Повторить через 8 часов. Максимум 3 таблетки в сутки.

Не чередуйте препараты без назначения врача.

## Чего НЕ делать

- Обтираться спиртом или уксусом (токсично, особенно для детей)
- Пить аспирин (риск кровотечения)
- Ставить горчичники или грелки
- Пить горячий чай с малиной (усиливает обезвоживание)

## Когда вызывать скорую

- Температура выше 39,5°C не сбивается препаратами
- Судороги, спутанность сознания, бред
- Сыпь, которая не бледнеет при надавливании (проверьте стаканом)
- Сильная головная боль + рвота + невозможно наклонить голову вперёд
- Одышка, боль в груди, синюшность губ

## Если температура держится 3 дня

Обратитесь к терапевту. Возможные причины: бактериальная инфекция (нужны антибиотики), пневмония, пиелонефрит. Врач назначит анализы крови и мочи.`
  },
  {
    title: 'Ожог кипятком: первая помощь за 10 минут',
    slug: 'ozhog-kipyatkom-pervaya-pomosh',
    description: 'Что делать сразу после ожога, чем мазать, когда ехать в травмпункт.',
    tags: ['burns', 'first-aid', 'emergency'],
    content: `## Первые 10 минут (критически важно)

1. **Охлаждайте ожог 20 минут** под прохладной (не ледяной) проточной водой. Это останавливает повреждение тканей.
2. **Снимите одежду и украшения** рядом с ожогом, пока не начался отёк. Если ткань прилипла — не отрывайте, обрежьте вокруг.
3. **Накройте чистой плёнкой** (пищевая плёнка идеально) или стерильной салфеткой. Не давите.

## Чем обработать

- **Пантенол спрей** — нанесите тонким слоем 2-3 раза в день
- **Олазоль** (облепиховое масло + анестезин) — если есть боль
- **Бепантен крем** — для заживления на 3-5 день

НЕ мажьте: маслом, сметаной, зубной пастой, мочой, спиртом, йодом, зелёнкой.

## Обезболивание

- **Ибупрофен 400 мг** — 1 таблетка после еды
- **Парацетамол 500 мг** — если ибупрофен нельзя

## Когда ехать в травмпункт

- Ожог больше ладони пострадавшего
- Ожог лица, шеи, кистей, стоп, промежности
- Пузыри больше 2 см в диаметре
- Белый или обугленный участок кожи (глубокий ожог)
- Химический ожог (кислота, щёлочь)
- Электрический ожог (даже если кожа целая — возможен ожог внутренних органов)

## Если образовались пузыри

- Не прокалывайте сами — риск инфекции
- Если пузырь лопнул сам — промойте хлоргексидином, наложите стерильную повязку с Левомеколем
- Меняйте повязку 1 раз в день

## Заживление

- Маленький ожог (до 5 см): 7-10 дней
- Средний (5-10 см): 2-3 недели
- После заживления используйте крем от рубцов (Контрактубекс) 2-3 месяца`
  },
  {
    title: 'Боль в горле: как отличить ангину от ОРВИ и что делать',
    slug: 'bol-v-gorle-angina-ili-orvi',
    description: 'Тест на ангину, полоскания, таблетки, когда нужны антибиотики.',
    tags: ['throat', 'angina', 'orvi', 'antibiotics'],
    content: `## Тест на ангину (Centor)

Ответьте на вопросы:
1. Температура выше 38°C? (+1 балл)
2. Нет кашля? (+1 балл)
3. Увеличены лимфоузлы на шее? (+1 балл)
4. Налёт на миндалинах? (+1 балл)
5. Возраст 3-14 лет? (+1 балл), 15-44 года (0 баллов), 45+ (-1 балл)

**0-1 балл**: скорее всего ОРВИ, антибиотики не нужны
**2-3 балла**: сдайте мазок на стрептококк
**4-5 баллов**: высокая вероятность ангины, нужен врач

## Что делать при ОРВИ (вирусное)

- **Полоскание**: 1 ч.л. соли + 0.5 ч.л. соды на стакан тёплой воды, 4-5 раз в день
- **Таблетки для рассасывания**: Стрепсилс, Граммидин, Фарингосепт — по 1 таблетке каждые 3 часа
- **Спреи**: Тантум Верде, Гексорал, Ингалипт — 2 впрыскивания 3 раза в день
- **Тёплое питьё**: чай с мёдом и лимоном, молоко с мёдом (если нет аллергии)

## Если ангина (бактериальная)

Нужны антибиотики. Врач обычно назначает:
- **Амоксициллин 500 мг** — 3 раза в день, 7-10 дней
- **Или Амоксиклав 875/125 мг** — 2 раза в день, 7 дней

⚠️ Не прекращайте курс раньше, даже если стало лучше — риск осложнений на сердце и почки.

## Когда срочно к врачу

- Невозможно глотать слюну (слюнотечение)
- Невозможно открыть рот (тризм)
- Осиплость голоса больше 2 недель
- Температура выше 39°C не сбивается
- Сыпь на теле + боль в горле (скарлатина)
- Боль в горле только с одной стороны + отёк (паратонзиллярный абсцесс)

## Осложнения нелеченой ангины

- Ревматическая лихорадка (поражение сердца)
- Гломерулонефрит (поражение почек)
- Паратонзиллярный абсцесс (гнойник рядом с миндалиной)

Если после курса антибиотиков температура держится — повторный визит к врачу обязателен.`
  },
  {
    title: 'Головная боль: когда это опасно и как помочь себе',
    slug: 'golovnaya-bol-kogda-opasna',
    description: 'Типы головной боли, таблетки, триггеры, красные флаги.',
    tags: ['headache', 'migraine', 'pain'],
    content: `## Типы головной боли

**1. Головная боль напряжения** (70% случаев)
- Давит как обруч, с обеих сторон
- Умеренная, не усиливается от движения
- Причина: стресс, недосып, долгое сидение за компьютером

**2. Мигрень**
- Пульсирует с одной стороны
- Средняя или сильная
- Тошнота, светобоязнь, звукобоязнь
- Длится 4-72 часа
- Часто есть аура: вспышки, онемение руки за 30 минут до боли

**3. Кластерная головная боль**
- Невыносимая боль вокруг одного глаза
- Глаз краснеет, слезится, веко опускается
- Приступы по 15-180 минут, сериями по несколько недель
- Чаще у мужчин

## Что принять

**Головная боль напряжения:**
- Ибупрофен 400 мг — 1 таблетка после еды
- Или парацетамол 500 мг — 1-2 таблетки
- Максимум 3 дня в неделю, иначе риск лекарственной головной боли

**Мигрень:**
- **Суматриптан 50 мг** — 1 таблетка при первых признаках (рецептурный)
- Или ибупрофен 600 мг + кофеин (Кофетамин)
- Лечь в тёмной тихой комнате, холодный компресс на лоб

## Немедикаментозные методы

- Массаж висков и шеи 5-10 минут
- Тёплый душ на воротниковую зону
- Стакан воды (обезвоживание — частая причина)
- Кофе (1-2 чашки) — помогает при мигрени, но не злоупотребляйте
- Сон 30-60 минут (если есть возможность)

## Триггеры мигрени

- Продукты: шоколад, сыр, красное вино, копчёности, глутамат натрия
- Пропуск еды, обезвоживание
- Недосып или пересып
- Стресс или после стресса (выходные)
- Яркий свет, мерцание экрана
- Менструация (за 2 дня до и в первые дни)

Ведите дневник головной боли 1 месяц — найдёте свои триггеры.

## Когда срочно к врачу

- Внезапная "самая сильная головная боль в жизни" (риск кровоизлияния)
- Головная боль + температура + скованность шеи (менингит)
- После травмы головы
- С нарушением речи, зрения, слабостью в руке/ноге (инсульт)
- Усиливается при кашле, чихании, натуживании
- Впервые после 50 лет
- Будит ночью от сна

## Когда к неврологу планово

- Головная боль чаще 15 дней в месяц
- Мигрень чаще 4 раз в месяц
- Обезболивающие не помогают
- Приступы длятся больше 72 часов`
  },
  {
    title: 'Боль в животе: когда можно подождать, а когда вызывать скорую',
    slug: 'bol-v-zhivote-kogda-skoruyu',
    description: 'Красные флаги, что можно принять до врача, чего нельзя делать.',
    tags: ['abdominal-pain', 'emergency', 'appendicitis'],
    content: `## Красные флаги — вызывайте скорую (103)

- Боль возникла внезапно и очень сильная ("кинжальная")
- Живот твёрдый как доска, невозможно дотронуться
- Кровь в стуле (алая или чёрная как дёготь)
- Кровь в рвоте (алая или как кофейная гуща)
- Температура выше 39°C + боль
- Невозможно мочиться больше 12 часов
- Беременность + боль + кровотечение
- После травмы живота
- Боль + желтуха (пожелтение кожи и глаз)
- Боль в правом боку внизу + усиливается при отпускании руки (аппендицит)

## Что можно сделать до врача

**Если боль умеренная и нет красных флагов:**

1. **Примите удобное положение** — часто помогает поза эмбриона (на боку с подтянутыми коленями)
2. **Не ешьте и не пейте** 2-3 часа (если понадобится операция, желудок должен быть пустым)
3. **Можно принять:**
   - Но-шпа (дротаверин) 40 мг — 1-2 таблетки при спазмах
   - Парацетамол 500 мг — если есть температура
4. **Положите холод** на больное место (лёд в полотенце на 15 минут)

## Чего НЕЛЬЗЯ делать

- **Не принимайте обезболивающие** (ибупрофен, кеторол, анальгин) до осмотра врача — они смазывают картину, хирург не сможет поставить диагноз
- **Не грейте живот** грелкой — если это аппендицит или воспаление, тепло ускорит перитонит
- **Не делайте клизмы** и не принимайте слабительные
- **Не ешьте и не пейте** при сильной боли
- **Не принимайте антибиотики** самостоятельно

## Частые причины боли по локализации

**Правый бок внизу:** аппендицит — срочно к хирургу
**Левый бок внизу:** дивертикулит, проблемы с яичником (у женщин)
**Верх живота по центру:** язва, гастрит, панкреатит
**Правый бок под рёбрами:** камни в желчном, холецистит
**Опоясывающая боль:** панкреатит
**Вся область живота + диарея:** кишечная инфекция

## Если боль хроническая (больше 3 месяцев)

Ведите дневник:
- Когда болит (утро/вечер, до/после еды)
- Что провоцирует (определённая еда, стресс)
- Что помогает (тепло, определённая поза, препараты)
- Сопутствующие симптомы (тошнота, вздутие, изменение стула)

С этим дневником идите к гастроэнтерологу. Возможно, понадобятся: гастроскопия, УЗИ органов брюшной полости, анализы на хеликобактер.

## Синдром раздражённого кишечника (СРК)

Если боль + вздутие + чередование запоров и диареи, и обследования ничего не нашли — это СРК. Помогает:
- Диета low-FODMAP (исключить бобовые, капусту, лук, чеснок, молоко на 2-6 недель)
- Мята перечная (капсулы с маслом мяты)
- Психотерапия (стресс — главный триггер)
- Мебеверин (Дюспаталин) 200 мг 2 раза в день при спазмах`
  },
  {
    title: 'Как подготовиться к анализам крови: что можно и нельзя',
    slug: 'podgotovka-k-analizam-krovi',
    description: 'За сколько часов не есть, можно ли пить воду, отменить ли лекарства.',
    tags: ['blood-tests', 'preparation', 'checkup'],
    content: `## Общие правила для большинства анализов

**За 8-12 часов:**
- Не есть (натощак — это значит 8-12 часов без еды)
- Можно пить чистую воду без газа (не более 2 стаканов)
- Не пить алкоголь
- Не курить (минимум 1 час, лучше 3)

**За 24 часа:**
- Не заниматься спортом (физическая нагрузка меняет показатели)
- Не ходить в баню/сауну
- Избегать стресса (по возможности)

**Утром перед анализом:**
- Не чистить зубы пастой с сахаром (можно без пасты или просто прополоскать)
- Не жевать жвачку
- Не пить кофе, чай, сок — только вода
- Принять лекарства, если врач не сказал отменить

## Какие анализы натощак, а какие нет

**Строго натощак (12 часов):**
- Глюкоза крови
- Инсулин
- Липидограмма (холестерин, ЛПНП, ЛПВП, триглицериды)
- Биохимия (АЛТ, АСТ, билирубин, креатинин, мочевина)
- Железо, ферритин

**Можно через 4 часа после еды:**
- Общий анализ крови
- Гликированный гемоглобин (HbA1c)
- ТТГ, Т4 свободный (гормоны щитовидки)
- ВИЧ, гепатиты, сифилис

**В любое время:**
- Группа крови, резус-фактор
- Генетические тесты
- Онкомаркеры (большинство)

## Отменять ли лекарства?

**НЕ отменять самостоятельно:**
- Препараты от давления
- Препараты от диабета (инсулин, метформин)
- Антидепрессанты
- Гормоны щитовидки (L-тироксин)

**Отменить по согласованию с врачом:**
- Витамин С за 24 часа (занижает глюкозу)
- Биотин (витамин B7) за 48-72 часа (искажает гормоны щитовидки)
- НПВС (ибупрофен) за 24 часа (влияют на почки)
- Статины за 24 часа (если проверяете их эффект)

## Для женщин

- Гормоны (ЛГ, ФСГ, эстрадиол, прогестерон) сдаются в определённые дни цикла — уточните у врача
- Онкоцитология (мазок) — не сдавать во время менструации и 2 дня после
- Маммография — на 5-12 день цикла

## Что взять с собой

- Паспорт
- Направление (если есть)
- Список лекарств с дозировками
- Результаты предыдущих анализов (для динамики)
- Воду и перекус на после анализа (особенно если диабет)

## После сдачи крови

- Посидите 10 минут в зоне ожидания (может закружиться голова)
- Не нагружайте руку 2-3 часа (не носите тяжести)
- Если место укола посинело — холод на 15 минут, потом гель с гепарином (Лиотон)
- Пейте больше воды в этот день`
  }
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