// js/articles.js
import { api, etagOf } from './api.js';

export const listArticles = (params = {}) =>
  api('/articles', { query: { page: 1, page_size: 20, ...params } });

export const getBySlug = (slug) =>
  api(`/articles-by-slug/${encodeURIComponent(slug)}`);

export const createArticle = (data) =>
  api('/articles', { method: 'POST', body: data });

export const updateArticle = (article, changes) =>
  api(`/articles/${article.id}`, {
    method: 'PATCH',
    headers: { 'If-Match': etagOf(article) },
    body: changes,
  });

export const publish = (article) =>
  updateArticle(article, { status: 'published' });

export const deleteArticle = (article) =>
  api(`/articles/${article.id}`, {
    method: 'DELETE',
    headers: { 'If-Match': etagOf(article) }
  });

export const registerView = (articleId) =>
  api(`/articles/${articleId}/views`, { method: 'POST' }).catch(() => {});

export async function toggleLike(article, button) {
  button.disabled = true;
  try {
    const r = await api(`/articles/${article.id}/like`, {
      method: article.liked_by_me ? 'DELETE' : 'PUT'
    });
    article.liked_by_me = r.liked_by_me;
    article.likes = r.likes;
    button.classList.toggle('is-liked', r.liked_by_me);
    button.querySelector('.count').textContent = r.likes;
  } catch (err) {
    if (err.status === 401) location.href = '/login.html';
    else throw err;
  } finally {
    button.disabled = false;
  }
}

export async function loadCommentTree(articleId) {
  const all = [];
  for (let page = 1; ; page++) {
    const r = await api(`/articles/${articleId}/comments`, {
      query: { page, page_size: 100 }
    });
    all.push(...r.items);
    if (page * r.page_size >= r.total) break;
  }

  const roots = [];
  const byId = new Map(all.map((c) => [c.id, { ...c, replies: [] }]));
  for (const c of byId.values()) {
    if (c.parent_id && byId.has(c.parent_id))
      byId.get(c.parent_id).replies.push(c);
    else roots.push(c);
  }
  return roots;
}

export const addComment = (articleId, content, parentId = null) =>
  api(`/articles/${articleId}/comments`, {
    method: 'POST',
    body: { content, parent_id: parentId }
  });

export const editComment = (id, content) =>
  api(`/comments/${id}`, { method: 'PATCH', body: { content } });

export const deleteComment = (id) =>
  api(`/comments/${id}`, { method: 'DELETE' });

export const getTags = () => api('/tags', { query: { page_size: 100 } });