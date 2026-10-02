// ================= MÚSICAS (CIFRAS) =================
const SONG_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B', Fb: 'E', 'E#': 'F', 'B#': 'C' };

function keyIndex(key) {
    let k = String(key || '').trim().replace('♯', '#').replace('♭', 'b');
    if (!k) return -1;
    k = k[0].toUpperCase() + k.slice(1);
    if (FLAT_TO_SHARP[k]) k = FLAT_TO_SHARP[k];
    return SONG_KEYS.indexOf(k);
}

// Sobe/desce a tonalidade em semitons. Valores que não são uma das 12 notas ficam como estão.
function transposeKey(key, semitones) {
    const idx = keyIndex(key);
    if (idx < 0) return key;
    return SONG_KEYS[(((idx + semitones) % 12) + 12) % 12];
}

// Transpõe uma nota em letra (C, F#m, Bb, C/E...). Graus numéricos (1, 3B, +0m, -1B) não mudam,
// pois são relativos ao tom.
function transposeNote(nota, semitones) {
    if (!semitones || /^[+-]?\d/.test(nota)) return nota;
    return nota.replace(/(^|\/)([A-G])([#b♯♭]?)/g, (all, sep, letra, acc) => {
        const idx = keyIndex(letra + acc);
        return idx < 0 ? all : sep + transposeKey(letra + acc, semitones);
    });
}

function songKeyOptionsHtml(selected) {
    const opts = ['<option value="" class="dark:bg-gray-800">Sem tom</option>'];
    SONG_KEYS.forEach(k => opts.push(`<option value="${k}" class="dark:bg-gray-800">${k}</option>`));
    if (selected && !SONG_KEYS.includes(selected)) {
        opts.push(`<option value="${escapeHtml(selected)}" class="dark:bg-gray-800">${escapeHtml(selected)} (atual)</option>`);
    }
    return opts.join('');
}

function setSongKeySelect(selected) {
    const select = document.getElementById('modalSongKey');
    select.innerHTML = songKeyOptionsHtml(selected);
    select.value = selected || '';
}

// Momentos em que a música é usada. Para incluir um novo, basta acrescentar uma linha aqui:
// a chave (snake_case, sem acento) é o campo true/false no backup e na importação.
const MOMENTOS = [
    { key: 'manha', label: 'Manhã' },
    { key: 'noite', label: 'Noite' },
    { key: 'hinario', label: 'Hinário' },
    { key: 'santa_ceia', label: 'Santa Ceia' },
    { key: 'adoracao', label: 'Adoração' },
    { key: 'comunhao', label: 'Comunhão' },
    { key: 'ofertorio', label: 'Ofertório' },
    { key: 'celebracao', label: 'Celebração' },
    { key: 'gratidao', label: 'Gratidão' },
    { key: 'missoes', label: 'Missões' },
    { key: 'pecado', label: 'Pecado' },
    { key: 'secular', label: 'Secular' },
    { key: 'dificuldade', label: 'Dificuldade' },
    { key: 'animada', label: 'Animada' }
];

function toBool(v) {
    return v === true || v === 'true' || v === 1;
}

// Arquivos antigos tinham um texto livre ("Manhã Santa Ceia Finalizada"): converte para os campos true/false.
function legacyMoments(text) {
    const t = ' ' + String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() + ' ';
    const found = {};
    MOMENTOS.forEach(mo => {
        const alvo = mo.label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        found[mo.key] = new RegExp(`[^a-z]${alvo}[^a-z]`).test(t);
    });
    return found;
}

// Formato de cada item:
// { id, nome, tonalidade, favoritas: 'Sim'|'Não', finalizada: 'Sim'|'Não', manha, noite, hinario, santa_ceia, ..., conteudo }
// Os campos antigos "versao" e "momento" são descartados.
function normalizeSongs(list) {
    const seen = new Set();
    return list
        .filter(s => s && typeof s === 'object' && typeof s.nome === 'string')
        .map(s => {
            let id = String(s.id === undefined || s.id === null ? '' : s.id);
            if (!id || seen.has(id)) id = newId();
            seen.add(id);

            const temCampos = MOMENTOS.some(mo => mo.key in s);
            const legado = !temCampos && typeof s.momento === 'string' ? legacyMoments(s.momento) : {};
            const momentos = {};
            MOMENTOS.forEach(mo => { momentos[mo.key] = temCampos ? toBool(s[mo.key]) : !!legado[mo.key]; });

            return {
                id,
                nome: s.nome,
                tonalidade: String(s.tonalidade || ''),
                favoritas: s.favoritas === 'Sim' ? 'Sim' : 'Não',
                finalizada: s.finalizada === 'Sim' ? 'Sim' : 'Não',
                ...momentos,
                // arquivos antigos guardam a quebra de linha como texto "\n"
                conteudo: String(s.conteudo || '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n')
            };
        });
}

function songsForExport() {
    return normalizeSongs(songs);
}

function songMomentLabels(s) {
    return MOMENTOS.filter(mo => s[mo.key]).map(mo => mo.label);
}

// ---------- Carregar da API ----------
async function loadSongsFromApi() {
    const count = document.getElementById('songCount');
    const list = document.getElementById('songList');
    if (count) count.innerText = 'Carregando músicas...';

    try {
        const data = await apiFetch('/musicas', 'GET');
        console.log('GET /musicas →', data);
        const lista = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        songs = normalizeSongs(lista);
        if (lista.length > 0 && songs.length === 0) {
            console.warn('A API devolveu itens, mas nenhum passou no normalizeSongs. Primeiro item:', lista[0]);
        }
    } catch (e) {
        console.error('Erro ao carregar músicas da API.', e);
        songs = [];
        if (count) count.innerText = 'Erro ao carregar';
        list.innerHTML = `
            <div class="text-center py-8 text-sm text-red-500">
                Não foi possível carregar as músicas do servidor.
                <button onclick="loadSongsFromApi()" class="block mx-auto mt-2 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg cursor-pointer">Tentar novamente</button>
            </div>`;
        updateSongKeyFilter();
        renderDashboard();
        return;
    }

    updateSongKeyFilter();
    renderSongs();
    refreshSongView();
    renderDashboard();
}

// ---------- Modal (abas Dados / Momentos) ----------
function switchSongTab(tab) {
    const dados = tab === 'dados';
    document.getElementById('songTabDados').classList.toggle('hidden', !dados);
    document.getElementById('songTabMomentos').classList.toggle('hidden', dados);
    const on = 'px-4 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 cursor-pointer';
    const off = 'px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer';
    document.getElementById('songTabBtnDados').className = dados ? on : off;
    document.getElementById('songTabBtnMomentos').className = dados ? off : on;
}

function renderSongMomentCheckboxes(song) {
    document.getElementById('songMomentsBox').innerHTML = MOMENTOS.map(mo => `
        <label class="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm cursor-pointer select-none">
            <input type="checkbox" data-momento="${mo.key}" ${song && song[mo.key] ? 'checked' : ''} class="w-4 h-4 accent-indigo-600">
            ${escapeHtml(mo.label)}
        </label>`).join('');
}

function openSongModal(id = null) {
    document.getElementById('modalSongId').value = '';
    document.getElementById('modalSongName').value = '';
    setSongKeySelect('');
    document.getElementById('modalSongFavorite').value = 'Não';
    document.getElementById('modalSongDone').value = 'Não';
    document.getElementById('modalSongContent').value = '';
    document.getElementById('songModalTitle').innerText = 'Nova Música';
    document.getElementById('btnDeleteSong').classList.add('hidden');
    renderSongMomentCheckboxes(null);
    switchSongTab('dados');

    if (id) {
        const s = songs.find(item => item.id === id);
        if (s) {
            renderSongMomentCheckboxes(s);
            document.getElementById('modalSongId').value = s.id;
            document.getElementById('modalSongName').value = s.nome;
            setSongKeySelect(s.tonalidade);
            document.getElementById('modalSongFavorite').value = s.favoritas;
            document.getElementById('modalSongDone').value = s.finalizada;
            document.getElementById('modalSongContent').value = s.conteudo;
            document.getElementById('songModalTitle').innerText = 'Editar Música';
            document.getElementById('btnDeleteSong').classList.remove('hidden');
        }
    }

    document.getElementById('songModal').classList.remove('hidden');
    document.getElementById('songModal').classList.add('flex');
}

function closeSongModal() {
    document.getElementById('songModal').classList.remove('flex');
    document.getElementById('songModal').classList.add('hidden');
}

let savingSong = false;

async function handleSaveSongModal(event) {
    event.preventDefault();
    const id = document.getElementById('modalSongId').value;
    const nome = document.getElementById('modalSongName').value.trim();
    if (!nome) {
        switchSongTab('dados');
        document.getElementById('modalSongName').focus();
        return;
    }
    const dados = {
        nome,
        tonalidade: document.getElementById('modalSongKey').value,
        favoritas: document.getElementById('modalSongFavorite').value,
        finalizada: document.getElementById('modalSongDone').value,
        conteudo: document.getElementById('modalSongContent').value
    };
    document.querySelectorAll('#songMomentsBox input[data-momento]').forEach(cb => {
        dados[cb.dataset.momento] = cb.checked;
    });

    if (savingSong) return;
    savingSong = true;
    const btn = document.querySelector('#songModal button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
        if (id) {
            const salva = await apiFetch(`/musicas/${id}`, 'PUT', dados);
            const atualizada = normalizeSongs([salva])[0];
            const idx = songs.findIndex(item => item.id === id);
            if (idx >= 0) songs[idx] = atualizada; else songs.push(atualizada);
        } else {
            const nova = await apiFetch('/musicas', 'POST', dados);
            if (!nova || !nova.id) throw new Error('A API não retornou a música criada.');
            songs.push(normalizeSongs([nova])[0]);
        }

        closeSongModal();
        saveAndRenderSongs();
    } catch (error) {
        alert('Erro ao salvar a música na API:\n' + error.message);
    } finally {
        savingSong = false;
        if (btn) btn.disabled = false;
    }
}

async function deleteSong(id) {
    if (!confirm('Deseja realmente excluir esta música?')) return false;
    try {
        await apiFetch(`/musicas/${id}`, 'DELETE');
        songs = songs.filter(s => s.id !== id);
        saveAndRenderSongs();
        return true;
    } catch (error) {
        alert('Erro ao excluir a música na API:\n' + error.message);
        return false;
    }
}

function deleteSongFromModal() {
    const id = document.getElementById('modalSongId').value;
    if (!id) return;
    deleteSong(id).then(success => {
        if (success) closeSongModal();
    });
}

function updateSongKeyFilter() {
    const select = document.getElementById('songKeyFilter');
    const current = select.value || 'todas';
    const rank = k => (SONG_KEYS.includes(k) ? SONG_KEYS.indexOf(k) : 99);
    const keys = [...new Set(songs.map(s => s.tonalidade).filter(Boolean))]
        .sort((a, b) => (rank(a) - rank(b)) || a.localeCompare(b, 'pt-BR'));
    select.innerHTML = '<option value="todas">Todas as tonalidades</option>' +
        keys.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join('');
    select.value = keys.includes(current) ? current : 'todas';
}

async function toggleSongFavorite(id) {
    const s = songs.find(item => item.id === id);
    if (!s) return;
    const novaFavorita = s.favoritas === 'Sim' ? 'Não' : 'Sim';

    try {
        // atualização parcial: só o campo "favoritas"
        await apiFetch(`/musicas/${id}`, 'PATCH', { favoritas: novaFavorita });
        s.favoritas = novaFavorita;
        saveAndRenderSongs();
    } catch (e) {
        alert('Erro ao atualizar favorito na API.');
    }
}

function favoriteButtonHtml(fav) {
    return fav ? '♥' : '♡';
}

function favoriteButtonClass(fav) {
    return `p-1.5 rounded-md text-lg leading-none transition cursor-pointer ${fav ? 'text-red-500' : 'text-gray-300 dark:text-gray-500 hover:text-red-400'}`;
}

function renderSongs() {
    const list = document.getElementById('songList');
    const term = document.getElementById('songSearch').value.trim().toLowerCase();
    const status = document.getElementById('songStatusFilter').value;
    const key = document.getElementById('songKeyFilter').value;
    list.innerHTML = '';

    const filtered = songs.filter(s => {
        if (term && !s.nome.toLowerCase().includes(term)) return false;
        if (status === 'favoritas' && s.favoritas !== 'Sim') return false;
        if (status === 'finalizadas' && s.finalizada !== 'Sim') return false;
        if (status === 'andamento' && s.finalizada === 'Sim') return false;
        if (key !== 'todas' && s.tonalidade !== key) return false;
        return true;
    });

    filtered.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
    document.getElementById('songCount').innerText = `${filtered.length} de ${songs.length} músicas`;

    if (filtered.length === 0) {
        list.innerHTML = `<div class="text-center py-8 text-gray-400 text-sm">Nenhuma música encontrada.</div>`;
        return;
    }

    filtered.forEach(s => {
        const done = s.finalizada === 'Sim';
        const fav = s.favoritas === 'Sim';
        const info = songMomentLabels(s).join(' • ');
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 transition";
        card.innerHTML = `
            <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                    ${escapeHtml(s.tonalidade) || '<i class="ph ph-music-notes"></i>'}
                </div>
                <div class="flex flex-col overflow-hidden">
                    <span class="text-sm font-bold truncate">${escapeHtml(s.nome)}</span>
                    <span class="text-xs truncate">
                        <span class="${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'} font-medium">${done ? 'Finalizada' : 'Em andamento'}</span>
                        <span class="text-gray-400">${info ? ' • ' + escapeHtml(info) : ''}</span>
                    </span>
                </div>
            </div>
            <div class="flex items-center gap-0.5 shrink-0">
                <button data-act="fav" class="${favoriteButtonClass(fav)}" title="${fav ? 'Remover dos favoritos' : 'Favoritar'}">${favoriteButtonHtml(fav)}</button>
                <button data-act="edit" class="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md transition cursor-pointer" title="Editar"><i class="ph ph-pencil-simple text-base"></i></button>
                <button data-act="view" class="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md transition cursor-pointer" title="Visualizar"><i class="ph ph-eye text-base"></i></button>
            </div>
        `;
        card.querySelector('[data-act="fav"]').onclick = () => toggleSongFavorite(s.id);
        card.querySelector('[data-act="edit"]').onclick = () => openSongModal(s.id);
        card.querySelector('[data-act="view"]').onclick = () => openSongView(s.id);
        list.appendChild(card);
    });
}

// ---------- Formatação da cifra ----------
function formatSongLine(line, semitones = 0) {
    // Se não houver transposição, retorna o texto escapado mantendo espaçamento
    if (!semitones) {
        return escapeHtml(line);
    }

    // Divide mantendo os espaços para não desalinhar a cifra
    return line.split(/(\s+)/).map(part => {
        // Ignora espaços em branco
        if (!part.trim()) return escapeHtml(part);

        // Tenta identificar se o bloco é um acorde (ex: C, Am, F#7, Bbm/Db, etc.)
        // Expressão que valida se começa com uma nota de A a G seguida opcionalmente de #/b e extensões
        const chordRegex = /^([A-G][#b♯♭]?[a-zA-Z0-9]*(\/[A-G][#b♯♭]?)?)(.*)$/;
        const m = part.match(chordRegex);

        if (m) {
            const notaTransposta = transposeNote(m[1], semitones);
            const resto = m[3] || '';
            return `<span class="font-mono font-bold text-black dark:text-white">${escapeHtml(notaTransposta + resto)}</span>`;
        }

        return escapeHtml(part);
    }).join('');
}

function renderSongContent(text, semitones = 0) {
    const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    return lines.map(raw => {
        const t = raw.trim();
        if (!t) return '<div class="h-3"></div>';

        if (t.startsWith('*')) {
            const titulo = t.replace(/^\*+\s*/, '');
            if (!titulo) return '<div class="h-3"></div>';
            return `<div class="mt-3 mb-1 pl-2 border-l-4 border-indigo-400 font-sans font-bold text-base text-indigo-600 dark:text-indigo-400">${escapeHtml(titulo)}</div>`;
        }

        if (/^Solo:(\s|$)/.test(t)) {
            const conteudo = t.replace(/^Solo:\s*/, '');
            if (!conteudo) return '<div class="h-3"></div>';
            return `<div class="font-serif italic text-amber-600 dark:text-amber-400 whitespace-pre-wrap break-words">${formatSongLine(conteudo, semitones)}</div>`;
        }

        return `<div class="font-mono text-black dark:text-white whitespace-pre-wrap break-words">${formatSongLine(t, semitones)}</div>`;
    }).join('');
}

// ---------- Página de visualização ----------
let currentSongViewId = null;
let songViewSemitones = 0;

function refreshSongView() {
    if (!currentSongViewId) return;
    const s = songs.find(item => item.id === currentSongViewId);
    if (!s) {
        closeSongView();
        return;
    }
    const done = s.finalizada === 'Sim';
    const fav = s.favoritas === 'Sim';
    document.getElementById('songReaderTitle').innerText = s.nome;

    const chips = [];
    songMomentLabels(s).forEach(l => chips.push(`<span class="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700">${escapeHtml(l)}</span>`));
    chips.push(`<span class="${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'} font-medium">${done ? 'Finalizada' : 'Em andamento'}</span>`);
    document.getElementById('songReaderMeta').innerHTML = chips.join('');

    const favBtn = document.getElementById('songReaderFav');
    favBtn.innerText = favoriteButtonHtml(fav);
    favBtn.className = favoriteButtonClass(fav);

    const semi = songViewSemitones;
    document.getElementById('songReaderKey').innerText = s.tonalidade ? transposeKey(s.tonalidade, semi) : '—';
    document.getElementById('songReaderKeyInfo').innerText = semi
        ? `original ${s.tonalidade || '—'} • ${semi > 0 ? '+' : ''}${semi} semitom${Math.abs(semi) > 1 ? 's' : ''}`
        : (s.tonalidade ? 'tom original' : 'sem tom definido');
    const resetBtn = document.getElementById('songReaderKeyReset');
    if (semi) resetBtn.classList.remove('hidden'); else resetBtn.classList.add('hidden');

    document.getElementById('songReaderContent').innerHTML = s.conteudo.trim()
        ? renderSongContent(s.conteudo, semi)
        : '<div class="text-gray-400 text-sm">Esta música ainda não tem cifra. Use o botão de editar para adicionar.</div>';
}

function openSongView(id) {
    currentSongViewId = id;
    songViewSemitones = 0;
    document.getElementById('songListView').classList.add('hidden');
    document.getElementById('songReaderView').classList.remove('hidden');
    refreshSongView();
    window.scrollTo(0, 0);
    history.pushState({ nexusSongView: true }, '');
}

function closeSongView(fromPopState = false) {
    if (!currentSongViewId) return;
    currentSongViewId = null;
    document.getElementById('songReaderView').classList.add('hidden');
    document.getElementById('songListView').classList.remove('hidden');
    if (!fromPopState && history.state && history.state.nexusSongView) history.back();
}

function transposeSongView(delta) {
    if (delta === 0) {
        songViewSemitones = 0;
    } else {
        // Normaliza para ficar sempre entre 0 e 11 (ou negativo tratado corretamente)
        songViewSemitones = (((songViewSemitones + delta) % 12) + 12) % 12;
    }
    refreshSongView();
}

function toggleSongFavoriteFromView() {
    if (currentSongViewId) toggleSongFavorite(currentSongViewId);
}

function editSongFromView() {
    if (currentSongViewId) openSongModal(currentSongViewId);
}

window.addEventListener('popstate', () => {
    if (currentSongViewId) closeSongView(true);
});

function saveAndRenderSongs() {
    updateSongKeyFilter();
    renderSongs();
    refreshSongView();
    renderDashboard();
}

// Importação de backup: substitui TODAS as músicas do banco pelas do arquivo
async function importSongsToApi(lista) {
    const salvas = await apiFetch('/musicas/importar', 'POST', lista);
    songs = normalizeSongs(Array.isArray(salvas) ? salvas : lista);
    saveAndRenderSongs();
}

function markAllSongsInProgress() {
    if (songs.length === 0) return;
    if (!confirm(`Isso vai marcar TODAS as ${songs.length} músicas como "Em andamento". Continuar?`)) return;
    songs.forEach(s => { s.finalizada = 'Não'; });
    saveAndRenderSongs();
}