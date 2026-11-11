// js/deeplink.js — открывает статью по ссылке /articles/{slug} или ?article={slug}
(() => {
  const q = new URLSearchParams(location.search);
  const m = location.pathname.match(/^\/articles\/([^/]+)\/?$/);
  const slug = q.get('article') || (m ? decodeURIComponent(m[1]) : null);

  const setUrl = s => history.replaceState(null, '', s ? '/blog.html?article=' + encodeURIComponent(s) : '/blog.html');

  document.addEventListener('click', e => {
    const card = e.target.closest && e.target.closest('.article-card[data-slug]');
    if (card) setUrl(card.dataset.slug);
  }, true);

  if (typeof window.closeArticle === 'function') {
    const orig = window.closeArticle;
    window.closeArticle = function () { setUrl(null); return orig.apply(this, arguments); };
  }

  if (!slug) return;
  const tryOpen = () => {
    const card = document.querySelector(`.article-card[data-slug="${CSS.escape(slug)}"]`);
    if (card) { card.click(); return true; }
    return false;
  };
  if (tryOpen()) return;
  const obs = new MutationObserver(() => { if (tryOpen()) obs.disconnect(); });
  obs.observe(document.getElementById('articles-list') || document.body, { childList: true, subtree: true });
  setTimeout(() => obs.disconnect(), 15000);
})();