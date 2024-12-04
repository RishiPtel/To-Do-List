const addTaskLink = document.querySelector('.add-task');
const modal = document.getElementById('taskModal');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const deleteTaskBtn = document.getElementById('deleteTaskBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const taskTableBody = document.getElementById('taskTableBody');

// Track the currently edited task index
let currentTaskIndex = null;

// Track sort order for each column
let sortOrder = { dueDate: 'asc', priority: 'asc' };

// Load tasks from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    document.getElementById('sortByDueDate').addEventListener('click', () => {
        sortTable('dueDate');
    });
    document.getElementById('sortByPriority').addEventListener('click', () => {
        sortTable('priority');
    });
});

// Open modal when Add Task is clicked
addTaskLink.addEventListener('click', () => {
    modal.classList.add('open');
    currentTaskIndex = null; // Reset index for a new task
    clearModalFields();
});

// Close modal and clear fields
closeModalBtn.addEventListener('click', closeModal);
deleteTaskBtn.addEventListener('click', closeModal);

function closeModal() {
    modal.classList.remove('open');
    clearModalFields();
}

// Save or edit task
saveTaskBtn.addEventListener('click', () => {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;

    if (title && dueDate) {
        if (currentTaskIndex === null) {
            // Add new task
            const task = { title, description, priority, dueDate };
            saveToLocalStorage(task);
        } else {
            // Edit existing task
            updateTaskInLocalStorage(currentTaskIndex, { title, description, priority, dueDate });
        }
        closeModal();
        reloadTaskTable();
    } else {
        alert('Please fill in both the title and due date.');
    }
});

// Save task to local storage
function saveToLocalStorage(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update an existing task in local storage
function updateTaskInLocalStorage(index, updatedTask) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (index >= 0 && index < tasks.length) {
        tasks[index] = updatedTask;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

// Load tasks from local storage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach((task, index) => addTaskToTable(task, index));
}

// Add task to the table with a delete button
function addTaskToTable(task, index) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${task.title}</td>
        <td>${task.priority}</td>
        <td>${task.dueDate}</td>
    `;
    newRow.addEventListener('click', () => openTaskSidebar(task, index));
    taskTableBody.appendChild(newRow);
}

// Open the sidebar and populate with task details
function openTaskSidebar(task, index) {
    currentTaskIndex = index;

    // Populate the modal with task details
    modal.classList.add('open');
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDueDate').value = task.dueDate;

    // Update the Delete button functionality
    deleteTaskBtn.onclick = () => {
        deleteTask(index);
    };
}

function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (index >= 0 && index < tasks.length) {
        tasks.splice(index, 1); // Remove task from array
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Save updated tasks
        closeModal(); // Close the sidebar
        reloadTaskTable(); // Refresh the table
    }
}

// Reload the task table
function reloadTaskTable() {
    taskTableBody.innerHTML = ''; // Clear the table
    loadTasks(); // Reload from local storage
}

// Clear input fields in the modal
function clearModalFields() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskPriority').value = 'Low';
    document.getElementById('taskDueDate').value = '';
}

function sortTable(criteria) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Determine sorting order
    const order = sortOrder[criteria] === 'asc' ? 1 : -1;

    // Sort tasks
    tasks.sort((a, b) => {
        if (criteria === 'dueDate') {
            return order * (new Date(a.dueDate) - new Date(b.dueDate));
        } else if (criteria === 'priority') {
            const priorityOrder = { 'Low': 1, 'Medium': 2, 'High': 3 };
            return order * (priorityOrder[a.priority] - priorityOrder[b.priority]);
        }
    });

    // Toggle the sorting order for the next click
    sortOrder[criteria] = sortOrder[criteria] === 'asc' ? 'desc' : 'asc';

    // Save sorted tasks back to local storage
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Reload the table
    reloadTaskTable();
}
