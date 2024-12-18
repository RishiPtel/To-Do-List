document.addEventListener("DOMContentLoaded", () => {
    const addNoteButton = document.getElementById("add-note-button");
    const modal = document.getElementById("note-modal");
    const closeModal = document.getElementById("close-modal");
    const saveNoteButton = document.getElementById("save-note-button");
    const stickyContainer = document.getElementById("sticky-container");
    const titleInput = document.getElementById("note-title");
    const descriptionInput = document.getElementById("note-description");
    const errorMessage = document.getElementById("error-message");
    let selectedColor = "#ffffff"; // Default color
    let editingNoteIndex = null;

    // Initialize the color wheel
    const colorWheel = new iro.ColorPicker("#color-wheel-container", {
        width: 200,
        color: selectedColor,
    });

    colorWheel.on("color:change", (color) => {
        selectedColor = color.hexString;
    });

    addNoteButton.addEventListener("click", () => {
        openModal();
    });

    closeModal.addEventListener("click", () => {
        closeModalHandler();
    });

    saveNoteButton.addEventListener("click", () => {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!title || !description) {
            errorMessage.textContent = "Please fill out both the title and description.";
            errorMessage.style.display = "block";
            return;
        }

        errorMessage.style.display = "none";

        const note = { title, description, color: selectedColor };
        if (editingNoteIndex !== null) {
            updateNoteInLocal(note, editingNoteIndex);
        } else {
            saveNoteToLocal(note);
        }

        renderNotes();
        closeModalHandler();
    });

    function renderNotes() {
        stickyContainer.innerHTML = "";
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.forEach((note, index) => addNoteToDOM(note, index));
    }

    function updateCharCount() {
        const titleInput = document.getElementById('note-title');
        const charCount = document.getElementById('char-count');
        const maxLength = titleInput.getAttribute('maxlength');
        
        charCount.textContent = `${titleInput.value.length}/${maxLength} characters`;
    }
    
    // Optionally, you can prevent further input programmatically
    document.getElementById('note-title').addEventListener('input', (e) => {
        const maxLength = e.target.getAttribute('maxlength');
        if (e.target.value.length > maxLength) {
            e.target.value = e.target.value.substring(0, maxLength);
        }
    });
    
    function addNoteToDOM(note, index) {
        const noteElement = document.createElement("div");
        noteElement.classList.add("sticky-note");
        noteElement.style.backgroundColor = note.color;
        noteElement.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.description}</p>
            <div class="note-actions">
                <button class="edit-note" data-index="${index}">✏️</button>
                <button class="delete-note" data-index="${index}">🗑️</button>
            </div>
        `;
        stickyContainer.appendChild(noteElement);

        // Add event listeners for actions
        noteElement.querySelector(".edit-note").addEventListener("click", (e) => {
            editNoteHandler(parseInt(e.target.dataset.index, 10));
        });
        noteElement.querySelector(".delete-note").addEventListener("click", (e) => {
            deleteNoteHandler(parseInt(e.target.dataset.index, 10));
        });
    }

    function saveNoteToLocal(note) {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.push(note);
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    function updateNoteInLocal(note, index) {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes[index] = note;
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    function deleteNoteHandler(index) {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.splice(index, 1);
        localStorage.setItem("notes", JSON.stringify(notes));
        renderNotes();
    }

    function editNoteHandler(index) {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        const note = notes[index];

        titleInput.value = note.title;
        descriptionInput.value = note.description;
        selectedColor = note.color;
        colorWheel.color.hexString = note.color;

        editingNoteIndex = index;
        openModal();
    }

    function openModal() {
        modal.style.display = "flex";
    }

    function closeModalHandler() {
        modal.style.display = "none";
        clearInputs();
    }

    function clearInputs() {
        titleInput.value = "";
        descriptionInput.value = "";
        selectedColor = "#ffffff";
        colorWheel.color.hexString = selectedColor;
        editingNoteIndex = null;
    }

    renderNotes();
});

window.onload = function() {
    Particles.init({selector: '.background'});
};

document.addEventListener("DOMContentLoaded", () => {
    const stickyContainer = document.getElementById("sticky-container");

    function makeNotesSortable() {
        const notes = document.querySelectorAll(".sticky-note");

        notes.forEach((note) => {
            note.setAttribute("draggable", true);

            note.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", e.target.dataset.index);
                e.target.classList.add("dragging");
            });

            note.addEventListener("dragend", (e) => {
                e.target.classList.remove("dragging");
            });
        });

        stickyContainer.addEventListener("dragover", (e) => {
            e.preventDefault();
            const draggingNote = document.querySelector(".dragging");
            const afterElement = getDragAfterElement(stickyContainer, e.clientY);

            if (afterElement == null) {
                stickyContainer.appendChild(draggingNote);
            } else {
                stickyContainer.insertBefore(draggingNote, afterElement);
            }
        });

        stickyContainer.addEventListener("drop", (e) => {
            e.preventDefault();
            const notes = Array.from(stickyContainer.children);
            const newOrder = notes.map((note) => {
                return {
                    title: note.querySelector("h3").textContent,
                    description: note.querySelector("p").textContent,
                    color: note.style.backgroundColor,
                };
            });
            localStorage.setItem("notes", JSON.stringify(newOrder));
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [
            ...container.querySelectorAll(".sticky-note:not(.dragging)"),
        ];

        return draggableElements.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            },
            { offset: Number.NEGATIVE_INFINITY }
        ).element;
    }

    function renderNotes() {
        stickyContainer.innerHTML = "";
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.forEach((note, index) => {
            const noteElement = document.createElement("div");
            noteElement.classList.add("sticky-note");
            noteElement.style.backgroundColor = note.color;
            noteElement.dataset.index = index;
            noteElement.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.description}</p>
                <div class="note-actions">
                    <button class="edit-note" data-index="${index}">✏️</button>
                    <button class="delete-note" data-index="${index}">🗑️</button>
                </div>
            `;
            stickyContainer.appendChild(noteElement);
        });

        makeNotesSortable();
    }

    renderNotes();
});
//