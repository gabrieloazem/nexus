import { db, setConnection } from '../services/supabase.js';
import { $, $$, emptyState, escapeHtml, htmlAttr, showModal, toast } from '../ui.js';

const chords = ['G#/C','A/C#','A#/D','B/D#','C/E','C#/F','D/F#','D#/G','E/G#','F/A','F#/A#','G/B','C#','D#','F#','G#','A#','Cm','C#m','Dm','D#m','Em','Fm','F#m','Gm','G#m','Am','A#m','Bm','C','D','E','F','G','A','B'];
const chordPattern = new RegExp(`(?<![\\w#])(${chords.sort((a,b)=>b.length-a.length).map(value=>value.replace(/[+#/]/g, '\\$&')).join('|')})(\\d+(?:\\.\\d+)?)?(?![\\w])`, 'g');

export async function renderSongs(root) {
  let songs = await db.list('musicas', { order: 'nome.asc' });
  setConnection(true);
  let tab = 'all';
  let categoryFilter = '';
  root.innerHTML = `<div class="page-heading"><div><div class="eyebrow">REPERTÓRIO MUSICAL</div><h1>Músicas</h1><p>Organize cifras, tonalidades e categorias em sua biblioteca.</p></div><div class="heading-actions"><button class="btn btn-primary" id="song-add">＋ Nova música</button></div></div>
    <div class="stats-grid" id="song-stats"></div>
    <section class="panel"><div class="toolbar"><input class="field search" id="song-search" placeholder="Buscar por nome..."><select class="field select-field" id="song-category"><option value="">Todas as categorias</option></select><span class="status-chip" id="song-count"></span></div><div class="toolbar" id="song-tabs"><button class="btn btn-small" data-song-tab="all">Todas</button><button class="btn btn-small" data-song-tab="favorites">★ Favoritas</button><button class="btn btn-small" data-song-tab="finished">Finalizadas</button></div><div class="table-card"><table class="data-table"><thead><tr><th>Nome</th><th>Categoria</th><th>Tonalidade</th><th>Status</th><th>Ações</th></tr></thead><tbody id="song-rows"></tbody></table></div></section>`;
  const categories = () => [...new Set(songs.flatMap(song => String(song.categorias || '').split(/[,;]+/).map(value => value.trim()).filter(Boolean)))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const draw = () => {
    const search = $('#song-search', root).value.trim().toLocaleLowerCase('pt-BR');
    const visible = songs.filter(song => {
      const matchesTab = tab === 'all' || (tab === 'favorites' ? song.favoritas : song.finalizada);
      const matchesName = String(song.nome).toLocaleLowerCase('pt-BR').includes(search);
      const matchesCategory = !categoryFilter || String(song.categorias || '').split(/[,;]+/).map(v=>v.trim()).includes(categoryFilter);
      return matchesTab && matchesName && matchesCategory;
    });
    $('#song-stats', root).innerHTML = [
      ['Todas', songs.length, '♫', ''], ['Favoritas', songs.filter(song=>song.favoritas).length, '★', 'amber'], ['Finalizadas', songs.filter(song=>song.finalizada).length, '✓', 'green'],
    ].map(([label, count, icon, color])=>`<article class="stat-card ${color}"><div class="stat-top">${label}<span class="stat-icon">${icon}</span></div><div class="stat-value">${count}</div><div class="stat-note">na biblioteca</div></article>`).join('');
    const selected = $('#song-category', root).value;
    $('#song-category', root).innerHTML = `<option value="">Todas as categorias</option>${categories().map(category=>`<option value="${htmlAttr(category)}">${escapeHtml(category)}</option>`).join('')}`;
    $('#song-category', root).value = selected;
    $('#song-count', root).textContent = `${visible.length} ${visible.length === 1 ? 'música' : 'músicas'}`;
    $$('#song-tabs [data-song-tab]',root).forEach(button=>button.classList.toggle('btn-primary', button.dataset.songTab===tab));
    $('#song-rows', root).innerHTML = visible.length ? visible.map(song=>`<tr><td><strong>${escapeHtml(song.nome)}</strong></td><td>${escapeHtml(song.categorias || '—')}</td><td>${escapeHtml(song.tonalidade || '—')}</td><td><span class="tag ${song.finalizada?'green':''}">${song.finalizada?'Finalizada':'Em andamento'}</span></td><td><div class="row-actions"><button class="icon-btn ${song.favoritas?'selected':''}" data-song-favorite="${song.id}" title="${song.favoritas?'Remover dos favoritos':'Favoritar'}">★</button><button class="icon-btn" data-song-view="${song.id}" title="Visualizar cifra">◉</button><button class="icon-btn" data-song-edit="${song.id}" title="Editar">✎</button><button class="icon-btn danger" data-song-delete="${song.id}" title="Excluir">⌫</button></div></td></tr>`).join('') : `<tr><td colspan="5">${emptyState('♫','Nenhuma música encontrada','Adicione uma música ou altere os filtros.')}</td></tr>`;
  };
  draw();
  $('#song-search',root).addEventListener('input',draw);
  $('#song-category',root).addEventListener('change',event=>{categoryFilter=event.target.value;draw();});
  $('#song-tabs',root).addEventListener('click',event=>{const button=event.target.closest('[data-song-tab]');if(button){tab=button.dataset.songTab;draw();}});
  $('#song-add',root).addEventListener('click',()=>editSong());
  root.addEventListener('click',async event=>{
    const fav=event.target.closest('[data-song-favorite]'), view=event.target.closest('[data-song-view]'), edit=event.target.closest('[data-song-edit]'), remove=event.target.closest('[data-song-delete]');
    if(fav){const song=songs.find(item=>String(item.id)===fav.dataset.songFavorite);try{await db.update('musicas',song.id,{favoritas:!song.favoritas});await refresh();}catch(error){toast(error.message,'error');}}
    if(view){const song=songs.find(item=>String(item.id)===view.dataset.songView);if(song)showSong(song);}
    if(edit){const song=songs.find(item=>String(item.id)===edit.dataset.songEdit);if(song)editSong(song);}
    if(remove){const song=songs.find(item=>String(item.id)===remove.dataset.songDelete);if(song&&confirm(`Excluir a música “${song.nome}”?`)){try{await db.remove('musicas',song.id);toast('Música excluída');await refresh();}catch(error){toast(error.message,'error');}}}
  });
  async function refresh(){songs=await db.list('musicas',{order:'nome.asc'});draw();}
  function editSong(song=null){
    const item=song||{};
    showModal({title:song?'Editar música':'Nova música',content:`<form id="modal-form"><div class="form-grid"><div class="form-field full"><label>Nome</label><input class="field" name="nome" value="${htmlAttr(item.nome||'')}" required></div><div class="form-field"><label>Categoria</label><input class="field" name="categorias" list="song-category-list" value="${htmlAttr(item.categorias||'')}" placeholder="Ex.: Louvor"><datalist id="song-category-list">${categories().map(value=>`<option value="${htmlAttr(value)}">`).join('')}</datalist></div><div class="form-field"><label>Tonalidade</label><select class="field" name="tonalidade"><option value="">Selecione</option>${['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].map(value=>`<option ${item.tonalidade===value?'selected':''}>${value}</option>`).join('')}</select></div><div class="form-field full"><label>Cifra / Conteúdo</label><textarea class="field" name="conteudo" placeholder="*Introdução\nC    G    Am\nLetra da música">${escapeHtml(item.conteudo||'')}</textarea></div><div class="form-field"><label><input type="checkbox" name="favoritas" ${item.favoritas?'checked':''}> Favorita</label></div><div class="form-field"><label><input type="checkbox" name="finalizada" ${item.finalizada?'checked':''}> Finalizada</label></div></div></form>`,onSubmit:async form=>{const values={nome:form.get('nome').trim(),categorias:form.get('categorias').trim(),tonalidade:form.get('tonalidade'),conteudo:form.get('conteudo'),favoritas:form.get('favoritas')==='on',finalizada:form.get('finalizada')==='on'};try{if(song)await db.update('musicas',song.id,values);else await db.insert('musicas',[values]);document.querySelector('.modal-backdrop')?.remove();toast(song?'Música atualizada':'Música adicionada');await refresh();}catch(error){toast(`Não foi possível salvar: ${error.message}`,'error');}}});
  }
}

function chordMarkup(line){
  const escaped=escapeHtml(line);
  return escaped.replace(chordPattern,(match,note,octave='')=>`<span class="song-chord">${note}${octave?`<sup>${octave}</sup>`:''}</span>`);
}
function showSong(song){
  const lines=String(song.conteudo||'').split(/\r?\n/).map(line=>{
    if(line.startsWith('*'))return `<div class="song-section">${escapeHtml(line.slice(1).trim())}</div>`;
    if(line.startsWith('Solo: '))return `<div class="song-solo">${chordMarkup(line)}</div>`;
    return `<div>${chordMarkup(line)||'&nbsp;'}</div>`;
  }).join('');
  showModal({title:song.nome,content:`<div class="song-content">${lines||'<span class="row-meta">Ainda não há cifra cadastrada.</span>'}</div><p class="row-meta" style="margin-top:16px">Tonalidade: ${escapeHtml(song.tonalidade||'—')} · ${escapeHtml(song.categorias||'Sem categoria')}</p><div class="chord-legend"><strong>Formatação de cifras</strong><br>Linhas iniciadas com * são títulos e seções. Linhas iniciadas com “Solo: ” recebem destaque. Notas com número são exibidas com o número elevado.</div><form id="modal-form"></form>`,submitLabel:'Fechar',onSubmit:async()=>document.querySelector('.modal-backdrop')?.remove()});
}
