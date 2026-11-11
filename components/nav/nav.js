(() => {
  const path = location.pathname;
  const isBlog = /\/blog\.html$/.test(path) || /^\/articles\//.test(path);
  const isStudio = /\/studio\.html$/.test(path);
  const isHome = !isBlog && !isStudio;
  const links = [
    ['/', 'Главная', isHome],
    ['/blog.html', 'Блог', isBlog],
    ['/studio.html', 'Студия', isStudio],
  ];
  const existing = document.querySelector('.nav nav, .topnav, .mhome-links, .mchat-links');
  if (existing) {
    for (const [href, label] of links) {
      if (![...existing.querySelectorAll('a')].some(a => a.getAttribute('href') === href)) {
        const a = document.createElement('a'); a.href = href; a.textContent = label; existing.append(a);
      }
    }
    return;
  }
  const style = document.createElement('style');
  style.textContent = `.mnav{position:sticky;top:0;z-index:900;display:flex;align-items:center;gap:16px;padding:10px 20px;background:rgba(11,13,17,.94);border-bottom:1px solid #2a303c;font-family:'Segoe UI',system-ui,sans-serif}.mnav .b{display:flex;align-items:center;gap:9px;color:#f4f1ea;font-weight:800}.mnav .c{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#ff4d5a,#e63946);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800}.mnav .links{margin-left:auto;display:flex;gap:6px}.mnav a{color:#a8a294;text-decoration:none;font-weight:700;font-size:13px;padding:7px 13px;border-radius:999px}.mnav a:hover{color:#f4f1ea;background:#1a1e26}.mnav a.on{color:#ff4d5a;background:rgba(255,77,90,.12)}`;
  document.head.append(style);
  const bar = document.createElement('header');
  bar.className = 'mnav';
  bar.innerHTML = `<span class="b"><span class="c">+</span>МедИИ</span><nav class="links">${links.map(([h, l, on]) => `<a href="${h}" class="${on ? 'on' : ''}">${l}</a>`).join('')}</nav>`;
  document.body.prepend(bar);
})();