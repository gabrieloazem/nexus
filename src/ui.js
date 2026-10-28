export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const dateOnly = date => {
  const d = date instanceof Date ? date : new Date(date);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
export const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
export const formatDate = value => value ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : 'Sem data';
export const monthKey = (year, month) => `${year}-${String(month + 1).padStart(2, '0')}`;
export const monthLabel = (year, month) => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
export const htmlAttr = value => escapeHtml(value).replace(/`/g, '&#96;');

let toastTimer;
export function toast(message, type = '') {
  const region = $('#toast-region');
  const node = document.createElement('div');
  node.className = `toast ${type}`;
  node.textContent = message;
  region.append(node);
  setTimeout(() => node.remove(), 3500);
  clearTimeout(toastTimer);
}

export function emptyState(icon, title, detail) {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><strong>${escapeHtml(title)}</strong>${escapeHtml(detail)}</div>`;
}

export function showModal({ title, content, onSubmit, submitLabel = 'Salvar', dangerLabel = '', onDelete } = {}) {
  closeModal();
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-label="${htmlAttr(title)}"><header class="modal-header"><h2>${escapeHtml(title)}</h2><button class="modal-close" type="button" aria-label="Fechar">×</button></header><div class="modal-body">${content}</div><footer class="modal-footer">${dangerLabel ? `<button class="btn btn-danger btn-small" type="button" data-modal-delete>${escapeHtml(dangerLabel)}</button>` : '<span></span>'}<div class="modal-footer-right"><button class="btn btn-small" type="button" data-modal-cancel>Cancelar</button><button class="btn btn-primary btn-small" type="submit" form="modal-form">${escapeHtml(submitLabel)}</button></div></footer></section>`;
  document.body.append(backdrop);
  backdrop.querySelector('.modal-close').addEventListener('click', closeModal);
  backdrop.querySelector('[data-modal-cancel]').addEventListener('click', closeModal);
  backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModal(); });
  if (onDelete) backdrop.querySelector('[data-modal-delete]').addEventListener('click', onDelete);
  const form = backdrop.querySelector('#modal-form');
  if (form && onSubmit) form.addEventListener('submit', async event => { event.preventDefault(); await onSubmit(new FormData(form), form); });
  backdrop.querySelector('input,textarea,select')?.focus();
  return backdrop;
}
export function closeModal() { $('.modal-backdrop')?.remove(); }

export function moneyInput(value = '') { return `<input class="field" name="valor" type="number" min="0" step="0.01" value="${htmlAttr(value)}" placeholder="0,00" required>`; }

export function setTheme(theme) {
  const dark = theme === 'dark';
  document.body.classList.toggle('dark', dark);
  localStorage.setItem('nexus-theme', dark ? 'dark' : 'light');
  const value = $('#theme-value');
  if (value) value.textContent = dark ? 'Escuro' : 'Claro';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#171821' : '#f5f6fa');
}

export function titleCase(value) { return value ? `${value[0].toUpperCase()}${value.slice(1)}` : ''; }
