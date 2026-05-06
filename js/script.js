// Variables
const APP_NAME = "Habit Lab"; // es const porque el valor no cambiará a la ejecución del programa

const STORAGE = "habit-lab:habits"; // se sentraliza en una constante para evitar errores al escribr texto vaias veces

// Estado principal de la aplicacion.
// Se mantiene en un solo objeto para que sea facil saber que datos estan disponibles en la aplicacion y para evitar tener muchas variables 
// sueltas por el codigo.
const state = {
    habits: loadHabits(), // cargamos los hábitos del localStorage al iniciar la aplicación con la función loadHabits()
    currentFilter: "all" // estado del filtro actual en este caso mostrara todos los hábitos, pero puede cambiarse a "pending" o "done"
};

// referencia al DOM
// Se agrupan todos los elementos en un objeto llamado elements 
const elements = {
    form: document.querySelector("#habitForm"), // seleccionamos el formulario
    habitName: document.querySelector("#habitName"), // seleccionamos el input del nombre del hábito
    habitEnergy: document.querySelector("#habitEnergy"), // seleccionamos el input de energía del hábito
    formMessage: document.querySelector("#formMessage"), // seleccionamos el elemento donde se mostrarán los mensajes del formulario
    habitList: document.querySelector("#habitList"), // seleccionamos la lista donde se mostrarán los hábitos
    filterButtons: document.querySelectorAll(".filter-btn"), // seleccionamos todos los botones para aplicar los filtros
    totalCount: document.querySelector("#totalCount"), // seleccionamos el elemento donde se mostrará el conteo total de hábitos
    pendingCount: document.querySelector("#pendingCount"), // seleccionamos el elemento donde se mostrará el conteo de hábitos pendientes
    doneCount: document.querySelector("#doneCount") // seleccionamos el elemento donde se mostrará el conteo de hábitos completados
}

// Inicializar la aplicación
// Separar la inicializacion para que sea mas facil de entender y para que el código sea mas organizado.
function init() {
    bindEvents(); // vinculamos los eventos a los elementos del DOM
    render(); // renderizamos la lista de hábitos al cargar la página

    console.log(`Bienvenido a ${APP_NAME}`); // mensaje de bienvenida
}

//Registra los eventos principales de la aplicación
// Esto evitara tener eventoz mezclados con la lógica de la aplicación y hará que el código sea más organizado y fácil de entender.
function bindEvents() {
    elements.form.addEventListener("submit", handleFormSubmit); // evento que escucha si oprime el botón de submit del formulario para agregar un 
    // nuevo hábito

    elements.filterButtons.forEach((button) => {
        button.addEventListener("click", handleFilterClick); // evento que escucha si se hace click en alguno de los botones de filtro para cambiar 
        // el estado del filtro actual
    })

    // Delegacion de eventos:
    // En lugar de usar un evenyo onclick (es decir que se ejecuta al hacer click en el botón) en el html, 
    // va a escuchar los clics que esten dentro de el contenedor de la lista de hábitos 
    // Esto ayuda a que si se tiene que modicar el html, no se tenga que modificar el código js
    elements.habitList.addEventListener("click", handleHabitAction); // evento que escucha los clics dentro de la lista de hábitos para manejar
    // las acciones de completar o eliminar un hábito
}


// Carga los hábitos del localStorage
// se usa un try/catch para evitar que la app falle si el almacenamiento tiene datos invalidos
function loadHabits() {
    try {
        const storeHabits = localStorage.getItem(STORAGE); // obtenemos los hábitos almacenados en el localStorage
        
        if (!storeHabits) {
            return []; // si no hay hábitos almacenados, retornamos un array vacío
        }
        return JSON.parse(storeHabits);
    } catch (error) {
        console.error("No se pudieron cargar los hábitos:", error);
        return [];
    }
}

// Guarda los hábitos actuales en el localStorage
// Esta funcion centraliza el guardado para no estar repitiendo logica
function saveHabits() {
    localStorage.setItem(STORAGE, JSON.stringify(state.habits)); // convertimos el array de hábitos a una cadena JSON y lo guardamos en el localStorage
}

// funcion para manejar el envio del formulario
function handleFormSubmit(event) { // handleFormSubmit en español seria: manejarEnvioFormulario
    event.preventDefault(); // evitamos que el formulario se recargue al enviar

    const habitName = elements.habitName.value.trim(); // obtenemos el valor del input del nombre del hábito y eliminamos espacios en blanco
    const habitEnergy = elements.habitEnergy.value; // obtenemos el valor seleccionado del select de energía del hábito

    // Validación básica del formulario
    // evita que se agreguen hábitos sin nombre (evita habitos fantasma)
    if (!habitName) {
        showMessage("Escribe el nombre del hábito antes de agregarlo"); // mostramos un mensaje de error si el nombre del hábito está vacío
        return;
    }

    // Crear un nuevo hábito
    addHabit(habitName, habitEnergy); // llamamos a la función para agregar un nuevo hábito con el nombre y energía proporcionados


    // Limpiar el formulario después de agregar el hábito
    elements.form.reset(); // reseteamos el formulario para limpiar los campos después de agregar un hábito
    elements.habitName.focus(); // ponemos el foco de nuevo en el input del nombre del hábito para facilitar la entrada de nuevos hábitos
    hideMessage(); // ocultamos cualquier mensaje que se haya mostrado anteriormente
}

// Cambia el estado de un habito
// Nos devolvera (retornará) el objeto habito cuando se cambie su estado para poder mostrarse
function toggleHabit(id) { // toggleHabit en español seria: cambiarEstadoHabito
    state.habits = state.habits.map((habit) => {
        if (habit.id !== id) { // buscamos el hábito con el id proporcionado
            return habit; // si el id no coincide, retornamos el hábito sin cambios
        }

        return {
            ...habit, // se devuelve eo habito pero con el estado actualizado
            done: !habit.done // cambiamos el estado de "done" a su valor contrario (si estaba en true, se cambia a false y viceversa)
        }; 
    });

    saveHabits(); // guardamos los hábitos actualizados en el localStorage
    render(); // renderizamos o actualizamos la lista de hábitos para reflejar el cambio en la interfaz
}

// Elimina un hábito de la lista
function deleteHabit(id) {
    state.habits = state.habits.filter((habit) => habit.id !== id);//filtramos el array de hábitos para eliminar el hábito con el id 
    // proporcionado y devolvemos un nuevo array sin ese hábito
    saveHabits();
    render();
}

// Obtiene habitos filtrados según el estado del filtro actual
function getFilteredHabits() {
    if (state.currentFilter === "pending") {
        return state.habits.filter((habit) => !habit.done); // si el filtro es "pending", retornamos solo los hábitos 
        // que no están completados (done: false)
    }
    if (state.currentFilter === "done") {
        return state.habits.filter((habit) => habit.done); // si el filtro es "done", retornamos solo los hábitos que están completados (done: true)
    }

    return state.habits; // si el filtro es "all", retornamos todos los hábitos sin filtrar
}

// Maneja el cambio del filtro al hacer click en los botones
function handleFilterClick(event) {
    const selectedFilter = event.target.dataset.filter; // obtenemos el valor del filtro seleccionado del atributo data-filter del botón clickeado

    state.currentFilter = selectedFilter; // actualizamos el estado del filtro actual con el valor seleccionado
    render(); // renderizamos la lista de hábitos para mostrar los hábitos filtrados según el nuevo estado del filtro
}

// Maneja acciones sobre cada hábito (completar o eliminar)
// Usa data-action y data-id para saber que boton se hizo click y sobre que hábito se hizo click
function handleHabitAction(event) {
    const button = event.target.closest("[data-action]"); // buscamos el elemento más cercano al clic que tenga el atributo data-action
    //  para identificar la acción a realizar

    if (!button) {
        return; // si no se hizo click en un botón con data-action, salimos de la función
    }

    const action = button.dataset.action; // obtenemos el valor de lo que se quiere hacer (completar o eliminar) del atributo data-action del botón
    const habitId = button.dataset.id; // obtenemos el id del hábito sobre el que se hizo click del atributo data-id del botón

    if (action === "toggle") {
        toggleHabit(habitId); // si la acción es "toggle", llamamos a la función para cambiar el estado del hábito con el id proporcionado
    } else if (action === "delete") {
        deleteHabit(habitId); // si la acción es "delete", llamamos a la función para eliminar el hábito con el id proporcionado
    }
}

function addHabit(name, energy) {
    const newHabit = { // se crea un objeto llamado habito que se guardara en un arreglo llamado
        // habits dentro de el objeto state
        id: Date.now().toString(), // se genera un id único para el hábito usando la marca de tiempo actual convertida a cadena
        name, // se asigna el nombre del hábito al campo name del objeto
        energy, // se asigna la energía del hábito al campo energy del objeto
        done: false, // se establece el estado inicial del hábito como no completado (done: false)
        createdAt: new Date().toISOString() // se guarda la fecha de creación del hábito en formato ISO para poder ordenarlos por fecha si se desea
        // la fecha en formato ISO es: "2024-06-01T12:00:00.000Z" donde "T" separa la fecha de la hora y "Z" indica que la hora está en formato UTC (Tiempo Universal Coordinado)
    };
    state.habits.push(newHabit);
    console.log(`Hábito agregado: ${name} id ${newHabit.id}`); // mensaje de consola para confirmar que el hábito se ha agregado correctamente
    saveHabits();
    render();
}

// Renderiza toda la interfaz de la aplicación
function render() {
    renderSumary(); // renderizamos el resumen de hábitos (conteo total, pendientes y completados)
    renderFilterButtons(); // renderizamos los botones de filtro para reflejar el estado del filtro actual
    renderHabitList(); // renderizamos la lista de hábitos filtrados según el estado del filtro actual  
}

// Renderiza el resumen de hábitos o contador de html(conteo total, pendientes y completados)
function renderSumary() {
    const total = state.habits.length; // obtenemos el conteo total de hábitos
    const pending = state.habits.filter((habit) => !habit.done).length; // obtenemos el conteo de hábitos pendientes (no completados)
    const done = state.habits.filter((habit) => habit.done).length; // obtenemos el conteo de hábitos completados

    elements.totalCount.textContent = total; // actualizamos el texto del elemento totalCount con el conteo total de hábitos
    elements.pendingCount.textContent = pending; // actualizamos el texto del elemento pendingCount con el conteo de hábitos pendientes
    elements.doneCount.textContent = done; // actualizamos el texto del elemento doneCount con el conteo de hábitos completados
}

// Renderiza los botones de filtro para reflejar el estado del filtro actual
function renderFilterButtons() {
    elements.filterButtons.forEach((button) => {
        const isActive = button.dataset.filter === state.currentFilter; // verificamos si el filtro del botón coincide con el estado del filtro actual

        button.classList.toggle("bg-blue-900", isActive); // agregamos la clase "active" al botón si es el filtro activo, de lo contrario la removemos
        button.classList.toggle("text-white", isActive); // agregamos la clase "text-white" al botón si es el filtro activo, de lo contrario la removemos
        button.classList.toggle("border-slate-900", !isActive); // agregamos la clase "bg-gray-200" al botón si no es el filtro activo, de lo contrario la removemos
    });
}

// Renderiza la lista de hábitos
function renderHabitList() {
    const habits = getFilteredHabits(); // obtenemos los hábitos filtrados según el estado del filtro actual

    if (habits.length === 0) {
        elements.habitList.innerHTML = getEmptyState(); // si no hay hábitos para mostrar, renderizamos un estado vacío con un mensaje y una imagen
        return;
    }

    elements.habitList.innerHTML = habits.map(getHabitTemplate).join(""); // si hay hábitos para mostrar, renderizamos cada hábito usando la función getHabitTemplate
    //  y unimos los resultados en una sola cadena HTML para mostrarla en el contenedor de la lista de hábitos
}

// Devuelve el template HTML para un hábito
function getHabitTemplate(habit) {
    const statusText = habit.done ? "Completado" : "Pendiente"; // determinamos el texto de estado del hábito según si está completado o pendiente
    const statusClass = habit.done
        ? "bg-green-100 text-green-800" 
        : "bg-yellow-500 text-yellow-800"; // determinamos la clase de color del estado del hábito según si está completado o pendiente

    const toggleText = habit.done ? "Marcar como pendiente" : "Marcar como completado"; // determinamos el texto del botón de toggle 
    // según si el hábito está completado o pendiente

    return `
        <article class="rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-200">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div class="flex flex-wrap items-center gap-2">
                        <h2 class="text-lg font-semibold ${habit.done ? "line-through text-slate-400" : " text-slate-900"}">
                         ${escapeHTML(habit.name)}
                        </h2>

                        <span class="rounded-full px-3 py-1 text-xs font-medium ${statusClass}">
                            ${statusText}
                        </span>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <button
                            type="button"
                            data-action="toggle"
                            data-id="${habit.id}"
                            class="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium transition hover:bg-slate-100"
                        >
                            ${toggleText}
                        </button>

                        <button
                            type="button"
                            data-action="delete"
                            data-id="${habit.id}"
                            class="rounded-xl  bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `
}

function getEmptyState() {
    const messages = {
        all: "Aún no tienes hábitos registrados. Agrega el primero desde el formulario.",
        pending: "No tienes hábitos pendientes.",
        done: "No tienes hábitos completados."
    };

    return `
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p class="text-slate-600">
                ${messages[state.currentFilter]}
            </p>
        </div>
    `;

}

// Escapa texto ingresado por el usuario
// Esto evita insertar HTML malicioso 
function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// muestra mensajes del formulario
function showMessage(message) {
    elements.formMessage.textContent = message; // actualizamos el texto del elemento formMessage con el mensaje proporcionado
    elements.formMessage.classList.remove("hidden"); // mostramos el mensaje eliminando la clase "hidden"
}

// oculta los mensajes del formulario
function hideMessage() {
    elements.formMessage.textContent = ""; // limpiamos el texto del elemento formMessage
    elements.formMessage.classList.add("hidden"); // ocultamos el mensaje agregando la clase "hidden"
}

// Iniciamos la aplicación al cargar la página
init();