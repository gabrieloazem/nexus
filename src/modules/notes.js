import { db, setConnection } from '../services/supabase.js';
import { $, emptyState, escapeHtml, htmlAttr, showModal, toast } from '../ui.js';

export async function renderNotes(root) {
  let notes=await db.list('anotacoes',{order:'id.desc'});
  setConnection(true);
  root.innerHTML=`<div class="page-heading"><div><div class="eyebrow">IDEIAS E REFERÊNCIAS</div><h1>Anotações</h1><p>Registre ideias, lembretes e conteúdos importantes.</p></div><div class="heading-actions"><button class="btn btn-primary" id="note-add">＋ Nova anotação</button></div></div><div class="toolbar"><input class="field search" id="note-search" placeholder="Buscar em suas anotações..."><select class="field select-field" id="note-category"><option value="">Todas as categorias</option></select><span class="status-chip" id="note-count"></span></div><div class="note-grid" id="note-grid"></div>`;
  const categories=()=>[...new Set(notes.map(note=>String(note.categoria||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const draw=()=>{
    const search=$('#note-search',root).value.trim().toLocaleLowerCase('pt-BR'), category=$('#note-category',root).value;
    const visible=notes.filter(note=>(!category||note.categoria===category)&&`${note.titulo} ${note.conteudo} ${note.categoria}`.toLocaleLowerCase('pt-BR').includes(search));
    const selected=category;
    $('#note-category',root).innerHTML=`<option value="">Todas as categorias</option>${categories().map(value=>`<option value="${htmlAttr(value)}">${escapeHtml(value)}</option>`).join('')}`;
    $('#note-category',root).value=selected;
    $('#note-count',root).textContent=`${visible.length} ${visible.length===1?'anotação':'anotações'}`;
    $('#note-grid',root).innerHTML=visible.length?visible.map(note=>`<article class="note-card" data-note-open="${note.id}" role="button" tabindex="0"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><h3>${escapeHtml(note.titulo)}</h3><button class="icon-btn" data-note-edit="${note.id}" title="Editar">✎</button></div><p>${escapeHtml(note.conteudo||'')}</p><footer><span class="tag">${escapeHtml(note.categoria||'Sem categoria')}</span><button class="icon-btn danger" data-note-delete="${note.id}" title="Excluir">⌫</button></footer></article>`).join(''):emptyState('▤','Nenhuma anotação encontrada','Crie uma anotação ou altere os filtros.');
  };
  draw();
  $('#note-search',root).addEventListener('input',draw);
  $('#note-category',root).addEventListener('change',draw);
  $('#note-add',root).addEventListener('click',()=>editNote());
  root.addEventListener('click',event=>{
    const edit=event.target.closest('[data-note-edit]'),remove=event.target.closest('[data-note-delete]'),open=event.target.closest('[data-note-open]');
    if(edit){event.stopPropagation();const note=notes.find(item=>String(item.id)===edit.dataset.noteEdit);if(note)editNote(note);}
    if(remove){event.stopPropagation();const note=notes.find(item=>String(item.id)===remove.dataset.noteDelete);if(note&&confirm(`Excluir a anotação “${note.titulo}”?`)){db.remove('anotacoes',note.id).then(async()=>{toast('Anotação excluída');await refresh();}).catch(error=>toast(error.message,'error'));}}
    if(open&&!event.target.closest('button')){const note=notes.find(item=>String(item.id)===open.dataset.noteOpen);if(note)editNote(note);}
  });
  root.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-note-open]')){event.preventDefault();const note=notes.find(item=>String(item.id)===event.target.dataset.noteOpen);if(note)editNote(note);}});
  async function refresh(){notes=await db.list('anotacoes',{order:'id.desc'});draw();}
  function editNote(note=null){
    const item=note||{};
    showModal({title:note?'Editar anotação':'Nova anotação',dangerLabel:note?'Excluir anotação':'',onDelete:async()=>{if(!confirm(`Excluir a anotação “${item.titulo}”?`))return;try{await db.remove('anotacoes',item.id);document.querySelector('.modal-backdrop')?.remove();toast('Anotação excluída');await refresh();}catch(error){toast(error.message,'error');}},content:`<form id="modal-form"><div class="form-grid"><div class="form-field full"><label>Título</label><input class="field" name="titulo" value="${htmlAttr(item.titulo||'')}" required></div><div class="form-field full"><label>Categoria</label><input class="field" name="categoria" list="note-category-list" value="${htmlAttr(item.categoria||'')}" placeholder="Escolha ou escreva uma categoria"><datalist id="note-category-list">${categories().map(value=>`<option value="${htmlAttr(value)}">`).join('')}</datalist></div><div class="form-field full"><label>Conteúdo</label><textarea class="field" name="conteudo" rows="8" placeholder="Escreva sua anotação...">${escapeHtml(item.conteudo||'')}</textarea></div></div></form>`,onSubmit:async form=>{const values={titulo:form.get('titulo').trim(),categoria:form.get('categoria').trim(),conteudo:form.get('conteudo')};try{if(note)await db.update('anotacoes',note.id,values);else await db.insert('anotacoes',[values]);document.querySelector('.modal-backdrop')?.remove();toast(note?'Anotação atualizada':'Anotação adicionada');await refresh();}catch(error){toast(`Não foi possível salvar: ${error.message}`,'error');}}});
  }
}
