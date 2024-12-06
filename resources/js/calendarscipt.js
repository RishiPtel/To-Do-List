let currentDate = new Date();

document.addEventListener('DOMContentLoaded', () => {
    displayCurrentWeek();

    document.getElementById('prevWeek').addEventListener('click', () => changeWeek(-1));
    document.getElementById('nextWeek').addEventListener('click', () => changeWeek(1));
    document.getElementById('weekSelector').addEventListener('change', (event) => {
        const selectedDate = new Date(event.target.value);
        if (!isNaN(selectedDate)) {
            currentDate = selectedDate;
            displayCurrentWeek();
        }
    });

    updateWeekSelector();
});

function displayCurrentWeek() {
    const calendarRow = document.getElementById('calendarRow');
    const startOfWeek = getStartOfWeek(currentDate);
    const daysInWeek = 7;

    calendarRow.innerHTML = ''; // Clear the row
    let currentDay = new Date(startOfWeek);

    for (let i = 0; i < daysInWeek; i++) {
        const cell = document.createElement('td');
        const dayName = document.createElement('div');
        const dateDiv = document.createElement('div');
        const taskContainer = document.createElement('div');

        dayName.textContent = currentDay.toLocaleDateString('en-US', { weekday: 'long' });
        dateDiv.textContent = currentDay.toLocaleDateString('en-US');
        dateDiv.classList.add('date');

        taskContainer.classList.add('task-container');
        taskContainer.setAttribute('data-date', formatDate(currentDay));

        // Fetch and display tasks for the date
        const tasks = getTasksForDate(formatDate(currentDay));
        tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.textContent = task.title;
            taskDiv.classList.add('task', getPriorityClass(task.priority));
            taskContainer.appendChild(taskDiv);
        });

        cell.appendChild(dayName);
        cell.appendChild(dateDiv);
        cell.appendChild(taskContainer);
        calendarRow.appendChild(cell);

        currentDay.setDate(currentDay.getDate() + 1);
    }

    updateWeekSelector();
}

function changeWeek(direction) {
    currentDate.setDate(currentDate.getDate() + direction * 7);
    displayCurrentWeek();
}

function getStartOfWeek(date) {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    return startOfWeek;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function getTasksForDate(date) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return tasks.filter(task => task.dueDate === date);
}

function getPriorityClass(priority) {
    return {
        'High': 'priority-high',
        'Medium': 'priority-medium',
        'Low': 'priority-low'
    }[priority];
}

function updateWeekSelector() {
    const weekSelector = document.getElementById('weekSelector');
    const startOfWeek = getStartOfWeek(currentDate);
    weekSelector.value = startOfWeek.toISOString().split('T')[0];
}
