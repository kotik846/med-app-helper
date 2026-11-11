const STYLE_ID = 'medii-nav-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
body.medii-has-nav .mhome-nav{display:none!important}
.mnav-root{position:sticky;top:0;z-index:80;display:block;background:rgba(10,14,20,.93);backdrop-filter:blur(10px);border-bottom:1px solid #273140;font-family:'Segoe UI',system-ui,sans-serif}
.mnav-root::before{content:'';display:block;height:2px;background:linear-gradient(90deg,#ff4d5a,#b78cff,#5aa7ff)}
.mnav{max-width:1240px;margin:0 auto;display:flex;align-items:center;gap:18px;padding:12px 22px}
.mnav-brand{display:flex;align-items:center;gap:10px;color:#f2efe8;text-decoration:none;font-weight:800;font-size:16px}
.mnav-cross{width:30px;height:30px;border-radius:10px;background:linear-gradient(135deg,#ff4d5a,#e63946);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;box-shadow:0 6px 16px rgba(230,57,70,.4)}
.mnav-links{margin-left:auto;display:flex;gap:6px}
.mnav-links a{color:#a8a496;text-decoration:none;font-weight:700;font-size:13.5px;padding:8px 14px;border-radius:999px;transition:.15s}
.mnav-links a:hover{color:#f2efe8;background:#1a212c}
.mnav-links a.on{color:#ff4d5a;background:rgba(255,77,90,.12)}
.mnav-cta{border:1px solid rgba(255,77,90,.5);background:rgba(255,77,90,.12);color:#ff4d5a;border-radius:999px;padding:9px 17px;font-weight:800;font-size:12.5px;cursor:pointer;transition:.15s;font-family:inherit}
.mnav-cta:hover{background:rgba(255,77,90,.22);transform:translateY(-1px)}
@media(max-width:640px){.mnav{padding:10px 14px;gap:10px}.mnav-links a{padding:7px 10px;font-size:12px}.mnav-cta{padding:8px 12px;font-size:11.5px}.mnav-brand span:last-child{display:none}}
`;
  document.head.append(s);
}

function resolveRoot(container) {
  if (container instanceof Element) return container;
  if (typeof container === 'string') {
    const el = document.querySelector(container);
    if (el) return el;
  }
  for (const sel of ['[data-medii-nav]', '#nav', '#navbar', '#site-nav', 'body > header']) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  const el = document.createElement('header');
  document.body.prepend(el);
  return el;
}

export function renderNav(container) {
  injectStyles();
  const root = resolveRoot(container);
  if (!root) return null;

  document.body.classList.add('medii-has-nav');
  root.classList.add('mnav-root');

  const path = location.pathname;
  const isBlog = /blog/.test(path) || /^\/articles\//.test(path);
  const isStudio = /studio/.test(path);
  const isHome = !isBlog && !isStudio;

  root.innerHTML = `
    <nav class="mnav">
      <a class="mnav-brand" href="/" data-nav-home><span class="mnav-cross">+</span><span>МедИИ</span></a>
      <div class="mnav-links">
        <a href="/" data-nav-home class="${isHome ? 'on' : ''}">Главная</a>
        <a href="/blog.html" class="${isBlog ? 'on' : ''}">Блог</a>
        <a href="/studio.html" class="${isStudio ? 'on' : ''}">Студия</a>
      </div>
      <button class="mnav-cta" type="button" data-nav-chat>Начать чат</button>
    </nav>`;

  const onIndex = path === '/' || /index\.html$/.test(path);
  root.querySelectorAll('[data-nav-home]').forEach(el => {
    el.addEventListener('click', e => {
      const homeLink = document.querySelector('[data-home-link]');
      if (onIndex && homeLink) { e.preventDefault(); homeLink.click(); }
    });
  });

  root.querySelector('[data-nav-chat]').addEventListener('click', () => {
    const btn = document.querySelector('[data-start-chat]');
    if (btn) btn.click();
    else location.href = '/';
  });

  return { root };
}

export const initNav = renderNav;
export const createNav = renderNav;
export const mountNav = renderNav;
export function Nav(container) { return renderNav(container); }
export default renderNav;