// ================= TAREFAS =================
function handleBatchAdd(event) {
    event.preventDefault();
    const textarea = document.getElementById('batchInput');
    const dateInput = document.getElementById('batchDate');
    
    const lines = textarea.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    lines.forEach(title => {
        tasks.push({
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            titulo: title,
            data: dateInput.value || todayLocalStr(),
            status: 'pendente'
        });
    });

    textarea.value = '';
    saveAndRenderTasks();
}

function setTaskTab(tab) {
    currentTaskTab = tab;
    ['todas', 'pendentes', 'realizadas'].forEach(t => {
        const btn = document.getElementById(`task-tab-${t}`);
        if (t === tab) {
            btn.className = "pb-2 sm:pb-0 border-b-2 sm:border-b-0 border-indigo-600 text-indigo-600 dark:text-indigo-400 cursor-pointer";
        } else {
            btn.className = "pb-2 sm:pb-0 border-b-2 sm:border-b-0 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer";
        }
    });
    renderTasks();
}

function moveTask(index, direction) {
    const dateFilterVal = document.getElementById('taskDateFilter').value;
    const filtered = tasks.filter(t => {
        if (dateFilterVal && t.data !== dateFilterVal) return false;
        if (currentTaskTab === 'pendentes') return t.status === 'pendente';
        if (currentTaskTab === 'realizadas') return t.status === 'realizada';
        return true;
    });

    const targetTask = filtered[index];
    const globalIndex = tasks.findIndex(t => t.id === targetTask.id);
    const newGlobalIndex = globalIndex + direction;

    if (newGlobalIndex < 0 || newGlobalIndex >= tasks.length) return;

    const temp = tasks[globalIndex];
    tasks[globalIndex] = tasks[newGlobalIndex];
    tasks[newGlobalIndex] = temp;

    saveAndRenderTasks();
}

function renderTasks() {
    const container = document.getElementById('taskList');
    container.innerHTML = '';

    const dateFilterVal = document.getElementById('taskDateFilter').value;

    const filtered = tasks.filter(t => {
        if (dateFilterVal && t.data !== dateFilterVal) return false;
        if (currentTaskTab === 'pendentes') return t.status === 'pendente';
        if (currentTaskTab === 'realizadas') return t.status === 'realizada';
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-gray-400 text-sm">Nenhuma tarefa encontrada para esta data.</div>`;
        return;
    }

    filtered.forEach((task, index) => {
        const isChecked = task.status === 'realizada';
        const card = document.createElement('div');
        card.className = `bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4 transition`;
        card.innerHTML = `
            <div class="flex items-center gap-3 overflow-hidden">
                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleTaskStatus('${task.id}')" class="w-5 h-5 accent-indigo-600 rounded cursor-pointer">
                <div class="flex flex-col overflow-hidden">
                    <span class="text-sm font-medium truncate ${isChecked ? 'line-through text-gray-400 dark:text-gray-500' : ''}">${escapeHtml(task.titulo)}</span>
                    <span class="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><i class="ph ph-calendar"></i> ${formatDate(task.data)}</span>
                </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
                <div class="flex flex-col mr-1">
                    <button onclick="moveTask(${index}, -1)" ${index === 0 ? 'disabled class="text-gray-300 dark:text-gray-700 cursor-not-allowed p-0.5"' : 'class="text-gray-400 hover:text-indigo-600 transition cursor-pointer p-0.5"'} title="Mover para cima"><i class="ph ph-caret-up text-sm"></i></button>
                    <button onclick="moveTask(${index}, 1)" ${index === filtered.length - 1 ? 'disabled class="text-gray-300 dark:text-gray-700 cursor-not-allowed p-0.5"' : 'class="text-gray-400 hover:text-indigo-600 transition cursor-pointer p-0.5"'} title="Mover para baixo"><i class="ph ph-caret-down text-sm"></i></button>
                </div>
                <button onclick="openEditTaskModal('${task.id}')" class="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer" title="Editar"><i class="ph ph-pencil-simple text-lg"></i></button>
                <button onclick="deleteTask('${task.id}')" class="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer" title="Excluir"><i class="ph ph-trash text-lg"></i></button>
            </div>
        `;
        container.appendChild(card);
    });
}

function toggleTaskStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'realizada' ? 'pendente' : 'realizada';
        saveAndRenderTasks();
    }
}

function deleteTask(id) {
    if (!confirm('Deseja realmente excluir esta tarefa?')) return;
    tasks = tasks.filter(t => t.id !== id);
    saveAndRenderTasks();
}

function openEditTaskModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    document.getElementById('modalTaskId').value = task.id;
    document.getElementById('modalTaskTitle').value = task.titulo;
    document.getElementById('modalTaskDate').value = task.data;
    document.getElementById('modalTaskStatus').value = task.status;
    document.getElementById('taskModal').classList.remove('hidden');
    document.getElementById('taskModal').classList.add('flex');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('flex');
    document.getElementById('taskModal').classList.add('hidden');
}

function handleSaveTaskModal(event) {
    event.preventDefault();
    const id = document.getElementById('modalTaskId').value;
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.titulo = document.getElementById('modalTaskTitle').value;
        task.data = document.getElementById('modalTaskDate').value;
        task.status = document.getElementById('modalTaskStatus').value;
    }
    closeTaskModal();
    saveAndRenderTasks();
}

function saveAndRenderTasks() {
    localStorage.setItem('nexus_tasks', JSON.stringify(tasks));
    renderTasks();
    renderDashboard();
}