document.addEventListener("DOMContentLoaded", () => {
    const weekPicker = document.getElementById("week-picker");
    const tableHeader = document.getElementById("table-header");
    const tableBody = document.getElementById("table-body");

    let tasks = [];

    function fetchTasks() {
        const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks = storedTasks.map(task => ({
            ...task,
            color: getPriorityColor(task.priority)
        }));
    }

    function getPriorityColor(priority) {
        const priorityColors = {
            High: "red",
            Medium: "orange",
            Low: "green"
        };
        return priorityColors[priority] || "gray"; // Default to gray if no priority is set
    }

    function getWeekDates(isoDate) {
        const [year, week] = isoDate.split("-W");
        const firstDayOfYear = new Date(year, 0, 1);
        const daysOffset = (week - 1) * 7;
        const weekStart = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset));
        const dayOffset = weekStart.getDay() === 0 ? -6 : 1 - weekStart.getDay(); // Adjust for ISO week (Monday as first day)
        const adjustedWeekStart = new Date(weekStart.setDate(weekStart.getDate() + dayOffset));

        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(adjustedWeekStart);
            day.setDate(adjustedWeekStart.getDate() + i);
            return day;
        });
    }

    function populateTable(weekDates) {
        // Clear previous data
        tableHeader.innerHTML = "";
        tableBody.innerHTML = "";

        // Populate headers with day names and dates
        weekDates.forEach(date => {
            const th = document.createElement("th");
            th.innerHTML = `
                <div>${date.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                <div>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            `;
            tableHeader.appendChild(th);
        });

        // Populate tasks for each day
        const tr = document.createElement("tr");
        weekDates.forEach(date => {
            const td = document.createElement("td");
            const tasksForDay = tasks.filter(task => task.dueDate === date.toISOString().split("T")[0]);
            tasksForDay.sort((a, b) => {
                const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            tasksForDay.forEach(task => {
                const taskDiv = document.createElement("div");
                taskDiv.className = "task";
                taskDiv.style.backgroundColor = task.color;
                taskDiv.textContent = task.title;
                td.appendChild(taskDiv);
            });
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    }

    function getCurrentISOWeek() {
        const now = new Date();
        const firstJan = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - firstJan) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + firstJan.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
    }

    // Event listener for week change
    weekPicker.addEventListener("change", () => {
        const selectedWeek = weekPicker.value;
        if (!selectedWeek) {
            alert("Please select a valid week.");
            return;
        }
        const weekDates = getWeekDates(selectedWeek);
        populateTable(weekDates);
    });

    // Initial load
    fetchTasks();
    const currentWeek = getCurrentISOWeek();
    weekPicker.value = currentWeek;
    const weekDates = getWeekDates(currentWeek);
    populateTable(weekDates);
});
