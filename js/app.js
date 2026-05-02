// Variables y Configuración
const APP_NAME = "CREPERIA";
const STORAGE = "creperia:productos";

const state = {
    productos: loadProductos(),
    currentFilter: "all"
};

const elements = {
    form: document.querySelector("#habitForm"),
    nombre: document.querySelector("#habitName"),
    tipo: document.querySelector("#habitEnergy"),
    mensaje: document.querySelector("#formMessage"),
    lista: document.querySelector("#habitList"),
    filtros: document.querySelectorAll(".filter-btn"),
    total: document.querySelector("#totalCount"),
    dulcesSaladas: document.querySelector("#pendingCount"),
    frappes: document.querySelector("#doneCount")
};

function init() {
    bindEvents();
    render();
    console.log(`Bienvenido a ${APP_NAME}`);
}

function bindEvents() {
    elements.form.addEventListener("submit", handleFormSubmit);
    elements.filtros.forEach(btn => btn.addEventListener("click", handleFilterClick));
    elements.lista.addEventListener("click", handleAction);
}

function handleFormSubmit(e) {
    e.preventDefault();

    const nombre = elements.nombre.value.trim();
    const tipo = elements.tipo.value;

    if (!nombre) {
        elements.mensaje.textContent = "Escribe el producto antes de agregar.";
        elements.mensaje.classList.remove("hidden");
        return;
    }

    const nuevoProducto = {
        id: Date.now(),
        nombre,
        tipo
    };

    state.productos.push(nuevoProducto);

    saveProductos();
    render();

    elements.form.reset();
    elements.mensaje.classList.add("hidden");
    elements.nombre.focus();
}

function handleAction(e) {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = parseInt(btn.dataset.id);
    const action = btn.dataset.action;

    if (action === "delete") {
        if (confirm("¿Eliminar este producto?")) {
            state.productos = state.productos.filter(p => p.id !== id);
        }
    }

    saveProductos();
    render();
}

function handleFilterClick(e) {
    state.currentFilter = e.target.dataset.filter;
    render();
}

function render() {
    elements.lista.innerHTML = "";

    const filtrados = state.productos.filter(p => {
        if (state.currentFilter === "dulce") return p.tipo === "dulce";
        if (state.currentFilter === "salada") return p.tipo === "salada";
        if (state.currentFilter === "frappe") return p.tipo === "frappe";
        return true;
    });

    filtrados.forEach(p => {
        const div = document.createElement("div");
        div.className = "flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200";

        div.innerHTML = `
            <span class="font-medium">
                ${p.nombre}
                <span class="ml-2 text-xs bg-slate-100 px-2 py-1 rounded">
                    ${p.tipo.toUpperCase()}
                </span>
            </span>
            <button data-id="${p.id}" data-action="delete" class="rounded-lg p-2 text-red-500 hover:bg-red-50">
                🗑️
            </button>
        `;

        elements.lista.appendChild(div);
    });

    updateCounters();
}

function updateCounters() {
    elements.total.textContent = state.productos.length;

    elements.dulcesSaladas.textContent =
        state.productos.filter(p => p.tipo === "dulce" || p.tipo === "salada").length;

    elements.frappes.textContent =
        state.productos.filter(p => p.tipo === "frappe").length;
}

function loadProductos() {
    try {
        const data = localStorage.getItem(STORAGE);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveProductos() {
    localStorage.setItem(STORAGE, JSON.stringify(state.productos));
}

init();