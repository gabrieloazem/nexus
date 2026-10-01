let tasks = JSON.parse(localStorage.getItem('nexus_tasks')) || [];
let notes = JSON.parse(localStorage.getItem('nexus_notes')) || [];
let finances = JSON.parse(localStorage.getItem('nexus_finances')) || [];
let birthdays = JSON.parse(localStorage.getItem('nexus_birthdays')) || [];
let songs = JSON.parse(localStorage.getItem('nexus_songs')) || [];
let passwords = JSON.parse(localStorage.getItem('nexus_passwords')) || [];

let currentTaskTab = 'todas';
let currentMainModule = 'dashboard';

// ================= API FETCH CONFIG =================
const API_BASE_URL = 'https://backend-4lqm.onrender.com';

async function apiFetch(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }

    // O Render (plano grátis) "dorme" e a 1ª chamada pode demorar: timeout de 60s
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    options.signal = controller.signal;

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText} (${response.status})`);
        }
        // Se a resposta estiver vazia (ex: 204 No Content), retorna null
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error('Falha na requisição apiFetch:', error);
        throw error;
    } finally {
        clearTimeout(timer);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('nexus_theme') || 'light';
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(savedTheme);

    const todayObj = new Date();
    const todayStr = todayLocalStr();
    
    // Datas padrões
    document.getElementById('batchDate').value = todayStr;
    document.getElementById('taskDateFilter').value = todayStr;

    // Mês atual no filtro de finanças (YYYY-MM)
    const year = todayObj.getFullYear();
    const month = String(todayObj.getMonth() + 1).padStart(2, '0');
    document.getElementById('financeMonthFilter').value = `${year}-${month}`;

    // Mês atual no filtro de aniversários
    document.getElementById('birthdayMonthFilter').value = todayObj.getMonth() + 1;

    // migra músicas salvas no formato antigo (versão/momento) para o formato atual
    songs = normalizeSongs(songs);
    localStorage.setItem('nexus_songs', JSON.stringify(songs));

    updateCategoryFilterOptions();
    updateSongKeyFilter();
    renderDashboard();
    renderTasks();
    renderNotes();
    renderFinance();
    renderBirthdays();
    renderSongs();
    renderPasswords();

    // músicas: carrega do banco (via API); se falhar, mantém os dados locais
    loadSongsFromApi();
});

function toggleDarkMode() {
    const html = document.documentElement;
    let newTheme = 'light';
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        html.classList.add('light');
        newTheme = 'light';
    } else {
        html.classList.remove('light');
        html.classList.add('dark');
        newTheme = 'dark';
    }
    localStorage.setItem('nexus_theme', newTheme);
}

function switchMainModule(module) {
    currentMainModule = module;
    ['dashboard', 'tarefas', 'anotacoes', 'financas', 'aniversarios', 'musicas', 'senhas'].forEach(m => {
        const modEl = document.getElementById(`module-${m}`);
        const btnEl = document.getElementById(`main-tab-${m}`);
        if (m === module) {
            modEl.classList.remove('hidden');
            btnEl.className = "py-3 font-medium text-sm border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 flex items-center gap-2 cursor-pointer shrink-0";
        } else {
            modEl.classList.add('hidden');
            btnEl.className = "py-3 font-medium text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-2 cursor-pointer shrink-0";
        }
    });
    if (module === 'dashboard') renderDashboard();
}

// Utilitários
function newId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Data de hoje no fuso LOCAL (YYYY-MM-DD). toISOString() usa UTC e "vira o dia" 3h antes no Brasil.
function todayLocalStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function formatCurrency(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}