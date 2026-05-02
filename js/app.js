//variables
var appName = "Creperia";
let filter = "All"; //es let por que el valor cambiaria a lo largo del programa
const STORAGE = "creperia"; //es const por que el valor no cambiara a lo largo del programa

//DOM elements
const form = document.querySelector("#form"); //selecionamos el formulario
const input = document.querySelector("#input"); //selecionamos el input
const crepafrappes = document.getElementById("crepafrappes"); //selecionamos el contenedor de las crepas y frappes
const list = document.getElementById("list"); //selecionamos el contenedor de las crepas y frappes

//Botones
const btnAll = document.getElementById("all");
const btncrepa1 = document.getElementById("crepe");
const btncrepa2 = document.getElementById("crepes");
const btnfrappes = document.getElementById("drink");

//datos (array de objetos)
let creperia = load(); //cargamos los datos del localStorage al array de objetos

//funciones

//cargamos los datos del localStorage al array de objetos
function load() {
    const data = localStorage.getItem(STORAGE); //obtenemos los datos del localStorage
    if (!data) {
        return []; //si no hay datos, devolvemos un array vacio
    }
    return JSON.parse(data); //si hay datos, los parseamos y los devolvemos

}

//guardamos los datos en el localStorage
function save() {
    localStorage.setItem(STORAGE, JSON.stringify(creperia)); //guardamos los datos en el localStorage
}


//guarda los datos en el localStorage y en arreglo de objetos
function addCreperia(name, crepasfrappes) {
    const creperia = {
        id: Date.now(), //generamos un id unico para cada creperia
        name: name,
        crepasfrappes: crepasfrappes


    };
    creperia.push(creperia);
    save(); //guardamos los datos en el localStorage
    render(); //renderizamos la lista de creperia
}

//elimina una creperia del array de objetos
function deleteCreperia(id) {
    creperia = creperia.filter((creperia) => creperia.id !== id); //filtramos el array de objetos para eliminar la creperia con el id especificado
    save(); //guardamos los datos en el localStorage
    render(); //renderizamos la lista de creperia
}

//obtine segun  el estado del filtro las creperias que se van a mostrar
function getFiltered() {
    if (filter === "All") {
        return creperia.filter(creperia => !creperia.done); //si el filtro es "All", devolvemos todas las creperias
    } else if (filter === "done") {
        return creperia.filter((creperia) => !creperia.done); //si el filtro es "crepe", devolvemos las creperias que no estan hechas y que son crepes
    } else {
        return creperia;
    }
}



function toggleCreperia(id) {
    creperia = creperia.map((creperia) => {
        if (creperia.id === id) {
            creperia.done = !creperia.done; //cambiamos el estado de la creperia
        }
        return creperia; //devolvemos la creperia
    });
    save(); //guardamos los datos en el localStorage
    render(); //renderizamos la lista de creperia
}



//render
function render() {
    const data = getFiltered(); //obtenemos los datos filtrados
    list.innerHTML = data.map(creperia => {
    return `
    <div class="">
    <span>
        ${creperia.name} - ${creperia.crepasfrappes}crepas/frappes-${creperia.done ? "+" : "x"}
    </span>
        <div>
        <button onclick="toggle(${creperia.id})">+</button>
        <button onclick="remove(${creperia.id})">x</button>
        </div>
        </div>
    `;
        }).join(""); //unimos los elementos del array en un string
}

//Eventos
form.addEventListener("submit", (e) => {
    e.preventDefault(); //evitamos que el formulario se envie
    addCreperia(input.value, crepafrappes.value); //agregamos la creperia al array de objetos
   
    form.reset(); //reseteamos el formulario
});

//filtros
btnAll.addEventListener("click", () => {
    filter = "All"; //cambiamos el filtro a "All"
    render(); //renderizamos la lista de creperia
});
btncrepa1.addEventListener("click", () => {
    filter = "crepe"; //cambiamos el filtro a "crepe"
    render(); //renderizamos la lista de creperia
});
btncrepa2.addEventListener("click", () => {
    filter = "crepes"; //cambiamos el filtro a "crepes"
    render(); //renderizamos la lista de creperia
});
btnfrappes.addEventListener("click", () => {
    filter = "drink";
    render(); //cambiamos el filtro a "drink"
});

//funciones globales para botones de inline 
window.toggle = toggleCreperia; //hacemos la funcion toggleCreperia global para poder usarla en los botones de inline
window.remove = deleteCreperia; //hacemos la funcion removeCreperia global para poder usarla en los botones de inline

//Init (renderizamos la lista de creperia al cargar la pagina)
console.log("Bienvenido a " + appName); //mostramos un mensaje de bienvenida en la consola
render(); //renderizamos la lista de creperia al cargar la pagina