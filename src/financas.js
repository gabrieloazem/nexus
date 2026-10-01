// ================= FINANÇAS =================
function openFinanceModal(id = null) {
    document.getElementById('modalFinanceId').value = '';
    document.getElementById('modalFinanceType').value = 'entrada';
    document.getElementById('modalFinanceTitle').value = '';
    document.getElementById('modalFinanceAmount').value = '';
    document.getElementById('modalFinanceDate').value = todayLocalStr();
    document.getElementById('modalFinanceStatus').value = 'pendente';
    document.getElementById('financeModalTitle').innerText = 'Nova Transação';
    document.getElementById('btnDeleteFinance').classList.add('hidden');

    if (id) {
        const item = finances.find(f => f.id === id);
        if (item) {
            document.getElementById('modalFinanceId').value = item.id;
            document.getElementById('modalFinanceType').value = item.tipo;
            document.getElementById('modalFinanceTitle').value = item.titulo;
            document.getElementById('modalFinanceAmount').value = item.valor;
            document.getElementById('modalFinanceDate').value = item.data;
            document.getElementById('modalFinanceStatus').value = item.status;
            document.getElementById('financeModalTitle').innerText = 'Editar Transação';
            document.getElementById('btnDeleteFinance').classList.remove('hidden');
        }
    }

    document.getElementById('financeModal').classList.remove('hidden');
    document.getElementById('financeModal').classList.add('flex');
}

function closeFinanceModal() {
    document.getElementById('financeModal').classList.remove('flex');
    document.getElementById('financeModal').classList.add('hidden');
}

function handleSaveFinanceModal(event) {
    event.preventDefault();
    const id = document.getElementById('modalFinanceId').value;
    const tipo = document.getElementById('modalFinanceType').value;
    const titulo = document.getElementById('modalFinanceTitle').value.trim();
    const valor = parseFloat(document.getElementById('modalFinanceAmount').value);
    const data = document.getElementById('modalFinanceDate').value;
    const status = document.getElementById('modalFinanceStatus').value;

    if (id) {
        const item = finances.find(f => f.id === id);
        if (item) {
            item.tipo = tipo;
            item.titulo = titulo;
            item.valor = isNaN(valor) ? 0 : valor;
            item.data = data;
            item.status = status;
        }
    } else {
        finances.push({
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            tipo,
            titulo,
            valor: isNaN(valor) ? 0 : valor,
            data,
            status
        });
    }

    closeFinanceModal();
    saveAndRenderFinance();
}

function deleteFinance(id) {
    if (!confirm('Deseja realmente excluir esta transação?')) return false;
    finances = finances.filter(f => f.id !== id);
    saveAndRenderFinance();
    return true;
}

function deleteFinanceFromModal() {
    const id = document.getElementById('modalFinanceId').value;
    if (!id) return;
    if (deleteFinance(id)) closeFinanceModal();
}

// ---------- Navegação por mês ----------
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function changeFinanceMonth(delta) {
    const input = document.getElementById('financeMonthFilter');
    let [y, m] = (input.value || todayLocalStr().slice(0, 7)).split('-').map(Number);
    m += delta;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    input.value = `${y}-${String(m).padStart(2, '0')}`;
    renderFinance();
}

function updateFinanceMonthLabel() {
    const val = document.getElementById('financeMonthFilter').value;
    const label = document.getElementById('financeMonthLabel');
    if (!label || !val) return;
    const [y, m] = val.split('-').map(Number);
    label.innerText = `${MONTH_NAMES[m - 1]} ${y}`;
}

function renderFinance() {
    updateFinanceMonthLabel();
    const monthFilterVal = document.getElementById('financeMonthFilter').value; // YYYY-MM
    const container = document.getElementById('financeList');
    container.innerHTML = '';

    const filtered = finances.filter(f => {
        if (!monthFilterVal) return true;
        return f.data && f.data.startsWith(monthFilterVal);
    });

    filtered.sort((a, b) => new Date(b.data) - new Date(a.data));

    let totalIncome = 0;
    let totalExpense = 0;

    filtered.forEach(item => {
        if (item.tipo === 'entrada') totalIncome += item.valor;
        else totalExpense += item.valor;
    });

    const balance = totalIncome - totalExpense;

    document.getElementById('finTotalIncome').innerText = formatCurrency(totalIncome);
    document.getElementById('finTotalExpense').innerText = formatCurrency(totalExpense);
    
    const balanceEl = document.getElementById('finTotalBalance');
    balanceEl.innerText = formatCurrency(balance);
    balanceEl.className = `text-xl font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`;

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-gray-400 text-sm">Nenhuma transação financeira encontrada para este mês.</div>`;
        return;
    }

    filtered.forEach(item => {
        const isConcluded = item.status === 'concluido';
        const isIncome = item.tipo === 'entrada';

        const card = document.createElement('div');
        card.className = "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 flex items-center justify-between gap-4 transition cursor-pointer";
        card.onclick = () => openFinanceModal(item.id);
        card.innerHTML = `
            <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-10 h-10 rounded-lg ${isIncome ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400'} flex items-center justify-center font-bold text-lg shrink-0">
                    <i class="ph ${isIncome ? 'ph-arrow-down-left' : 'ph-arrow-up-right'}"></i>
                </div>
                <div class="flex flex-col overflow-hidden">
                    <span class="text-sm font-bold truncate">${escapeHtml(item.titulo)}</span>
                    <div class="flex items-center gap-2 text-xs text-gray-400">
                        <span><i class="ph ph-calendar"></i> ${formatDate(item.data)}</span>
                        <span>•</span>
                        <span class="${isConcluded ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-500 font-medium'}">${isConcluded ? 'Concluído' : 'Pendente'}</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
                <span class="text-sm font-bold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}">
                    ${isIncome ? '+' : '-'} ${formatCurrency(item.valor)}
                </span>
            </div>
        `;
        container.appendChild(card);
    });
}

function saveAndRenderFinance() {
    localStorage.setItem('nexus_finances', JSON.stringify(finances));
    renderFinance();
    renderDashboard();
}