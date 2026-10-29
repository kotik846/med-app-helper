import { renderNav } from "./components/nav/nav.js";
import { renderHome } from "./components/home/home.js";
import { renderChat } from "./components/chat/chat.js";
import { renderBlog } from "./components/blog/blog.js";

const app = document.getElementById("app");
const nav = renderNav();
app.appendChild(nav);

function renderPage(page) {
  // Очищаем всё кроме навигации
  const navElement = document.querySelector(".nav");
  app.innerHTML = "";
  if (navElement) {
    app.appendChild(navElement);
  }

  // Рендерим нужную страницу
  switch (page) {
    case "chat":
      app.appendChild(renderChat());
      break;
    case "blog":
      app.appendChild(renderBlog());
      break;
    default:
      app.appendChild(renderHome());
  }

  // Обновляем активную ссылку в навигации
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.textContent.toLowerCase().includes(page)) {
      link.classList.add("active");
    }
  });
}

// Обработчик изменения маршрута
function handleRoute() {
  const hash = window.location.hash.replace("#/", "") || "home";
  renderPage(hash);
}

// Слушаем изменения маршрута
window.addEventListener("hashchange", handleRoute);

// Первичная отрисовка
handleRoute();