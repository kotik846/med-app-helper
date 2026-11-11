(() => {
  if (document.querySelector('.topbar') || document.querySelector('.nav')) return;
  const path = location.pathname;
  const isBlog = /\/blog\.html$/.test(path) || /^\/articles\//.test(path);
  const isStudio = /\/studio\.html$/.test(path);
  const isChat = /\/chat\.html$/.test(path) || path === '/' || /\/index\.html$/.test(path);
  const style = document.createElement('style');
  style.textContent = `
    .mnav{position:sticky;top:0;z-index:900;display:flex;align-items:center;gap:18px;padding:10px 20px;background:rgba(11,13,17,.94);border-bottom:1px solid #2a303c;font-family:'Segoe UI',system-ui,sans-serif}
    .mnav a{color:#a8a294;text-decoration:none;font-weight:700;font-size:13px;padding:7px 13px;border-radius:999px;transition:.15s}
    .mnav a:hover{color:#f4f1ea;background:#1a1e26}
    .mnav a.on{color:#ff4d5a;background:rgba(255,77,90,.12)}
    .mnav .b{display:flex;align-items:center;gap:9px;color:#f4f1ea;font-weight:800}
    .mnav .c{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#ff4d5a,#e63946);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800}
    .mnav .links{margin-left:auto;display:flex;gap:6px}
  `;
  document.head.append(style);
  const bar = document.createElement('header');
  bar.className = 'mnav';
  bar.innerHTML = `<span class="b"><span class="c">+</span>МедИИ</span><nav class="links"><a href="/chat.html" class="${isChat ? 'on' : ''}">Помощник</a><a href="/blog.html" class="${isBlog ? 'on' : ''}">Блог</a><a href="/studio.html" class="${isStudio ? 'on' : ''}">Студия</a></nav>`;
  document.body.prepend(bar);
})();