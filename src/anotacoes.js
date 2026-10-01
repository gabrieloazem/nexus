// ================= ANOTAÇÕES =================
function updateCategoryDatalist() {
    const datalist = document.getElementById('categoriesList');
    const categories = [...new Set(notes.map(n => n.categoria))].filter(Boolean);
    datalist.innerHTML = '';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        datalist.appendChild(opt);
    });
}

function openNoteModal(id = null) {
    updateCategoryDatalist();
    document.getElementById('modalNoteId').value = '';
    document.getElementById('modalNoteCategory').value = '';
    document.getElementById('modalNoteTitle').value = '';
    document.getElementById('modalNoteContent').value = '';
    document.getElementById('noteModalTitle').innerText = 'Nova Anotação';

    if (id) {
        const note = notes.find(n => n.id === id);
        if (note) {
            document.getElementById('modalNoteId').value = note.id;
            document.getElementById('modalNoteCategory').value = note.categoria;
            document.getElementById('modalNoteTitle').value = note.titulo;
            document.getElementById('modalNoteContent').value = note.conteudo;
            document.getElementById('noteModalTitle').innerText = 'Editar Anotação';
        }
    }

    document.getElementById('noteModal').classList.remove('hidden');
    document.getElementById('noteModal').classList.add('flex');
}

function closeNoteModal() {
    document.getElementById('noteModal').classList.remove('flex');
    document.getElementById('noteModal').classList.add('hidden');
}

function handleSaveNoteModal(event) {
    event.preventDefault();
    const id = document.getElementById('modalNoteId').value;
    const categoria = document.getElementById('modalNoteCategory').value.trim();
    const titulo = document.getElementById('modalNoteTitle').value.trim();
    const conteudo = document.getElementById('modalNoteContent').value.trim();

    if (id) {
        const note = notes.find(n => n.id === id);
        if (note) {
            note.categoria = categoria;
            note.titulo = titulo;
            note.conteudo = conteudo;
        }
    } else {
        notes.push({
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            categoria,
            titulo,
            conteudo
        });
    }

    closeNoteModal();
    saveAndRenderNotes();
    document.getElementById('categoryFilter').value = categoria;
    renderNotes();
}

function deleteNote(id) {
    if (!confirm('Deseja realmente excluir esta anotação?')) return;
    notes = notes.filter(n => n.id !== id);
    saveAndRenderNotes();
}

function updateCategoryFilterOptions() {
    const select = document.getElementById('categoryFilter');
    const currentVal = select.value;
    const categories = [...new Set(notes.map(n => n.categoria))].filter(Boolean);

    select.innerHTML = '';
    
    if (categories.length === 0) {
        select.innerHTML = `<option value="">Nenhuma categoria</option>`;
        return;
    }

    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.innerText = cat;
        select.appendChild(opt);
    });

    if (categories.includes(currentVal)) {
        select.value = currentVal;
    } else {
        select.value = categories[0];
    }
}

function renderNotes() {
    const select = document.getElementById('categoryFilter');
    const filterCat = select.value;
    const grid = document.getElementById('notesGrid');
    grid.innerHTML = '';

    const filtered = notes.filter(n => {
        if (!filterCat) return false;
        return n.categoria === filterCat;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-8 text-gray-400 text-sm">Nenhuma anotação encontrada para esta categoria.</div>`;
        return;
    }

    filtered.forEach(note => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between gap-3 transition";
        card.innerHTML = `
            <div class="flex flex-col gap-1.5 overflow-hidden">
                <div class="flex justify-between items-start gap-2">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 truncate">${escapeHtml(note.categoria)}</span>
                    <div class="flex items-center gap-1 shrink-0">
                        <button onclick="openNoteModal('${note.id}')" class="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md transition cursor-pointer" title="Editar"><i class="ph ph-pencil-simple text-base"></i></button>
                        <button onclick="deleteNote('${note.id}')" class="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition cursor-pointer" title="Excluir"><i class="ph ph-trash text-base"></i></button>
                    </div>
                </div>
                <h4 class="text-sm font-bold truncate">${escapeHtml(note.titulo)}</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap line-clamp-3">${escapeHtml(note.conteudo)}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

function saveAndRenderNotes() {
    localStorage.setItem('nexus_notes', JSON.stringify(notes));
    updateCategoryFilterOptions();
    renderNotes();
    renderDashboard();
}