import './home.css';

const ARTICLES = [
  {
    id: 'orvi', icon: '🦠', tag: 'Простуда', read: '4 мин',
    title: 'ОРВИ: как отличить от гриппа и что делать дома',
    excerpt: 'Насморк, першение, температура — разбираемся, когда это обычная простуда, а когда нужен врач.',
    sections: [
      { icon: '🔎', tone: 'info', title: 'Что это и как отличить', body: 'ОРВИ — группа вирусных инфекций дыхательных путей. Обычно начинается постепенно: насморк, першение в горле, умеренная температура, лёгкая слабость. Грипп чаще стартует резко: высокая температура, выраженная ломота в мышцах, сильная слабость и головная боль. Точный диагноз и тактику определяет врач, особенно если состояние тяжёлое или есть хронические болезни.' },
      { icon: '🚑', tone: 'aid', title: 'Что делать дома', body: 'Больше отдыхайте и пейте тёплую жидкость маленькими глотками. Проветривайте комнату и увлажняйте воздух (40–60%). Промывайте нос солевым раствором. При плохом самочувствии или высокой температуре можно принять жаропонижающее (парацетамол или ибупрофен) строго по инструкции. Следите за динамикой: обычно заметное улучшение наступает за 3–5 дней.' },
      { icon: '⚠️', tone: 'avoid', title: 'Чего избегать', body: 'Не принимайте антибиотики «на всякий случай» — на вирусы они не действуют. Не делайте спиртовые и уксусные растирания. Не переносите болезнь «на ногах» и не ходите в баню при температуре. Не давайте аспирин детям и подросткам. Не комбинируйте несколько жаропонижающих без назначения врача.' },
      { icon: '🏥', tone: 'urgent', title: 'Когда срочно к врачу', body: 'Одышка или чувство нехватки воздуха, боль в груди, температура выше 39 °C более трёх дней, спутанность сознания, признаки обезвоживания (редкое мочеиспускание, сухость во рту), сыпь, которая не бледнеет при надавливании, или ухудшение после временного улучшения — повод обратиться за медицинской помощью немедленно.' },
    ],
  },
  {
    id: 'temperature', icon: '🌡️', tag: 'Симптомы', read: '3 мин',
    title: 'Температура: когда сбивать и как помочь себе',
    excerpt: 'Ориентир — самочувствие, а не только цифра на термометре. Безопасный план действий.',
    sections: [
      { icon: '🎯', tone: 'info', title: 'Когда сбивать', body: 'Повышенная температура — защитная реакция организма. Снижать её стоит, если она плохо переносится: сильная слабость, головная боль, ломота, или если значения приближаются к 38,5–39 °C. При хронических заболеваниях сердца, лёгких или неврологии порог может быть ниже — это обсуждается с врачом индивидуально.' },
      { icon: '🚑', tone: 'aid', title: 'Что помогает', body: 'Пейте жидкость чаще и понемногу, чтобы избежать обезвоживания. Оденьтесь легко, не кутайтесь. Поддерживайте в комнате 20–22 °C и умеренную влажность. Отдыхайте. Жаропонижающее принимайте по инструкции к конкретному препарату, соблюдая интервалы и не превышая суточную дозу.' },
      { icon: '⚠️', tone: 'avoid', title: 'Чего избегать', body: 'Не обтирайтесь спиртом или уксусом — это токсично, особенно для детей. Не укутывайтесь при ознобе до пота и не грейтесь в горячей ванне. Не чередуйте препараты без схемы от врача. Не используйте аспирин у детей. Не игнорируйте температуру, которая держится дольше трёх дней.' },
      { icon: '🏥', tone: 'urgent', title: 'Когда к врачу', body: 'Температура выше 39,5 °C, не снижается жаропонижающими, держится более трёх дней, сопровождается сыпью, сильной головной болью, скованностью шеи, одышкой, болью в груди, многократной рвотой или спутанностью сознания — обращайтесь за помощью без промедления.' },
    ],
  },
  {
    id: 'throat', icon: '🗣️', tag: 'Симптомы', read: '3 мин',
    title: 'Боль в горле: что действительно облегчает состояние',
    excerpt: 'Тёплое питьё, полоскания и покой голосу — плюс признаки, при которых тянуть нельзя.',
    sections: [
      { icon: '🚑', tone: 'aid', title: 'Что облегчает', body: 'Пейте тёплую (не горячую) жидкость, рассасывайте пастилки, полощите горло солевым раствором (половина чайной ложки соли на стакан тёплой воды). Увлажняйте воздух, дайте голосу покой. При выраженной боли подойдут парацетамол или ибупрофен по инструкции. Мягкая, не раздражающая пища уменьшает дискомфорт при глотании.' },
      { icon: '💡', tone: 'info', title: 'Почему это помогает', body: 'Тёплое питьё и увлажнение успокаивают раздражённую слизистую. Солевой раствор уменьшает отёк и смывает часть раздражающих веществ. Покой голосу снижает нагрузку на воспалённые ткани. Обезболивающее по инструкции временно уменьшает болевой сигнал, позволяя пить и есть.' },
      { icon: '⚠️', tone: 'avoid', title: 'Чего избегать', body: 'Не курите и не находитесь в накуренном помещении. Не ешьте очень горячее, острое и кислое. Не начинайте антибиотики самостоятельно — большинство болей в горле вызваны вирусами. Не шепчите长时间 — шёпот напрягает связки сильнее тихой речи; лучше говорить тихо или молчать.' },
      { icon: '🏥', tone: 'urgent', title: 'Когда к врачу', body: 'Затруднённое дыхание, невозможность глотать слюну, слюнотечение, сильная односторонняя боль и отёк, высокая температура с сыпью, отсутствие улучшения более недели, или осиплость дольше двух недель — повод для очного осмотра.' },
    ],
  },
  {
    id: 'burns', icon: '🔥', tag: 'Первая помощь', read: '4 мин',
    title: 'Ожоги: первая помощь за 5 шагов',
    excerpt: 'Прохладная вода, чистая повязка и никаких народных средств — что делать в первые минуты.',
    sections: [
      { icon: '1️⃣', tone: 'aid', title: 'Шаг 1. Охладите', body: 'Держите обожжённый участок под прохладной проточной водой около 20 минут. Это останавливает повреждение тканей и уменьшает боль. Не используйте лёд — он усиливает травму. Если воды нет, подойдёт чистая прохладная влажная ткань.' },
      { icon: '2️⃣', tone: 'aid', title: 'Шаг 2–3. Снимите и закройте', body: 'Аккуратно снимите кольца, браслеты и одежду рядом с ожогом, пока не появился отёк. Прилипшую ткань не отрывайте. Закройте ожог чистой неприлипающей повязкой или пищевой плёнкой свободно, без давления — это защищает рану от инфекции.' },
      { icon: '3️⃣', tone: 'info', title: 'Шаг 4–5. Обезбольте и оцените', body: 'При необходимости примите парацетамол или ибупрофен по инструкции. Оцените серьёзность: площадь больше ладони пострадавшего, глубокий ожог (белая или обугленная кожа), ожоги лица, кистей, стоп, суставов, промежности, а также химические и электрические ожоги требуют медицинской помощи.' },
      { icon: '⚠️', tone: 'avoid', title: 'Чего делать нельзя', body: 'Не мажьте маслом, сметаной, зубной пастой и мазями в первые минуты. Не прокалывайте пузыри. Не прикладывайте вату прямо к ране. Не отрывайте прилипшую одежду. Народные средства увеличивают риск инфекции и мешают врачу оценить глубину ожога.' },
      { icon: '🏥', tone: 'urgent', title: 'Когда срочно к врачу', body: 'Ожог больше ладони, глубокое повреждение, ожоги лица, дыхательных путей (копоть вокруг рта, осиплость), кистей, стоп, суставов, химические и электрические ожоги, признаки инфекции (гной, нарастающая боль, температура) — обращайтесь немедленно.' },
    ],
  },
  {
    id: 'doctor', icon: '📋', tag: 'Подготовка', read: '3 мин',
    title: 'Как подготовиться к визиту к врачу',
    excerpt: 'Дневник симптомов, список лекарств и три вопроса — чтобы приём прошёл с максимальной пользой.',
    sections: [
      { icon: '📝', tone: 'info', title: 'Дневник симптомов', body: 'За несколько дней запишите: когда начались симптомы, как часто возникают, что усиливает и что облегчает, насколько сильно по шкале 0–10. Отметьте температуру, сон, аппетит. Такая картина помогает врачу быстрее понять причину и не упустить важное.' },
      { icon: '💊', tone: 'info', title: 'Список лекарств', body: 'Соберите все препараты, которые принимаете регулярно: названия, дозировки, как давно. Включая витамины, БАДы и «таблетки по необходимости». Это важно для оценки совместимости и чтобы избежать дублирования назначений.' },
      { icon: '❓', tone: 'aid', title: 'Три вопроса врачу', body: 'Сформулируйте заранее: 1) Что со мной происходит и почему? 2) Какие варианты действий есть и что будет, если ничего не делать? 3) Какие признаки означают, что нужно обратиться снова или срочно? Запишите ответы или попросите разрешения записать их на диктофон.' },
      { icon: '📁', tone: 'info', title: 'Документы и анализы', body: 'Возьмите результаты прошлых анализов, выписки, снимки, список аллергий. Если идёте к узкому специалисту — предыдущие заключения по профилю. После приёма запишите рекомендации в первые часы, пока помните детали, и сохраните назначения в одной папке.' },
    ],
  },
  {
    id: 'sleep', icon: '😴', tag: 'Образ жизни', read: '3 мин',
    title: 'Сон и восстановление: гигиена сна без таблеток',
    excerpt: 'Режим, темнота, прохлада и ритуал — что действительно работает против бессонницы.',
    sections: [
      { icon: '⏰', tone: 'info', title: 'Режим', body: 'Ложитесь и вставайте в одно и то же время, включая выходные — это главный якорь циркадных ритмов. Дневной сон, если нужен, ограничьте 20–30 минутами и не позже 15:00. Регулярность важнее, чем попытки «отоспаться» в выходные.' },
      { icon: '🛏️', tone: 'aid', title: 'Среда и привычки', body: 'Спальня: 18–20 °C, темнота (плотные шторы или маска), тишина или белый шум. Кровать — только для сна. За час до сна уберите экраны, замените их книгой, тёплым душем или дыхательными упражнениями. Кофеин после 14:00 лучше исключить: он выводится около 6 часов.' },
      { icon: '⚠️', tone: 'avoid', title: 'Чего избегать', body: 'Не смотрите на часы ночью — это усиливает тревогу. Не пытайтесь «заставить» себя уснуть: если сон не идёт 20 минут, встаньте и займитесь спокойным делом при тусклом свете. Не используйте алкоголь как снотворное — он разрушает вторую половину ночи. Не тренируйтесь интенсивно за 2–3 часа до сна.' },
      { icon: '🏥', tone: 'urgent', title: 'Когда к врачу', body: 'Бессонница дольше трёх недель, громкий храп с остановками дыхания, сильная дневная сонливость, засыпание за рулём, регулярные пробуждения с удушьем — повод обратиться к врачу. Возможны апноэ сна, синдром беспокойных ног или другие состояния, требующие лечения.' },
    ],
  },
];

function resolveRoot(container) {
  if (container instanceof Element) return container;
  if (typeof container === 'string') return document.querySelector(container);
  for (const s of ['[data-medii-home]', '#home', '.home', '#home-root', '.home-container', 'main', '#app']) {
    const el = document.querySelector(s); if (el) return el;
  }
  const el = document.createElement('section'); document.body.append(el); return el;
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let escHandler = null;
function setEsc(handler) {
  if (escHandler) document.removeEventListener('keydown', escHandler);
  escHandler = handler ? e => { if (e.key === 'Escape') handler(); } : null;
  if (escHandler) document.addEventListener('keydown', escHandler);
}

export function renderHome(container) {
  const root = resolveRoot(container);
  if (!root) return null;
  root.dataset.mediiView = 'home';
  root.classList.add('medii-home-root');

  root.innerHTML = `
    <div class="mhome">
      <div class="mhome-bg" aria-hidden="true"><i class="g1"></i><i class="g2"></i><i class="g3"></i><span class="grid"></span></div>

      <header class="mhome-nav">
        <a class="mhome-brand" href="/" data-home-link><span class="mhome-cross">+</span><span>МедИИ</span></a>
        <nav class="mhome-links">
          <a href="/blog.html">Блог</a>
          <a href="/studio.html">Студия</a>
          <button class="mhome-navcta" type="button" data-start-chat>Начать чат</button>
        </nav>
      </header>

      <section class="mhome-hero">
        <div class="mhome-hero-copy">
          <span class="mhome-kicker reveal">Спокойный медицинский помощник</span>
          <h1 class="reveal d1">Здоровье начинается<br>с <span class="grad">понятных шагов</span></h1>
          <p class="reveal d2">Опишите симптомы — МедИИ разложит ответ по полочкам: первая помощь, почему это работает, чего избегать и когда пора к врачу. Без паники, без воды, по делу.</p>
          <div class="mhome-actions reveal d3">
            <button class="mhome-cta" type="button" data-start-chat><span>Начать чат</span><svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            <a class="mhome-cta ghost" href="/blog.html">Читать блог</a>
          </div>
          <div class="mhome-trust reveal d4">
            <span><i class="dot mint"></i>Первая помощь по шагам</span>
            <span><i class="dot blue"></i>Безопасные рекомендации</span>
            <span><i class="dot amber"></i>Красные флаги — когда к врачу</span>
          </div>
        </div>
        <div class="mhome-hero-visual reveal d2">
          <div class="mhome-orb"><span class="pulse"></span><span class="core">+</span></div>
          <svg class="mhome-ecg" viewBox="0 0 320 64" aria-hidden="true"><path pathLength="320" d="M0 32 H58 L70 32 79 10 90 54 101 24 110 32 H158 L170 32 179 8 190 56 201 26 210 32 H320"/></svg>
          <div class="mhome-float f1">🚑 Первая помощь</div>
          <div class="mhome-float f2">💡 Почему помогает</div>
          <div class="mhome-float f3">🏥 Когда к врачу</div>
        </div>
      </section>

      <section class="mhome-articles">
        <div class="mhome-section-head reveal">
          <span class="mhome-kicker">Полезные материалы</span>
          <h2>Статьи, которые помогают действовать</h2>
          <p>Короткие и понятные разборы частых ситуаций — с конкретными шагами и красными флагами.</p>
        </div>
        <div class="mhome-grid">
          ${ARTICLES.map((a, i) => `
            <article class="mhome-card reveal" style="--i:${i}" data-article="${a.id}" tabindex="0" role="button" aria-label="Читать: ${esc(a.title)}">
              <div class="mhome-card-top"><span class="mhome-icon">${a.icon}</span><span class="mhome-tag">${esc(a.tag)}</span><span class="mhome-read">${esc(a.read)}</span></div>
              <h3>${esc(a.title)}</h3>
              <p>${esc(a.excerpt)}</p>
              <span class="mhome-more">Читать статью <svg viewBox="0 0 24 24" width="15" height="15"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            </article>`).join('')}
        </div>
      </section>

      <footer class="mhome-footer">
        <span>⚠️ МедИИ носит справочный характер и не заменяет консультацию врача. При угрожающих симптомах вызывайте скорую.</span>
      </footer>

      <div class="mhome-modal" hidden>
        <div class="mhome-modal-card" role="dialog" aria-modal="true" aria-labelledby="mhome-modal-title">
          <button class="mhome-modal-close" type="button" aria-label="Закрыть">×</button>
          <div class="mhome-modal-head">
            <span class="mhome-icon big"></span>
            <div><span class="mhome-tag modal-tag"></span><h2 id="mhome-modal-title"></h2></div>
          </div>
          <div class="mhome-modal-body"></div>
          <div class="mhome-modal-actions">
            <button class="mhome-cta" type="button" data-discuss><span>Обсудить с МедИИ</span></button>
            <button class="mhome-cta ghost" type="button" data-close-modal>Закрыть</button>
          </div>
        </div>
      </div>
    </div>`;

  const modal = root.querySelector('.mhome-modal');
  const modalIcon = root.querySelector('.mhome-icon.big');
  const modalTag = root.querySelector('.modal-tag');
  const modalTitle = root.querySelector('#mhome-modal-title');
  const modalBody = root.querySelector('.mhome-modal-body');
  const discussBtn = root.querySelector('[data-discuss]');
  let currentArticle = null;

  async function startChat(question) {
    setEsc(null);
    const { renderChat } = await import('../chat/chat.js');
    renderChat(root, question ? { initialQuestion: question } : undefined);
  }

  function openArticle(id) {
    const a = ARTICLES.find(x => x.id === id); if (!a) return;
    currentArticle = a;
    modalIcon.textContent = a.icon;
    modalTag.textContent = `${a.tag} · ${a.read}`;
    modalTitle.textContent = a.title;
    modalBody.innerHTML = a.sections.map(s => `
      <section class="mhome-sec ${s.tone}">
        <h3><span>${s.icon}</span>${esc(s.title)}</h3>
        <p>${esc(s.body)}</p>
      </section>`).join('');
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
    setEsc(closeModal);
    root.querySelector('.mhome-modal-close').focus();
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setEsc(null);
    setTimeout(() => { modal.hidden = true; }, 220);
    currentArticle = null;
  }

  root.querySelectorAll('[data-start-chat]').forEach(b => b.addEventListener('click', () => startChat()));
  root.querySelector('[data-home-link]').addEventListener('click', e => { e.preventDefault(); renderHome(root); });
  root.querySelectorAll('[data-article]').forEach(card => {
    card.addEventListener('click', () => openArticle(card.dataset.article));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openArticle(card.dataset.article); } });
  });
  root.querySelector('.mhome-modal-close').addEventListener('click', closeModal);
  root.querySelector('[data-close-modal]').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  discussBtn.addEventListener('click', () => { if (currentArticle) startChat(`Расскажи подробнее про: ${currentArticle.title}. Что делать и когда к врачу?`); });

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  root.querySelectorAll('.reveal').forEach(el => io.observe(el));

  return { startChat, openArticle, closeModal };
}

export const initHome = renderHome;
export const createHome = renderHome;
export const mountHome = renderHome;
export function Home(container) { return renderHome(container); }
export default renderHome;

const auto = () => { if (!document.querySelector('[data-medii-view]')) renderHome(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto, { once: true });
else setTimeout(auto, 80);