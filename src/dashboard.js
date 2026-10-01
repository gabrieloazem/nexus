// ================= DASHBOARD =================
function renderDashboard() {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'pendente').length;
    const doneTasks = tasks.filter(t => t.status === 'realizada').length;
    
    const totalNotes = notes.length;
    const uniqueCats = [...new Set(notes.map(n => n.categoria))].length;

    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthFinances = finances.filter(f => f.data && f.data.startsWith(currentYearMonth));
    
    const totalIncome = monthFinances.filter(f => f.tipo === 'entrada').reduce((acc, f) => acc + f.valor, 0);
    const totalExpense = monthFinances.filter(f => f.tipo === 'saida').reduce((acc, f) => acc + f.valor, 0);
    const balance = totalIncome - totalExpense;

    const totalBirthdays = birthdays.length;
    const currentMonth = now.getMonth() + 1;
    const birthdaysThisMonth = birthdays.filter(b => parseInt(b.mes) === currentMonth).length;

    document.getElementById('dashTotalTasks').innerText = totalTasks;
    document.getElementById('dashSubTasks').innerText = `${pendingTasks} pendentes, ${doneTasks} realizadas`;
    
    document.getElementById('dashTotalNotes').innerText = totalNotes;
    document.getElementById('dashSubNotes').innerText = `Em ${uniqueCats} categorias`;

    const balanceEl = document.getElementById('dashFinanceBalance');
    balanceEl.innerText = formatCurrency(balance);
    balanceEl.className = `text-2xl font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`;
    document.getElementById('dashSubFinance').innerText = `Entradas: ${formatCurrency(totalIncome)} | Saídas: ${formatCurrency(totalExpense)}`;

    document.getElementById('dashTotalBirthdays').innerText = birthdaysThisMonth;
    document.getElementById('dashSubBirthdays').innerText = `${totalBirthdays} cadastrados no total`;

    const favSongs = songs.filter(s => s.favoritas === 'Sim').length;
    const doneSongs = songs.filter(s => s.finalizada === 'Sim').length;
    document.getElementById('dashTotalSongs').innerText = songs.length;
    document.getElementById('dashSubSongs').innerText = `${doneSongs} finalizadas, ${favSongs} favoritas`;
    document.getElementById('dashTotalPasswords').innerText = passwords.length;
}
