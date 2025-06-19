let draggedItemId = "";
let minDate = "";
let actSubtasks = [];
let actAssignedTo = [];
let taskEditAsiggnedTo = [];
let actTaskPrio = "";
let actStatus = "";
let svgMappingsEdit = {
    'urgent': 'assets/img/icons_add_task/urgent.svg',
    'urgent-active': 'assets/img/icons_add_task/urgent-white.svg',
    'medium': 'assets/img/icons_add_task/medium.svg',
    'medium-active': 'assets/img/icons_add_task/medium-white.svg',
    'low': 'assets/img/icons_add_task/low.svg',
    'low-active': 'assets/img/icons_add_task/low-white.svg'
};

const statusLabels = {
    toDo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done',
    awaitingFeedback: 'Awaiting Feedback'
};

/**
 * Opens the Dialog if a card is clicked
 */
function openDialog() {
    document.getElementById('dialogContainer').classList.add('open');
    document.documentElement.classList.add('overflowHidden');
}

/**
 * Opens the task dialog based on the screen size and task status.
 *
 * For mobile screens (width ≤ 1024px), redirects to the 'addTask' page with the status as a URL parameter.
 * For larger screens, opens a modal dialog and prevents page scrolling.
 *
 * @param {string} status - The current status of the task.
 */
function openDialogTasks(status) {
    const isMobile = window.matchMedia("only screen and (max-width: 1024px)").matches;
    actStatus = status;

    if (isMobile) {
        window.location.href = `addTask.html?status=${encodeURIComponent(status)}`;
    } else {
        document.getElementById('dialogContainerAddTask').classList.add('open');
        document.documentElement.classList.add('overflowHidden');
    }
}

/**
 * Closes the dialog if the background is clicked.
 * @param {Event} event - The event object.
 */
function closeDialog(event) {
    if (event.currentTarget === event.target) {
        event.stopPropagation();
        document.getElementById('dialogContainer').classList.remove('open');
        document.documentElement.classList.remove('overflowHidden');
    }
}

/**
 * Closes the dialog when a button is clicked.
 */
function closeDialogTask(event) {
    if (event.currentTarget === event.target) {
        event.stopPropagation();
        document.getElementById('dialogContainerAddTask').classList.remove('open');
        document.documentElement.classList.remove('overflowHidden');
    }
}

/**
 * Closes the dialog when a button is clicked.
 */
function closeDialogBtn() {
    document.getElementById('dialogContainer').classList.remove('open');
    document.documentElement.classList.remove('overflowHidden');
}

/**
 * Closes the dialog when a button is clicked.
 */
function closeDialogTaskBtn() {
    document.getElementById('dialogContainerAddTask').classList.remove('open');
    document.documentElement.classList.remove('overflowHidden');
}

/**
 * Renders a large version of a task card with additional details.
 * @param {number} i - The index of the task.
 */
function renderCardBig(i) {
    tasks.forEach((task, index) => {
        if (task.id == i) {
            renderCardBigHeader(index);
            renderCardBigTop(index);
            renderCardBigAssignedTo(index);
            renderCardBigSubtask(index);
        }
    });
}

/**
 * Renders and styles the header for a task card.
 *
 * Sets the header color to 'Blue' for 'User Story' tasks, otherwise 'Green'.
 * Updates the HTML of 'containerCloseBtn' and adjusts its layout classes.
 *
 * @param {number} i - The index of the task in the tasks array.
 */
function renderCardBigHeader(i) {
    let color = (tasks[i].category === 'User Story') ? 'Blue' : 'Green';
    document.getElementById('containerCloseBtn').innerHTML = renderCardBigHeaderHtml(i, color);
    document.getElementById('containerCloseBtn').classList.remove('flexEnd');
    document.getElementById('containerCloseBtn').classList.add('spaceBetween');
}

/**
 * Renders the assigned members section of a large task card.
 * @param {number} i - The index of the task.
 */
function renderCardBigAssignedTo(i) {
    const assignedToArray = Array.isArray(tasks[i]?.assignedTo) ? tasks[i].assignedTo : [];
    actAssignedTo = [];
    const badgeContainer = document.getElementById('badgeContainer');
    badgeContainer.innerHTML = '';

    assignedToArray.forEach(id => {
        const contact = contacts.find(contact => contact.id === id);
        if (contact) { 
            actAssignedTo.push({
                color: contact.color,
                initials: contact.initials,
                name: contact.name
            });
            badgeContainer.innerHTML += renderCardBigAssignedToHtml(contact);
        }
    });
}

/**
 * Renders the subtasks section of a large task card.
 * @param {number} i - The index of the task.
 */
function renderCardBigSubtask(i) {
    let subtasksHtml = '';
    actSubtasks = [];
    if (tasks[i].subTasks === undefined) {
        tasks[i].subTasks = [];
    }
    tasks[i].subTasks.forEach(subtask => {
        actSubtasks.push({
            id: subtask.id,
            completet: subtask.completet,
            content: subtask.content
        });
        subtasksHtml += renderCardBigSubHtml(subtask, i);
    });
    document.getElementById('subtasks').innerHTML = subtasksHtml;
}

/**
 * Handles the change event for a subtask's checkbox, updating its completion status.
 *
 * Finds the task and subtask by their IDs and updates the subtask's 'completed' status
 * based on the checkbox's state. After updating, it refreshes the task display.
 *
 * @param {number} taskId - The unique identifier of the task.
 * @param {number} subtaskId - The unique identifier of the subtask.
 */
function handleSubtaskChange(taskId, subtaskId, checkboxElement) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const subtask = task.subTasks.find(st => st.id === subtaskId);
        if (subtask) {
            subtask.completet = checkboxElement.checked;
            updateTaskDisplay();
        }
    }
}

/**
 * Shows a task added message by adding a CSS class to the element with the class 'task-added-msg'.
 * After 2 seconds, it redirects to the board.
 *
 * @return {void} 
 */
function showTaskAddedMessage() {
    const messageElement = document.querySelector('.task-added-msg');
    messageElement.classList.add('d-flex-visible');
    setTimeout(() => {
        redirectTo('board.html');
    }, 2000);
}

/**
 * Sets the minimum date for the 'editedDate' input element to today's date and adds
 * a blur event listener for date validation.
 */
function getMinDate() {
    const dateIn = document.getElementById('editedDate');
    const minDate = getFormattedTodayDate();

    dateIn.min = minDate;
    addDateInputValidationListener(dateIn, minDate);
}

/**
 * Returns today's date in 'YYYY-MM-DD' format.
 * 
 * @returns {string} Formatted today's date.
 */
function getFormattedTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Adds a blur event listener to a date input element for date validation.
 * 
 * @param {HTMLInputElement} dateInput - The date input element.
 * @param {string} minDate - The minimum date in 'YYYY-MM-DD' format.
 */
function addDateInputValidationListener(dateInput, minDate) {
    dateInput.addEventListener('blur', function() {
        validateDateInput(this, minDate);
    });
}

/**
 * Validates the date input value against the minimum date and today's date,
 * resetting the input value if invalid.
 * 
 * @param {HTMLInputElement} dateInput - The date input element to validate.
 * @param {string} minDate - The minimum date in 'YYYY-MM-DD' format.
 */
function validateDateInput(dateInput, minDate) {
    const inputValue = dateInput.value.trim();
    const today = new Date();

    if (inputValue.length === 0 || new Date(inputValue) <= today) {
        setDateInputToMin(dateInput, minDate);
    } else {
        resetFieldStyle(dateInput, document.getElementById('edit-task-duo-date-required'));
    }
}

/**
 * Sets the date input value to the minimum date and displays a validation error.
 * 
 * @param {HTMLInputElement} dateInput - The date input element to update.
 * @param {string} minDate - The minimum date in 'YYYY-MM-DD' format.
 */
function setDateInputToMin(dateInput, minDate) {
    dateInput.value = minDate;
    showValidationError(dateInput, document.getElementById('edit-task-duo-date-required'));
}

/**
 * Deletes task from Databse based on the ID
 * @param {number} taskId - Id of the task to be deleted
 * @returns {Promise<void>} - a Promise that resolves when the task is deleted
 */
async function deleteTaskFromDatabase(taskId) {
    try {
        const response = await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Fehler beim Löschen der Aufgabe aus der Datenbank: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        throw new Error(`Fehler beim Löschen der Aufgabe aus der Datenbank: ${error.message}`);
    }
}

/**
 * Renders badges for assigned contacts, limiting the number of badges displayed.
 *
 * @param {number[]} assignedToArray - Array of contact IDs assigned to the task.
 * @param {number} [maxBadges=6] - Maximum number of badges to render.
 * @returns {string} HTML string of rendered badges.
 */
function renderBadges(assignedToArray, maxBadges = 6) {
    let renderedCount = 0;
    let addedContacts = new Set();
    let badgesHtml = assignedToArray.map(id => {
        const contact = contacts.find(c => c.id === id);
        if (contact && !addedContacts.has(id) && renderedCount < maxBadges) {
            addedContacts.add(id);
            renderedCount++;
            return renderBadge(contact);
        }
        return '';
    }).join('');
    const extraBadgesCount = assignedToArray.length - addedContacts.size;
    if (extraBadgesCount > 0) {
        badgesHtml += `<div class="badgeImg" style="background-color: grey">+${extraBadgesCount}</div>`;
    }
    return badgesHtml;
}