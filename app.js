// Variables y Configuración
const APP_NAME = "CREPERIA";
const STORAGE = "habits-lab:habits";

const state = {
    habits: loadhabits(),
    currentFilter: "all"
};

const elements = {
    form: document.querySelector("#habitForm"),
    habitName: document.querySelector("#habitName"),
    habitEnergy: document.querySelector("#habitEnergy"),
    formMessage: document.querySelector("#formMessage"),
    habitList: document.querySelector("#habitList"),
    filterButtons: document.querySelectorAll(".filter-btn"),
    totalCount: document.querySelector("#totalCount"),
    pendingCount: document.querySelector("#pendingCount"),
    doneCount: document.querySelector("#doneCount")
};

function init() {
    bindEvents();
    render();
    console.log(`Bienvenido a ${APP_NAME}`);
}

function bindEvents() {
    elements.form.addEventListener("submit", handleFormSubmit);
    elements.filterButtons.forEach(btn => btn.addEventListener("click", handleFilterClick));
    elements.habitList.addEventListener("click", handleHabitAction);
}

function handleFormSubmit(event) {
    event.preventDefault();
    const name = elements.habitName.value.trim();
    const energy = elements.habitEnergy.value;

    if (!name) {
        elements.formMessage.textContent = "Escribe el untable y relleno antes de agregar.";
        elements.formMessage.classList.remove("hidden");
        return;
    }

    const newHabit = { id: Date.now(), name, energy, done: false };
    state.habits.push(newHabit);
    
    saveHabits();
    render();
    
    elements.form.reset();
    elements.formMessage.classList.add("hidden");
    elements.habitName.focus();
}

function handleHabitAction(e) {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = parseInt(btn.dataset.id);
    const action = btn.dataset.action;

    if (action === "delete") {
        state.habits = state.habits.filter(h => h.id !== id);
    } else if (action === "toggle") {
        const item = state.habits.find(h => h.id === id);
        if (item) item.done = !item.done;
    }
    saveHabits();
    render();
}

function handleFilterClick(e) {
    state.currentFilter = e.target.dataset.filter;
    render();
}

function render() {
    elements.habitList.innerHTML = "";

    const filtered = state.habits.filter(h => {
        if (state.currentFilter === "done") return h.done; // Representa Frappes/Hecho
        if (state.currentFilter === "pending") return !h.done; // Representa Dulces y Saladas
        return true;
    });

    filtered.forEach(habit => {
        const div = document.createElement("div");
        div.className = "flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200";
        div.innerHTML = `
            <span class="${habit.done ? 'line-through text-slate-400' : 'font-medium'}">
                ${habit.name} <span class="ml-2 text-xs bg-slate-100 px-2 py-1 rounded">${habit.energy}</span>
            </span>
            <div class="flex gap-2">
                <button data-id="${habit.id}" data-action="toggle" class="rounded-lg p-2 hover:bg-slate-100">
                    ${habit.done ? '✅' : '⏳'}
                </button>
                <button data-id="${habit.id}" data-action="delete" class="rounded-lg p-2 text-red-500 hover:bg-red-50">
                    🗑️
                </button>
            </div>
        `;
        elements.habitList.appendChild(div);
    });

    updateCounters();
}

function updateCounters() {
    elements.totalCount.textContent = state.habits.length;
    elements.pendingCount.textContent = state.habits.filter(h => !h.done).length;
    elements.doneCount.textContent = state.habits.filter(h => h.done).length;
}

function loadhabits() {
    const data = localStorage.getItem(STORAGE);
    return data ? JSON.parse(data) : [];
}

function saveHabits() {
    localStorage.setItem(STORAGE, JSON.stringify(state.habits));
}

init();
