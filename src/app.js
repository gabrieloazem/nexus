import { setConnection } from './services/supabase.js';
import { $, $$, setTheme } from './ui.js';
import { renderOverview } from './modules/home.js';
import { renderTasks } from './modules/tasks.js';
import { renderSongs } from './modules/songs.js';
import { renderFinance } from './modules/finance.js';
import { renderNotes } from './modules/notes.js';
import { renderBackups } from './modules/backup.js';

const pages = {
  home: { title: 'Visão geral', render: renderOverview },
  tarefas: { title: 'Tarefas', render: renderTasks },
  musicas: { title: 'Músicas', render: renderSongs },
  financas: { title: 'Finanças', render: renderFinance },
  anotacoes: { title: 'Anotações', render: renderNotes },
  dados: { title: 'Gerenciar dados', render: renderBackups },
};

export async function navigate(route = location.hash.slice(1) || (matchMedia('(max-width: 720px)').matches ? 'tarefas' : 'home')) {
  const page = pages[route] || pages.home;
  if (location.hash !== `#${route}`) history.replaceState(null, '', `#${route}`);
  $('#page-title').textContent = page.title;
  $$('[data-route]').forEach(button => {
    const active = button.dataset.route === route;
    button.classList.toggle('active', active);
    if (button.classList.contains('mobile-nav-item')) {
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
  });
  const content = $('#page-content');
  content.innerHTML = '<div class="panel"><div class="empty-state"><div class="empty-icon">◌</div><strong>Carregando</strong>Buscando seus dados...</div></div>';
  try { await page.render(content, navigate); }
  catch (error) {
    setConnection(false);
    content.innerHTML = `<div class="panel">${errorPanel(error)}</div>`;
  }
}

function errorPanel(error) {
  const message = String(error?.message || 'Não foi possível carregar os dados.');
  return `<div class="empty-state"><div class="empty-icon">!</div><strong>Não foi possível conectar</strong><span>${message.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])}</span><p>Confira a conexão e as permissões das tabelas no Supabase.</p><button class="btn btn-small" onclick="location.reload()">Tentar novamente</button></div>`;
}

document.addEventListener('click', event => {
  const nav = event.target.closest('[data-route]');
  if (nav) navigate(nav.dataset.route);
});
window.addEventListener('hashchange', () => navigate());
$('#theme-toggle').addEventListener('click', () => setTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));
const initialTheme = localStorage.getItem('nexus-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(initialTheme);
$('#today-label').textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date());
navigate();
