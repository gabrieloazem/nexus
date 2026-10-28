import { db, request, setConnection } from '../services/supabase.js';
import { toast } from '../ui.js';

const modules = {
  tarefas: { label: 'Tarefas', fields: ['data','nome','finalizada','ordem'] },
  musicas: { label: 'Músicas', fields: ['nome','favoritas','finalizada','conteudo','categorias','tonalidade'] },
  financas: { label: 'Finanças', fields: ['tipo','titulo','valor','data','status'] },
  anotacoes: { label: 'Anotações', fields: ['categoria','titulo','conteudo'] },
};

export async function renderBackups(root) {
  await request('anotacoes?select=id&limit=1');
  setConnection(true);
  root.innerHTML = `<div class="page-heading"><div><div class="eyebrow">SEGURANÇA DOS DADOS</div><h1>Gerenciar dados</h1><p>Exporte backups ou restaure dados de um módulo específico.</p></div></div><div class="panel" style="margin-bottom:15px"><div class="panel-heading"><h2>Sobre os backups</h2><span class="status-chip">JSON</span></div><p class="row-meta" style="line-height:1.7;margin:0">Cada arquivo contém os registros de um módulo. Ao importar, os registros atuais daquele módulo serão substituídos. Os demais módulos permanecem como estão.</p></div><div class="backup-grid">${Object.entries(modules).map(([key, value]) => `<article class="backup-card"><h3>${value.label}</h3><p>Exportar ou importar todos os registros de ${value.label.toLocaleLowerCase('pt-BR')}.</p><div class="backup-actions"><button class="btn btn-small" data-backup-export="${key}">↓ Exportar JSON</button><button class="btn btn-small btn-primary" data-backup-import="${key}">↑ Importar JSON</button><input type="file" accept="application/json,.json" hidden data-backup-file="${key}"></div></article>`).join('')}</div>`;
  root.addEventListener('click', async event => {
    const exportButton=event.target.closest('[data-backup-export]'),importButton=event.target.closest('[data-backup-import]');
    if(exportButton){
      const table=exportButton.dataset.backupExport,meta=modules[table];
      try{
        const rows=await db.list(table,{order:'id.asc'});
        const blob=new Blob([JSON.stringify({module:table,exportadoEm:new Date().toISOString(),registros:rows},null,2)],{type:'application/json'});
        const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=`nexus-${table}-${new Date().toISOString().slice(0,10)}.json`;anchor.click();URL.revokeObjectURL(url);toast(`Backup de ${meta.label.toLocaleLowerCase('pt-BR')} exportado`);
      }catch(error){toast(`Não foi possível exportar: ${error.message}`,'error');}
    }
    if(importButton)root.querySelector(`[data-backup-file="${importButton.dataset.backupImport}"]`).click();
  });
  root.addEventListener('change',async event=>{
    const input=event.target.closest('[data-backup-file]');if(!input||!input.files?.[0])return;
    const table=input.dataset.backupFile,meta=modules[table];
    try{
      const parsed=JSON.parse(await input.files[0].text());
      const rows=Array.isArray(parsed)?parsed:parsed?.registros;
      if(!Array.isArray(rows))throw new Error('O arquivo precisa conter uma lista de registros.');
      if(parsed?.module&&parsed.module!==table)throw new Error(`Este arquivo pertence ao módulo ${parsed.module}.`);
      for(const [index,row] of rows.entries()){
        if(!row||typeof row!=='object'||Array.isArray(row))throw new Error(`O registro ${index+1} tem formato inválido.`);
        for(const field of meta.fields)if(!(field in row))throw new Error(`O registro ${index+1} não contém o campo “${field}”.`);
      }
      if(!confirm(`Importar ${rows.length} ${rows.length===1?'registro':'registros'} de ${meta.label}?\n\nOs registros atuais de ${meta.label} serão substituídos.`))return;
      const safeRows=rows.map(row=>Object.fromEntries(meta.fields.map(field=>[field,row[field]])));
      await db.clear(table);
      if(safeRows.length)await db.insert(table,safeRows);
      toast(`Dados de ${meta.label.toLocaleLowerCase('pt-BR')} restaurados`);
    }catch(error){toast(`Não foi possível importar: ${error.message}`,'error');}
    finally{input.value='';}
  });
}
