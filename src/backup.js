// ================= BACKUP / RESTORE =================
function isMobileApp() {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())
        || /; wv\)/i.test(navigator.userAgent);
}

async function copyToClipboard(text) {
    // Plugin do Capacitor (se instalado)
    try {
        const plugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Clipboard;
        if (plugin) {
            await plugin.write({ string: text });
            return true;
        }
    } catch (e) { /* tenta o próximo método */ }

    // API padrão do navegador/WebView
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (e) { /* tenta o próximo método */ }

    // Último recurso: textarea temporário + execCommand
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
    } catch (e) {
        return false;
    }
}

function showCopyFallback(text) {
    const old = document.getElementById('backupModal');
    if (old) old.remove();
    const wrap = document.createElement('div');
    wrap.id = 'backupModal';
    wrap.className = 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4';
    wrap.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg flex flex-col gap-3 p-5">
            <h3 class="text-sm font-bold">Copie o backup manualmente</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Não foi possível copiar automaticamente. Selecione todo o texto abaixo e copie.</p>
            <textarea id="backupModalText" readonly class="w-full h-40 text-xs font-mono p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"></textarea>
            <div class="flex justify-end">
                <button onclick="document.getElementById('backupModal').remove()" class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-xs font-medium rounded-lg cursor-pointer">Fechar</button>
            </div>
        </div>`;
    document.body.appendChild(wrap);
    const ta = document.getElementById('backupModalText');
    ta.value = text;
    ta.focus();
    ta.select();
}

// PC: baixa o arquivo JSON. Celular (APK): copia o JSON para a área de transferência.
async function downloadJSON(data, filename) {
    const text = JSON.stringify(data, null, 2);

    if (isMobileApp()) {
        const ok = await copyToClipboard(text);
        if (ok) {
            alert('Backup copiado! Cole em um arquivo JSON (por exemplo, no Drive).');
            return true;
        }
        showCopyFallback(text);
        return false;
    }

    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
}

// ---------- Backup por módulo ----------
// Cada módulo tem: exportar (arquivo), copiar (área de transferência), importar (arquivo) e colar (texto).
const BACKUP_MODULES = {
    tarefas: {
        nome: 'Tarefas', arquivo: 'backup_tarefas.json',
        get: () => tasks, set: d => { tasks = d; }, salvar: () => saveAndRenderTasks()
    },
    anotacoes: {
        nome: 'Anotações', arquivo: 'backup_anotacoes.json',
        get: () => notes, set: d => { notes = d; }, salvar: () => saveAndRenderNotes()
    },
    financas: {
        nome: 'Finanças', arquivo: 'backup_financas.json',
        get: () => finances, set: d => { finances = d; }, salvar: () => saveAndRenderFinance()
    },
    aniversarios: {
        nome: 'Aniversários', arquivo: 'backup_aniversarios.json',
        get: () => birthdays, set: d => { birthdays = d; }, salvar: () => saveAndRenderBirthdays()
    },
    musicas: {
        nome: 'Músicas', arquivo: 'backup_musicas.json',
        get: () => songsForExport(), normalizar: normalizeSongs,
        set: d => { songs = d; }, salvar: () => saveAndRenderSongs()
    },
    senhas: {
        nome: 'Senhas', arquivo: 'backup_senhas.json',
        get: () => passwordsForExport(), normalizar: normalizePasswords,
        set: d => { passwords = d; }, salvar: () => saveAndRenderPasswords()
    }
};

// Baixa o arquivo JSON (no APK, que não baixa arquivos, copia o conteúdo)
function backupExport(key) {
    const m = BACKUP_MODULES[key];
    downloadJSON(m.get(), m.arquivo);
}

// Copia o JSON para a área de transferência
async function backupCopy(key) {
    const m = BACKUP_MODULES[key];
    const text = JSON.stringify(m.get(), null, 2);
    if (await copyToClipboard(text)) {
        alert(`Backup de ${m.nome} copiado!`);
    } else {
        showCopyFallback(text);
    }
}

// Valida, confirma e restaura a partir do texto do JSON
function backupImportText(key, text) {
    const m = BACKUP_MODULES[key];
    let data;
    try {
        data = JSON.parse(text);
    } catch (err) {
        alert('Erro ao ler o backup: o conteúdo não é um JSON válido.');
        return false;
    }

    if (!Array.isArray(data)) {
        alert(`Formato de ${m.nome.toLowerCase()} inválido.`);
        return false;
    }
    const novo = m.normalizar ? m.normalizar(data) : data;
    const itensValidos = novo.every(item => item && typeof item === 'object');
    if (!itensValidos || (data.length > 0 && novo.length === 0)) {
        alert(`Formato de ${m.nome.toLowerCase()} inválido.`);
        return false;
    }

    const atual = m.get().length;
    if (!confirm(`Isso vai SUBSTITUIR os ${atual} registros atuais de ${m.nome} pelos ${novo.length} do backup.\n\nContinuar?`)) {
        return false;
    }

    m.set(novo);
    m.salvar();
    alert(`Backup de ${m.nome} restaurado com sucesso!`);
    return true;
}

function backupImportFile(key, event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => backupImportText(key, e.target.result);
    reader.readAsText(file);
    event.target.value = '';
}

function backupPaste(key) {
    const m = BACKUP_MODULES[key];
    const old = document.getElementById('backupModal');
    if (old) old.remove();
    const wrap = document.createElement('div');
    wrap.id = 'backupModal';
    wrap.className = 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4';
    wrap.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg flex flex-col gap-3 p-5">
            <h3 class="text-sm font-bold">Importar ${escapeHtml(m.nome)} colando o conteúdo</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Cole abaixo o conteúdo completo do backup (o JSON inteiro). Os dados atuais deste módulo serão substituídos.</p>
            <textarea id="backupPasteText" spellcheck="false" class="w-full h-48 text-xs font-mono p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"></textarea>
            <div class="flex justify-end gap-2">
                <button type="button" onclick="document.getElementById('backupModal').remove()" class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-xs font-medium rounded-lg cursor-pointer">Cancelar</button>
                <button type="button" id="backupPasteRestore" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg cursor-pointer">Restaurar</button>
            </div>
        </div>`;
    document.body.appendChild(wrap);
    const ta = document.getElementById('backupPasteText');
    ta.focus();
    document.getElementById('backupPasteRestore').onclick = () => {
        const text = ta.value.trim();
        if (!text) {
            alert('Cole o conteúdo do backup antes de restaurar.');
            return;
        }
        if (backupImportText(key, text)) wrap.remove();
    };
}

// No APK não dá para baixar arquivo: esconde "Exportar" (o "Copiar" cobre esse caso)
document.addEventListener('DOMContentLoaded', () => {
    if (isMobileApp()) {
        document.querySelectorAll('[data-backup-file-export]').forEach(el => { el.style.display = 'none'; });
    }
});
