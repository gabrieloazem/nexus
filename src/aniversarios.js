// ================= ANIVERSÁRIOS =================
function openBirthdayModal(id = null) {
    document.getElementById('modalBirthdayId').value = '';
    document.getElementById('modalBirthdayName').value = '';
    document.getElementById('modalBirthdayDay').value = '';
    document.getElementById('modalBirthdayMonth').value = new Date().getMonth() + 1;
    document.getElementById('birthdayModalTitle').innerText = 'Novo Aniversariante';

    if (id) {
        const b = birthdays.find(item => item.id === id);
        if (b) {
            document.getElementById('modalBirthdayId').value = b.id;
            document.getElementById('modalBirthdayName').value = b.nome;
            document.getElementById('modalBirthdayDay').value = b.dia;
            document.getElementById('modalBirthdayMonth').value = b.mes;
            document.getElementById('birthdayModalTitle').innerText = 'Editar Aniversariante';
        }
    }

    document.getElementById('birthdayModal').classList.remove('hidden');
    document.getElementById('birthdayModal').classList.add('flex');
}

function closeBirthdayModal() {
    document.getElementById('birthdayModal').classList.remove('flex');
    document.getElementById('birthdayModal').classList.add('hidden');
}

function handleSaveBirthdayModal(event) {
    event.preventDefault();
    const id = document.getElementById('modalBirthdayId').value;
    const nome = document.getElementById('modalBirthdayName').value.trim();
    const dia = parseInt(document.getElementById('modalBirthdayDay').value);
    const mes = parseInt(document.getElementById('modalBirthdayMonth').value);

    if (id) {
        const b = birthdays.find(item => item.id === id);
        if (b) {
            b.nome = nome;
            b.dia = dia;
            b.mes = mes;
        }
    } else {
        birthdays.push({
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            nome,
            dia,
            mes
        });
    }

    closeBirthdayModal();
    saveAndRenderBirthdays();
}

function deleteBirthday(id) {
    if (!confirm('Deseja realmente excluir este aniversariante?')) return;
    birthdays = birthdays.filter(b => b.id !== id);
    saveAndRenderBirthdays();
}

function renderBirthdays() {
    const grid = document.getElementById('birthdaysGrid');
    const filterMonth = document.getElementById('birthdayMonthFilter').value;
    grid.innerHTML = '';

    const filtered = birthdays.filter(b => {
        if (filterMonth !== 'todos' && parseInt(b.mes) !== parseInt(filterMonth)) return false;
        return true;
    });

    filtered.sort((a, b) => (parseInt(a.mes) - parseInt(b.mes)) || (parseInt(a.dia) - parseInt(b.dia)));

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-8 text-gray-400 text-sm">Nenhum aniversariante encontrado.</div>`;
        return;
    }

    const monthNames = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    filtered.forEach(b => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4 transition";
        card.innerHTML = `
            <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                    ${b.dia}
                </div>
                <div class="flex flex-col overflow-hidden">
                    <span class="text-sm font-bold truncate">${escapeHtml(b.nome)}</span>
                    <span class="text-xs text-gray-400">${monthNames[b.mes]}</span>
                </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
                <button onclick="openBirthdayModal('${b.id}')" class="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md transition cursor-pointer" title="Editar"><i class="ph ph-pencil-simple text-base"></i></button>
                <button onclick="deleteBirthday('${b.id}')" class="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition cursor-pointer" title="Excluir"><i class="ph ph-trash text-base"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function saveAndRenderBirthdays() {
    localStorage.setItem('nexus_birthdays', JSON.stringify(birthdays));
    renderBirthdays();
    renderDashboard();
}