
class TaskManager {
constructor() {
this.tasks = [];
this.currentFilter = 'all';
this.currentEditId = null;
this.init();
}

init() {
this.loadTasks();
this.bindEvents();
this.updateStats();
this.renderTasks();
this.loadTheme();
}

loadTasks() {
const saved = localStorage.getItem('taskmaster_tasks');
if (saved) {
try {
this.tasks = JSON.parse(saved);
} catch (error) {
console.error('Error al cargar tareas:', error);
this.tasks = [];
}
}
}

saveTasks() {
try {
localStorage.setItem('taskmaster_tasks', JSON.stringify(this.tasks));
console.log('Tareas guardadas:', this.tasks);
} catch (error) {
console.error('Error al guardar tareas:', error);
}
}

loadTheme() {
const savedTheme = localStorage.getItem('taskmaster_theme');
if (savedTheme === 'dark') {
document.body.setAttribute('data-theme', 'dark');
document.getElementById('themeToggle').querySelector('i').className = 'fas fa-sun';
}
}

bindEvents() {
document.getElementById('taskForm').addEventListener('submit', (e) => {
e.preventDefault();
this.addTask();
});


document.getElementById('editForm').addEventListener('submit', (e) => {
e.preventDefault();
this.updateTask();
});


document.querySelectorAll('.priority-btn').forEach(btn => {
btn.addEventListener('click', (e) => {
e.preventDefault();
const container = btn.closest('.priority-buttons');
container.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
});
});


document.querySelectorAll('.filter-btn').forEach(btn => {
btn.addEventListener('click', () => {
document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
this.currentFilter = btn.dataset.filter;
this.renderTasks();
});
});


document.getElementById('searchBox').addEventListener('input', (e) => {
this.searchTasks(e.target.value);
});


document.getElementById('themeToggle').addEventListener('click', () => {
this.toggleTheme();
});


document.getElementById('closeModal').addEventListener('click', () => {
this.closeModal();
});

document.getElementById('editModal').addEventListener('click', (e) => {
if (e.target.id === 'editModal') {
this.closeModal();
}
});
}

addTask() {
const title = document.getElementById('taskTitle').value.trim();
const description = document.getElementById('taskDescription').value.trim();
const category = document.getElementById('taskCategory').value;
const priority = document.querySelector('.priority-btn.active').dataset.priority;
const dueDate = document.getElementById('taskDueDate').value;

if (!title) return;

const task = {
id: Date.now(),
title,
description,
category,
priority,
dueDate,
completed: false,
createdAt: new Date().toISOString()
};

this.tasks.unshift(task);
this.saveTasks();
this.updateStats();
this.renderTasks();
this.resetForm();
this.showNotification('Tarea creada exitosamente', 'success');
}

updateTask() {
const title = document.getElementById('editTitle').value.trim();
const description = document.getElementById('editDescription').value.trim();
const category = document.getElementById('editCategory').value;
const priority = document.querySelector('#editPriorityButtons .priority-btn.active').dataset.priority;
const dueDate = document.getElementById('editDueDate').value;

if (!title) return;

const taskIndex = this.tasks.findIndex(task => task.id === this.currentEditId);
if (taskIndex !== -1) {
this.tasks[taskIndex] = {
...this.tasks[taskIndex],
title,
description,
category,
priority,
dueDate,
updatedAt: new Date().toISOString()
};

this.saveTasks();
this.updateStats();
this.renderTasks();
this.closeModal();
this.showNotification('Tarea actualizada exitosamente', 'success');
}
}

toggleTask(id) {
const taskIndex = this.tasks.findIndex(task => task.id === id);
if (taskIndex !== -1) {
this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
this.tasks[taskIndex].completedAt = this.tasks[taskIndex].completed ? new Date().toISOString() : null;
this.saveTasks();
this.updateStats();
this.renderTasks();

const action = this.tasks[taskIndex].completed ? 'completada' : 'marcada como pendiente';
this.showNotification(`Tarea ${action}`, 'success');
}
}

deleteTask(id) {
if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
this.tasks = this.tasks.filter(task => task.id !== id);
this.saveTasks();
this.updateStats();
this.renderTasks();
this.showNotification('Tarea eliminada', 'error');
}
}

editTask(id) {
const task = this.tasks.find(task => task.id === id);
if (!task) return;

this.currentEditId = id;

document.getElementById('editTitle').value = task.title;
document.getElementById('editDescription').value = task.description;
document.getElementById('editCategory').value = task.category;
document.getElementById('editDueDate').value = task.dueDate;
document.querySelectorAll('#editPriorityButtons .priority-btn').forEach(btn => {
btn.classList.remove('active');
if (btn.dataset.priority === task.priority) {
btn.classList.add('active');
}
});

this.openModal();
}

openModal() {
const modal = document.getElementById('editModal');
modal.style.display = 'block';
setTimeout(() => modal.classList.add('show'), 10);
}

closeModal() {
const modal = document.getElementById('editModal');
modal.classList.remove('show');
setTimeout(() => modal.style.display = 'none', 300);
this.currentEditId = null;
}

searchTasks(query) {
const filteredTasks = this.getFilteredTasks().filter(task =>
task.title.toLowerCase().includes(query.toLowerCase()) ||
task.description.toLowerCase().includes(query.toLowerCase()) ||
task.category.toLowerCase().includes(query.toLowerCase())
);
this.renderTasksList(filteredTasks);
}

getFilteredTasks() {
switch (this.currentFilter) {
case 'completed':
return this.tasks.filter(task => task.completed);
case 'pending':
return this.tasks.filter(task => !task.completed);
default:
return this.tasks;
}
}

renderTasks() {
const filteredTasks = this.getFilteredTasks();
this.renderTasksList(filteredTasks);
}

renderTasksList(tasks) {
const tasksList = document.getElementById('tasksList');

if (tasks.length === 0) {
tasksList.innerHTML = `
<div class="empty-state">
<i class="fas fa-search"></i>
<h3>No se encontraron tareas</h3>
<p>Intenta ajustar tus filtros o crear una nueva tarea</p>
</div>
`;
return;
}

tasksList.innerHTML = tasks.map(task => `
<div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}">
<div class="task-header">
<div class="task-main">
<h3 class="task-title">${this.escapeHtml(task.title)}</h3>
${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
<div class="task-meta">
<span class="task-category">
<i class="fas fa-tag"></i>
${this.getCategoryIcon(task.category)} ${this.capitalize(task.category)}
</span>
<span class="task-priority ${task.priority}">
<i class="fas fa-flag"></i>
${this.capitalize(task.priority)}
</span>
${task.dueDate ? `
<span class="task-due">
<i class="fas fa-calendar"></i>
${this.formatDate(task.dueDate)}
</span>
` : ''}
</div>
</div>
<div class="task-actions">
<button class="task-btn complete" onclick="taskManager.toggleTask(${task.id})" title="${task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}">
<i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
</button>
<button class="task-btn edit" onclick="taskManager.editTask(${task.id})" title="Editar tarea">
<i class="fas fa-edit"></i>
</button>
<button class="task-btn delete" onclick="taskManager.deleteTask(${task.id})" title="Eliminar tarea">
<i class="fas fa-trash"></i>
</button>
</div>
</div>
</div>
`).join('');
}

updateStats() {
const total = this.tasks.length;
const completed = this.tasks.filter(task => task.completed).length;
const pending = total - completed;
const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

document.getElementById('totalTasks').textContent = total;
document.getElementById('completedTasks').textContent = completed;
document.getElementById('pendingTasks').textContent = pending;
document.getElementById('completionRate').textContent = completionRate + '%';
document.getElementById('progressFill').style.width = completionRate + '%';
document.getElementById('progressText').textContent = `${completionRate}% completado`;
}

resetForm() {
document.getElementById('taskForm').reset();
document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
document.querySelector('.priority-btn.low').classList.add('active');
}

toggleTheme() {
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const icon = themeToggle.querySelector('i');

if (body.getAttribute('data-theme') === 'dark') {
body.removeAttribute('data-theme');
icon.className = 'fas fa-moon';
localStorage.setItem('taskmaster_theme', 'light');
} else {
body.setAttribute('data-theme', 'dark');
icon.className = 'fas fa-sun';
localStorage.setItem('taskmaster_theme', 'dark');
}
}

showNotification(message, type = 'info') {

const notification = document.createElement('div');
notification.className = `notification ${type}`;
notification.style.cssText = `
position: fixed;
top: 20px;
right: 20px;
background: ${type === 'success' ? 'var(--accent-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
color: white;
padding: 1rem 1.5rem;
border-radius: 8px;
box-shadow: var(--shadow-lg);
z-index: 1001;
transform: translateX(100%);
transition: transform 0.3s ease;
font-weight: 500;
max-width: 300px;
`;
notification.textContent = message;

document.body.appendChild(notification);

setTimeout(() => {
notification.style.transform = 'translateX(0)';
}, 100);


setTimeout(() => {
notification.style.transform = 'translateX(100%)';
setTimeout(() => {
document.body.removeChild(notification);
}, 300);
}, 3000);
}

escapeHtml(text) {
const div = document.createElement('div');
div.textContent = text;
return div.innerHTML;
}

capitalize(str) {
return str.charAt(0).toUpperCase() + str.slice(1);
}

formatDate(dateString) {
const date = new Date(dateString);
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

if (date.toDateString() === today.toDateString()) {
return 'Hoy';
} else if (date.toDateString() === tomorrow.toDateString()) {
return 'Mañana';
} else {
return date.toLocaleDateString('es-ES', {
day: 'numeric',
month: 'short',
year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
});
}
}

getCategoryIcon(category) {
const icons = {
personal: '👤',
trabajo: '💼',
estudio: '📚',
salud: '🏥',
hogar: '🏠',
otro: '📋'
};
return icons[category] || '📋';
}
}


let taskManager;
document.addEventListener('DOMContentLoaded', () => {
taskManager = new TaskManager();
});

document.addEventListener('keydown', (e) => {

if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
e.preventDefault();
document.getElementById('taskTitle').focus();
}


if (e.key === 'Escape') {
taskManager.closeModal();
}
});


window.addEventListener('beforeunload', () => {
if (taskManager) {
taskManager.saveTasks();
}
});
