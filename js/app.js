let data = JSON.parse(localStorage.getItem("toDoList")) || [];
let taskCategory = "";
const categories = ["pending", "in-progress", "completed"];
const $ = select => document.querySelector(select);
const modalContent = $("#modal-content");
const modal = $(".modal");
const modalTitle = $("#modal-title");
const form = $("#form");
const btnSubmit = $("#btn-submit");

class Task {
    constructor(id, name, description, category, date) {
        this.id = id || Date.now().toString(36) + Math.random().toString(36).substring(2);
        this.name = name;
        this.description = description;
        this.category = category;
        this.date = date || new Date();
    }
    edit(name, description) {
        this.name = name;
        this.description = description;
        updateData(this.category);
    }
    delete() {
        const taskIndex = data.findIndex(item => item.id === this.id);
        data.splice(taskIndex, 1);
        updateData(this.category);
    }
    ui() {
        const container = document.createElement("div");
        container.classList.add("task");
        container.setAttribute("id", this.id);
        container.setAttribute("draggable", true);
        container.setAttribute("ondragstart", "onDragStart(event)");
        container.innerHTML = `
            <div class="options">
                <i onclick="openModal(this.parentElement.parentElement, '${this.category}', 'edit', 'Editar Tarea')" class="ri-edit-box-line"></i>
                <i onclick="deleteTask('${this.id}')" class="ri-delete-bin-line"></i>
            </div>
            <p class="name">${this.name}</p>
            <p class="description">${this.description}</p> 
        `;
        return container;
    }
}

const onDragStart = (e) => e.dataTransfer.setData("text/plain", e.target.id);

const onDrop = (e) => {
    const task = findTask(e.dataTransfer.getData("text"));
    const clone = {...task};
    task.category = e.currentTarget.id;
    updateData(clone.category);
    render(e.currentTarget.id);
    e.dataTransfer.clearData();
};

const onDragOver = (e) => e.preventDefault();

const openModal = (el, category, action = "create", title = "Crear tarea") => {
    const { innerHeight } = window;
    const { top, left, width } = el.getBoundingClientRect();
    const spaceAvailable = innerHeight - top;
    const modalHeight = 430;
    
    taskCategory = category;
    modalTitle.textContent = title;
    modalContent.classList.add("modal-content-visible");
    form.setAttribute("data-action", action);
    form.reset();
    
    if (action === "edit") {
        const { id, name, description } = findTask(el.id);
        form.setAttribute("data-action", action);
        form.setAttribute("data-id", id);
        form.name.value = name;
        form.description.value = description;
    }

    const setPostionModal = ([arrowPosition, topPosition ]) => {
        modal.children[0].style.cssText = `${arrowPosition}: -10px`;
        modal.style.cssText = `width: ${width}px; top: ${topPosition}px; left: ${left}px;`;
    }

    setPostionModal(modalHeight > spaceAvailable ? ["bottom", top - modalHeight] : ["top", top + 40]);
};

modalContent.addEventListener("click", e => {
    if (e.target === modalContent) modalContent.classList.remove("modal-content-visible");
});


const render = (category) => {
    const section = $(`#${category}`);
    const count = section.parentElement.querySelector(".count");
    const dataFilter = data.filter((item) => item.category === category);
    if (dataFilter.length > 0) {
        const fragment = document.createDocumentFragment();
        section.innerHTML = "";
        dataFilter.map((item) => fragment.appendChild(item.ui()));
        section.appendChild(fragment);
    } else {
        section.innerHTML = `<p class="msg">Todavia no tienes tareas</p>`;
    }
    count.textContent = dataFilter.length;
};

const findTask = (id, property) => {
    const result = data.find(item => item.id === id);
    return result ? !property ? result : result.hasOwnProperty(property) ? result[property] : -1 : false;
};

const createTask = ({name, description, category}) => {
    data.push(new Task(undefined, name, description, category, undefined));
    updateData(taskCategory);
} 

const deleteTask = id => findTask(id).delete();

const updateData = category => {
    localStorage.setItem("toDoList", JSON.stringify(data));
    render(category);
};

form.addEventListener("submit", e => {
    const formAction = e.target.dataset.action;
    const formData = new FormData(form);
    e.preventDefault();
    btnSubmit.setAttribute("disabled", "true");

    formAction === "create" 
    ? createTask({name: formData.get("name"), description: formData.get("description"), category: taskCategory }) 
    : findTask(e.target.dataset.id).edit(formData.get("name"), formData.get("description"));

    modalContent.classList.remove("modal-content-visible");
    btnSubmit.removeAttribute("disabled");
});

!(function () {
    if(data.length > 0 ) {
        const newData = data.map(item => new Task(item.id, item.name, item.description, item.category, item.date));
        data = newData;
    }
    categories.map(category => render(category));
})();


