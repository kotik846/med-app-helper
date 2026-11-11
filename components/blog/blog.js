import { posts } from "../../data/posts.js";

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function renderBlog(slug) {
  const blog = document.createElement("section");
  blog.className = "blog-screen";

  const post = slug && posts.find((item) => item.slug === slug);
  blog.appendChild(post ? renderPost(post) : renderPostList());
  return blog;
}

function sortedPosts() {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

function renderPostList() {
  const list = document.createElement("div");
  list.className = "blog";
  list.innerHTML = `
    <h1 class="blog-title">Блог</h1>
    <p class="blog-description">Новости и статьи о заболеваниях, профилактике и здоровье.</p>
    <div class="blog-list"></div>
  `;

  const cards = list.querySelector(".blog-list");
  sortedPosts().forEach((post) => {
    const card = document.createElement("a");
    card.className = "blog-card";
    card.href = `#/blog/${post.slug}`;
    card.append(
      renderMeta(post),
      createElement("h2", "blog-card-title", post.title),
      createElement("p", "blog-card-summary", post.summary),
      createElement("span", "blog-card-more", "Читать →"),
    );
    cards.appendChild(card);
  });

  return list;
}

function renderPost(post) {
  const article = document.createElement("article");
  article.className = "blog blog-post";

  const back = createElement("a", "blog-back", "← Все статьи");
  back.href = "#/blog";
  article.append(back, renderMeta(post), createElement("h1", "blog-title", post.title));

  post.body.forEach((block) => {
    if (Array.isArray(block)) {
      const list = document.createElement("ul");
      list.className = "blog-post-list";
      block.forEach((item) => list.appendChild(createElement("li", "", item)));
      article.appendChild(list);
    } else {
      article.appendChild(createElement("p", "blog-post-text", block));
    }
  });

  const cta = createElement("a", "blog-cta", "Есть вопросы о самочувствии? Спросите в чате →");
  cta.href = "#/chat";
  article.append(
    createElement(
      "p",
      "blog-notice",
      "⚠️ Материал носит справочный характер и не заменяет консультацию врача.",
    ),
    cta,
  );

  return article;
}

function renderMeta(post) {
  const meta = createElement("div", "blog-meta");
  meta.append(
    createElement("span", "blog-tag", post.tag),
    createElement("time", "blog-date", dateFormat.format(new Date(post.date))),
  );
  meta.lastChild.dateTime = post.date;
  return meta;
}

function createElement(tag, className, text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}
