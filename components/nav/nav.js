export function renderNav() {
  const nav = document.createElement("header");
  nav.className = "nav";
  nav.innerHTML = `
    <a class="nav-logo" href="#/">🩺 МедИИ</a>
    <nav class="nav-links">
      <a class="nav-link" href="#/" data-page="home">Главная</a>
      <a class="nav-link" href="#/chat" data-page="chat">Чат</a>
      <a class="nav-link" href="#/blog" data-page="blog">Блог</a>
    </nav>
  `;
  return nav;
}

export function setActiveNav(nav, pageName) {
  nav.querySelectorAll(".nav-link").forEach((link) => {
    const isActive = link.dataset.page === pageName;
    link.classList.toggle("nav-link-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}
