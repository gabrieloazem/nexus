import { db, setConnection } from '../services/supabase.js';
import { $, $$, dateOnly, emptyState, escapeHtml, formatDate, htmlAttr, showModal, toast } from '../ui.js';

export async function renderTasks(root) {
  let tasks = await db.list('tarefas', { order: 'ordem.asc,id.asc' });
  setConnection(true);
  let activeFilter = 'all';
  root.innerHTML = `
    <div class="page-heading"><div><div class="eyebrow">ORGANIZAÇÃO PESSOAL</div><h1>Tarefas</h1><p>Planeje seu dia e acompanhe o que já concluiu.</p></div></div>
    <div class="stats-grid" id="task-stats"></div>
    <section class="panel">
      <form class="task-compose" id="task-bulk-form"><textarea class="field" name="tarefas" placeholder="Adicione várias tarefas, uma por linha..." rows="1" required></textarea><input class="field" name="data" type="date" value="${dateOnly(new Date())}" style="max-width:155px" required><button class="btn btn-primary" type="submit">＋ Adicionar</button></form>
      <div class="toolbar"><input class="field search" id="task-search" placeholder="Buscar tarefa..."><span class="status-chip" id="task-count"></span></div>
      <div class="table-card"><table class="data-table"><thead><tr><th style="width:38px"></th><th>Tarefa</th><th>Data</th><th>Status</th><th>Prioridade</th><th>Ações</th></tr></thead><tbody id="task-rows"></tbody></table></div>
    </section>`;
  const draw = () => {
    const completed = tasks.filter(item => item.finalizada).length;
    const stats = $('#task-stats', root);
    stats.innerHTML = [
      ['Todas as tarefas', tasks.length, '◇', ''], ['Pendentes', tasks.length - completed, '◷', 'amber'], ['Realizadas', completed, '✓', 'green'],
    ].map(([label, value, icon, color], index) => `<button class="stat-card ${color}" data-task-filter="${['all', 'pending', 'done'][index]}" style="text-align:left;cursor:pointer"><div class="stat-top">${label}<span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-note">Clique para filtrar</div></button>`).join('');
    const search = $('#task-search', root).value.trim().toLocaleLowerCase('pt-BR');
    const shown = tasks.filter(task => (activeFilter === 'all' || (activeFilter === 'pending' ? !task.finalizada : task.finalizada)) && task.nome.toLocaleLowerCase('pt-BR').includes(search));
    $('#task-count', root).textContent = `${shown.length} ${shown.length === 1 ? 'registro' : 'registros'}`;
    $('#task-rows', root).innerHTML = shown.length ? shown.map(task => `<tr><td><input class="checkbox" type="checkbox" data-task-done="${task.id}" ${task.finalizada ? 'checked' : ''} aria-label="Marcar tarefa"></td><td><span class="${task.finalizada ? 'row-title' : 'row-title'}" style="${task.finalizada ? 'text-decoration:line-through;color:var(--muted)' : ''}">${escapeHtml(task.nome)}</span></td><td>${formatDate(task.data)}</td><td><span class="tag ${task.finalizada ? 'green' : 'amber'}">${task.finalizada ? 'Realizada' : 'Pendente'}</span></td><td><div class="row-actions"><button class="icon-btn" data-task-move="up:${task.id}" title="Subir prioridade" aria-label="Subir prioridade">↑</button><button class="icon-btn" data-task-move="down:${task.id}" title="Descer prioridade" aria-label="Descer prioridade">↓</button></div></td><td><div class="row-actions"><button class="icon-btn" data-task-edit="${task.id}" title="Editar">✎</button><button class="icon-btn danger" data-task-delete="${task.id}" title="Excluir">⌫</button></div></td></tr>`).join('') : `<tr><td colspan="6">${emptyState('✓', 'Nenhuma tarefa encontrada', 'Adicione uma tarefa ou altere os filtros.')}</td></tr>`;
  };
  draw();
  $('#task-search', root).addEventListener('input', draw);
  $('#task-stats', root).addEventListener('click', event => { const card = event.target.closest('[data-task-filter]'); if (card) { activeFilter = card.dataset.taskFilter; draw(); } });
  $('#task-bulk-form', root).addEventListener('submit', async event => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const names = String(form.get('tarefas')).split(/\r?\n/).map(value => value.trim()).filter(Boolean);
    if (!names.length) return;
    const max = Math.max(0, ...tasks.map(item => Number(item.ordem || 0)));
    try {
      await db.insert('tarefas', names.map((nome, index) => ({ nome, data: form.get('data'), finalizada: false, ordem: max + index + 1 })));
      toast(`${names.length} ${names.length === 1 ? 'tarefa adicionada' : 'tarefas adicionadas'}`);
      await refresh();
      formElement.reset();
      formElement.elements.data.value = dateOnly(new Date());
    } catch (error) { toast(`Não foi possível salvar: ${error.message}`, 'error'); }
  });
  root.addEventListener('change', async event => {
    const input = event.target.closest('[data-task-done]');
    if (!input) return;
    try { await db.update('tarefas', input.dataset.taskDone, { finalizada: input.checked }); await refresh(); }
    catch (error) { toast(`Não foi possível atualizar: ${error.message}`, 'error'); }
  });
  root.addEventListener('click', async event => {
    const edit = event.target.closest('[data-task-edit]');
    const remove = event.target.closest('[data-task-delete]');
    const move = event.target.closest('[data-task-move]');
    if (edit) return editTask(tasks.find(item => String(item.id) === edit.dataset.taskEdit));
    if (remove) {
      const task = tasks.find(item => String(item.id) === remove.dataset.taskDelete);
      if (!task || !confirm(`Excluir a tarefa “${task.nome}”?`)) return;
      try { await db.remove('tarefas', task.id); toast('Tarefa excluída'); await refresh(); } catch (error) { toast(`Não foi possível excluir: ${error.message}`, 'error'); }
    }
    if (move) {
      const [direction, id] = move.dataset.taskMove.split(':');
      const index = tasks.findIndex(item => String(item.id) === id);
      const target = index + (direction === 'up' ? -1 : 1);
      if (target < 0 || target >= tasks.length) return;
      const next = [...tasks]; [next[index], next[target]] = [next[target], next[index]];
      try { await Promise.all(next.map((item, order) => db.update('tarefas', item.id, { ordem: order + 1 }))); await refresh(); }
      catch (error) { toast(`Não foi possível alterar a prioridade: ${error.message}`, 'error'); }
    }
  });
  async function refresh() { tasks = await db.list('tarefas', { order: 'ordem.asc,id.asc' }); draw(); }
  function editTask(task) {
    if (!task) return;
    showModal({ title: 'Editar tarefa', content: `<form id="modal-form"><div class="form-grid"><div class="form-field full"><label>Tarefa</label><input class="field" name="nome" value="${htmlAttr(task.nome)}" required></div><div class="form-field full"><label>Data</label><input class="field" name="data" type="date" value="${htmlAttr(task.data || '')}" required></div></div></form>`, dangerLabel: 'Excluir tarefa', onDelete: async () => { if (!confirm(`Excluir a tarefa “${task.nome}”?`)) return; try { await db.remove('tarefas', task.id); toast('Tarefa excluída'); document.querySelector('.modal-backdrop')?.remove(); await refresh(); } catch (error) { toast(error.message, 'error'); } }, onSubmit: async form => { try { await db.update('tarefas', task.id, { nome: form.get('nome').trim(), data: form.get('data') }); document.querySelector('.modal-backdrop')?.remove(); toast('Tarefa atualizada'); await refresh(); } catch (error) { toast(`Não foi possível salvar: ${error.message}`, 'error'); } } });
  }
}
