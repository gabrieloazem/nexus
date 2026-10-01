// ================= SENHAS =================
// Formato de exportação: [{ "system": "...", "username": "...", "password": "..." }]
// Internamente cada item também tem um "id" (não vai para o arquivo exportado).
function normalizePasswords(list) {
    return list
        .filter(p => p && typeof p === 'object' && typeof p.system === 'string')
        .map(p => ({
            id: newId(),
            system: p.system,
            username: String(p.username || ''),
            password: String(p.password || '')
        }));
}

function passwordsForExport() {
    return passwords.map(p => ({ system: p.system, username: p.username, password: p.password }));
}

function setPasswordVisible(visible) {
    document.getElementById('modalPasswordPass').type = visible ? 'text' : 'password';
    document.getElementById('iconTogglePassword').className = `ph ${visible ? 'ph-eye-slash' : 'ph-eye'} text-base`;
}

function togglePasswordVisibility() {
    setPasswordVisible(document.getElementById('modalPasswordPass').type === 'password');
}

async function copyFieldValue(inputId, btn) {
    const ok = await copyToClipboard(document.getElementById(inputId).value);
    const icon = btn.querySelector('i');
    icon.className = `ph ${ok ? 'ph-check text-emerald-600' : 'ph-x text-red-600'} text-base`;
    setTimeout(() => { icon.className = 'ph ph-copy text-base'; }, 1200);
}

function openPasswordModal(id = null) {
    document.getElementById('modalPasswordId').value = '';
    document.getElementById('modalPasswordSystem').value = '';
    document.getElementById('modalPasswordUser').value = '';
    document.getElementById('modalPasswordPass').value = '';
    document.getElementById('passwordModalTitle').innerText = 'Nova Senha';
    document.getElementById('btnDeletePassword').classList.add('hidden');
    setPasswordVisible(false);

    if (id) {
        const p = passwords.find(item => item.id === id);
        if (p) {
            document.getElementById('modalPasswordId').value = p.id;
            document.getElementById('modalPasswordSystem').value = p.system;
            document.getElementById('modalPasswordUser').value = p.username;
            document.getElementById('modalPasswordPass').value = p.password;
            document.getElementById('passwordModalTitle').innerText = 'Editar Senha';
            document.getElementById('btnDeletePassword').classList.remove('hidden');
        }
    }

    document.getElementById('passwordModal').classList.remove('hidden');
    document.getElementById('passwordModal').classList.add('flex');
}

function closePasswordModal() {
    setPasswordVisible(false);
    document.getElementById('modalPasswordPass').value = '';
    document.getElementById('passwordModal').classList.remove('flex');
    document.getElementById('passwordModal').classList.add('hidden');
}

function handleSavePasswordModal(event) {
    event.preventDefault();
    const id = document.getElementById('modalPasswordId').value;
    const dados = {
        system: document.getElementById('modalPasswordSystem').value.trim(),
        username: document.getElementById('modalPasswordUser').value.trim(),
        password: document.getElementById('modalPasswordPass').value
    };

    if (id) {
        const p = passwords.find(item => item.id === id);
        if (p) Object.assign(p, dados);
    } else {
        passwords.push({ id: newId(), ...dados });
    }

    closePasswordModal();
    saveAndRenderPasswords();
}

function deletePassword(id) {
    if (!confirm('Deseja realmente excluir esta senha?')) return false;
    passwords = passwords.filter(p => p.id !== id);
    saveAndRenderPasswords();
    return true;
}

function deletePasswordFromModal() {
    const id = document.getElementById('modalPasswordId').value;
    if (!id) return;
    if (deletePassword(id)) closePasswordModal();
}

function renderPasswords() {
    const list = document.getElementById('passwordList');
    const term = document.getElementById('passwordSearch').value.trim().toLowerCase();
    list.innerHTML = '';

    const filtered = passwords.filter(p =>
        !term || `${p.system} ${p.username}`.toLowerCase().includes(term));
    filtered.sort((a, b) => a.system.localeCompare(b.system, 'pt-BR', { sensitivity: 'base' }));

    if (filtered.length === 0) {
        list.innerHTML = `<div class="text-center py-8 text-gray-400 text-sm">Nenhuma senha encontrada.</div>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 flex items-center gap-3 transition cursor-pointer";
        card.onclick = () => openPasswordModal(p.id);
        card.innerHTML = `
            <div class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <i class="ph ph-lock-key text-lg"></i>
            </div>
            <div class="flex flex-col overflow-hidden">
                <span class="text-sm font-bold truncate">${escapeHtml(p.system)}</span>
                <span class="text-xs text-gray-400 truncate">${escapeHtml(p.username) || '&nbsp;'}</span>
            </div>
        `;
        list.appendChild(card);
    });
}

function saveAndRenderPasswords() {
    localStorage.setItem('nexus_passwords', JSON.stringify(passwords));
    renderPasswords();
    renderDashboard();
}
