import { db, setConnection } from '../services/supabase.js';
import { $, emptyState, escapeHtml, formatDate, money } from '../ui.js';

const cards = [
  ['tarefas', '✓', 'Tarefas', 'Organize o seu dia'],
  ['musicas', '♫', 'Músicas', 'Suas cifras e repertório'],
  ['financas', '◒', 'Finanças', 'Acompanhe entradas e saídas'],
  ['anotacoes', '▤', 'Anotações', 'Ideias sempre à mão'],
];

export async function renderOverview(root, navigate) {
  const [tasks, songs, finance, notes] = await Promise.all([
    db.list('tarefas', { order: 'id.desc' }), db.list('musicas', { order: 'id.desc' }),
    db.list('financas', { order: 'data.desc' }), db.list('anotacoes', { order: 'id.desc' }),
  ]);
  setConnection(true);
  const pending = tasks.filter(item => !item.finalizada).length;
  const income = finance.filter(item => item.tipo === 'Entrada').reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const expense = finance.filter(item => item.tipo === 'Saída').reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const recentTasks = tasks.filter(item => !item.finalizada).slice(0, 4);
  const recentNotes = notes.slice(0, 4);
  root.innerHTML = `
    <div class="page-heading"><div><div class="eyebrow">SEU ESPAÇO DIGITAL</div><h1>Bom ter você de volta</h1><p>Veja seus projetos e informações em um só lugar.</p></div></div>
    <div class="stats-grid">
      <article class="stat-card"><div class="stat-top">Tarefas pendentes <span class="stat-icon">✓</span></div><div class="stat-value">${pending}</div><div class="stat-note">de ${tasks.length} tarefas cadastradas</div></article>
      <article class="stat-card green"><div class="stat-top">Entradas cadastradas <span class="stat-icon">↗</span></div><div class="stat-value">${money(income)}</div><div class="stat-note">em todos os registros</div></article>
      <article class="stat-card red"><div class="stat-top">Saídas cadastradas <span class="stat-icon">↘</span></div><div class="stat-value">${money(expense)}</div><div class="stat-note">Saldo: ${money(income - expense)}</div></article>
    </div>
    <div class="overview-grid">
      <section class="panel"><div class="panel-heading"><h2>Seus módulos</h2><span class="status-chip">4 áreas</span></div><div class="module-grid">${cards.map(([route, icon, label, desc]) => `<button class="module-tile" data-route="${route}"><span class="tile-icon">${icon}</span><strong>${label}</strong><span>${desc}</span></button>`).join('')}</div></section>
      <section class="panel"><div class="panel-heading"><h2>Tarefas pendentes</h2><button class="text-link" data-route="tarefas">Ver todas →</button></div><div class="list">${recentTasks.length ? recentTasks.map(item => `<div class="list-row"><span class="row-main"><span class="row-title">${escapeHtml(item.nome)}</span><span class="row-meta">${formatDate(item.data)}</span></span><span class="tag amber">Pendente</span></div>`).join('') : emptyState('✓', 'Tudo em dia', 'Nenhuma tarefa pendente.')}</div></section>
      <section class="panel"><div class="panel-heading"><h2>Anotações recentes</h2><button class="text-link" data-route="anotacoes">Ver todas →</button></div><div class="list">${recentNotes.length ? recentNotes.map(item => `<div class="list-row"><span class="row-main"><span class="row-title">${escapeHtml(item.titulo)}</span><span class="row-meta">${escapeHtml(item.categoria || 'Sem categoria')}</span></span><span class="tag">Anotação</span></div>`).join('') : emptyState('▤', 'Sem anotações', 'Crie a sua primeira anotação.')}</div></section>
      <section class="panel"><div class="panel-heading"><h2>Biblioteca musical</h2><button class="text-link" data-route="musicas">Abrir biblioteca →</button></div><div class="list"><div class="list-row"><span class="row-main"><span class="row-title">${songs.length} ${songs.length === 1 ? 'música cadastrada' : 'músicas cadastradas'}</span><span class="row-meta">${songs.filter(song => song.favoritas).length} favoritas · ${songs.filter(song => song.finalizada).length} finalizadas</span></span><span class="tag">♫ Músicas</span></div><div class="row-meta">Use os filtros para encontrar rapidamente seu repertório.</div></div></section>
    </div>`;
}
