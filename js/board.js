
/**
 * Initializes the board page by including HTML content, checking for a logged-in user, displaying the profile icon initials, highlighting the board link, retrieving tasks, retrieving contacts, closing the contact list edit on outside click, filtering contacts in tasks, and initializing the add task board.
 *
 * @return {Promise<void>} A promise that resolves when all the initialization steps are completed.
 */
async function initBoard() {
    await includeHTML();
    checkForCurrentUser() ? "" : redirectTo('login.html');
    displayProfileIconInitials();
    highlightLink('board');
    await getContacts();
    await getTasks();
    filterContactsInTasks(contacts, tasks);
    closeContactListEditOnOutsideClick();
    renderCards();
    initAddTaskBoard();

}

/**
 * Filter contacts assigned to tasks based on the provided contacts list.
 *
 * @param {Array} contacts - The list of contacts available.
 * @param {Array} tasks - The list of tasks to filter contacts for.
 */
function filterContactsInTasks(contacts, tasks) {
    tasks.forEach(task => {
        if (Array.isArray(task.assignedTo)) {
            task.assignedTo = task.assignedTo.filter(contactId => contacts.some(contact => contact.id === contactId));
            
        } else {
            task.assignedTo = [];
        }
    });
}
/**
 * Initializes the addition of tasks to the board. It highlights the board, renders cards,
 * updates the header profile initials, and sets up various UI interactions such as menus,
 * buttons, and form behaviors.
 */
function initAddTaskBoard() {
    pushSubtaskEdit();
    showMenu();
    changePrioBtn();
    changeSvgOnHover();
    categoryMenu();
    styleSubtaskInput();
    pushSubtask();
    closeContactListOnOutsideClick();
    categoryMenu();
    preventFormSubmitOnEnter();
    preventDefaultValidation();
}

/**
 * Retrieves the input value from the search bar and triggers the searchTasks function.
 */
function getSearchKeyword() {
    const input = document.getElementById('searchBar').value.trim();
    searchTasks(input);
}

/**
 * Filters the tasks based on the keyword in their title or description and renders the filtered tasks.
 * @param {string} keyword - The input from the search bar.
 */
function searchTasks(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(lowerKeyword) ||
        task.description.toLowerCase().includes(lowerKeyword)
    );
    renderCards(filteredTasks);
}

/**
 * Renders the task cards filtered by the keyword from the searchTasks function.
 * @param {Array|null} filteredTasks - The array of tasks filtered by the search keyword. Defaults to null if no filtering is applied.
 */
function renderCards(filteredTasks = null) {
    const statuses = ["toDo", "inProgress", "awaitingFeedback", "done"];

    statuses.forEach(status => {
        const container = document.getElementById(`cardContainer${status}`);
        container.innerHTML = '';
        const tasksToRender = filteredTasks ? filteredTasks.filter(task => task.status === status) : tasks.filter(task => task.status === status);
        tasksToRender.forEach(task => {
            container.innerHTML += renderCardHtml(task);
            changeProgressBar(task.id);
        });
    });
    checkContainerTodo();
}

/**
 * Checks if the 'To Do' container is empty and toggles the visibility of the empty task message accordingly. 
 * Additionally, calls the 'checkContainerInProgress' function 
 */
function checkContainerTodo() {
    const container = document.getElementById('cardContainertoDo');
    document.getElementById('emptyTaskTodo').classList.toggle('hidden', container.innerHTML.trim() !== '');
    checkContainerInProgress();
}

/**
 * Checks if the 'In Progress' container is empty and toggles the visibility of the empty task message accordingly. 
 * Additionally, calls the 'checkContainerAwaitFeedback' function 
 */
function checkContainerInProgress() {
    const container = document.getElementById('cardContainerinProgress');
    document.getElementById('emptyTaskInProgress').classList.toggle('hidden', container.innerHTML.trim() !== '');
    checkContainerAwaitFeedback();
}

/**
 * Checks if the 'Awaiting Feedback' container is empty and toggles the visibility of the empty task message accordingly. 
 * Additionally, calls the 'checkContainerDone' function 
 */
function checkContainerAwaitFeedback() {
    const container = document.getElementById('cardContainerawaitingFeedback');
    document.getElementById('emptyTaskAwait').classList.toggle('hidden', container.innerHTML.trim() !== '');
    checkContainerDone();
}

/**
 * Checks if the 'Done' container is empty and toggles the visibility of the empty task message accordingly.
 */
function checkContainerDone() {
    const container = document.getElementById('cardContainerdone');
    document.getElementById('emptyTaskDone').classList.toggle('hidden', container.innerHTML.trim() !== '');
}

/**
 * Renders the task card HTML based on the task object.
 */
function updateTaskDisplay() {
    renderCards();
}

/**
 * Updates the properties of a task object at the specified index in the global 'tasks' array.
 *
 * @param {number} i - The index of the task in the 'tasks' array to update.
 */
function saveEdit(i) {
    tasks[i].assignedTo = taskEditAsiggnedTo;
    tasks[i].title = document.getElementById('editedTitle').value;
    tasks[i].description = document.getElementById('editedDescription').value;
    tasks[i].dueDate = document.getElementById('editedDate').value;
    tasks[i].subTasks = actSubtasks;
    tasks[i].priority = actTaskPrio;
    actSubtasks = [];
    closeDialogBtn();
    renderCards();
    putDataEdit(`/tasks`, tasks)
}

/**
 * Sends a PUT request to update data at the specified path on the server.
 *
 * @param {string} path - The path to send the PUT request to.
 * @param {object} data - The data object to be sent in the PUT request body.
 * @returns {Promise<object>} A promise that resolves to the parsed JSON response from the server.
 */
async function putDataEdit(path = "", data = {}) {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        const responseToJson = await response.json();
        return responseToJson;
    } catch (error) {

        throw error;
    }
}

/**
 * deletes a task from the `tasks` array and the database.
 * @param {number} i - Index of the task to be deleted
 */
async function deleteTask(i) {
    const taskId = tasks[i].id;
    tasks.splice(i, 1);
    await deleteTaskFromDatabase(taskId);
    closeDialogBtn();
    renderCards();
}

/**
 * Initiates the dragging operation for a task card.
 * @param {number} id - The ID of the task card being dragged.
 */
function startDragging(id) {
    draggedItemId = id;
    const card = document.getElementById(`taskCard${id}`);
    card.classList.add('dragging');
    highlightDropZones();
}

/**
 * Allows dropping elements into the specified drop target.
 * @param {Event} ev - The drag event.
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Handles the dropping of a task into a specified status.
 * @param {string} status - The status where the task is dropped.
 */
async function drop(status) {
    const taskIndex = tasks.findIndex(task => task.id === draggedItemId);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = status;
        removeHighlight();
        renderCards();
    }
    await putDataEdit(`/tasks`, tasks)
}

/**
 * Highlights the drop zones where a task can be dropped.
 */
function highlightDropZones() {
    const containers = document.querySelectorAll('.cardContainer');
    containers.forEach(container => {
        if (container.id !== `cardContainer${tasks.find(task => task.id === draggedItemId).status}`) {
            container.classList.add('highlightDragArea');
        }
    });
}

/**
 * Removes the highlight from all drop zones.
 */
function removeHighlight() {
    const card = document.getElementById(`taskCard${draggedItemId}`);
    if (card) {
        card.classList.remove('dragging');
    }
    const containers = document.querySelectorAll('.cardContainer');
    containers.forEach(container => {
        container.classList.remove('highlightDragArea');
    });
}

/**
 * Event listener for the drag end event
 */
document.addEventListener('dragend', function (event) {
    const card = document.getElementById(`taskCard${draggedItemId}`);
    if (card) {
        card.classList.remove('dragging');
    }
    removeHighlight();
});

/**
 * Updates the progress bar width based on completed and total subtasks.
 * @param {number} id - The ID of the task.
 */
async function changeProgressBar(i) {
    tasks.forEach(async (task, index) => {
        if (task.id == i && task.subTasks) {
            changeProgressCheckEmpty(task, i);
            try {
                await putData(`/tasks`, tasks);
            } catch (error) {
            }
        }
    });
}

/**
 * Updates the progress bar width based on completed subtasks for a given task.
 *
 * @param {object} task - The task object containing subtasks information.
 * @param {number} i - The index of the task in a list or array.
 */
function changeProgressCheckEmpty(task, i) {
    const completedSubtasks = task.subTasks.filter(subtask => subtask.completet).length;
    const totalSubtasks = task.subTasks.length;
    let percent = 0;
    if (totalSubtasks !== 0) {
        percent = (completedSubtasks / totalSubtasks) * 100;
    }
    const progressBarElement = document.getElementById(`progressBar${i}`);
    if (progressBarElement) {
        progressBarElement.style.width = percent + '%';
    }
}

/**
 * Validates and saves edits for a task based on user input.
 *
 * @param {number} i - The index of the task to be edited in the global 'tasks' array.
 */
function saveEditValidation(i) {
    const editedTitle = document.getElementById('editedTitle');
    const editedDate = document.getElementById('editedDate');
    const titleRequired = document.getElementById('edit-task-title-required');
    const dateRequired = document.getElementById('edit-task-duo-date-required');

    validateField(editedTitle, titleRequired);
    validateField(editedDate, dateRequired);

    if (isFieldFilled(editedTitle) && isFieldFilled(editedDate)) {
        saveEdit(i);
    }
}

/**
 * Validates an input field and displays an error message if it is empty.
 *
 * @param {HTMLInputElement} inputElement - The input element to validate.
 * @param {HTMLElement} requiredElement - The element displaying the required field message.
 */
function validateField(inputElement, requiredElement) {
    if (inputElement.value.trim() === '') {
        showValidationError(inputElement, requiredElement);
        addInputListener(inputElement, requiredElement);
    } else {
        resetFieldStyle(inputElement, requiredElement);
    }
}

/**
 * Checks if an input field is filled (not empty after trimming whitespace).
 *
 * @param {HTMLInputElement} inputElement - The input element to check.
 * @returns {boolean} Returns true if the input field is filled; otherwise, false.
 */
function isFieldFilled(inputElement) {
    return inputElement.value.trim() !== '';
}

/**
 * Displays validation error styles for an input field and shows a required element.
 *
 * @param {HTMLInputElement} inputElement - The input element to display error styles for.
 * @param {HTMLElement} requiredElement - The element displaying the required field message.
 */
function showValidationError(inputElement, requiredElement) {
    inputElement.style.border = '1px solid red';
    requiredElement.style.opacity = 1;
}

/**
 * Resets styles for an input field and hides a required element.
 *
 * @param {HTMLInputElement} inputElement - The input element to reset styles for.
 * @param {HTMLElement} requiredElement - The element displaying the required field message.
 */
function resetFieldStyle(inputElement, requiredElement) {
    inputElement.style.border = '1px solid grey';
    requiredElement.style.opacity = 0;
}

/**
 * Adds an input event listener to validate the input field and reset styles upon filling.
 *
 * @param {HTMLInputElement} inputElement - The input element to add the listener to.
 * @param {HTMLElement} requiredElement - The element displaying the required field message.
 */
function addInputListener(inputElement, requiredElement) {
    inputElement.addEventListener('input', function listener() {
        if (isFieldFilled(inputElement)) {
            resetFieldStyle(inputElement, requiredElement);
            inputElement.removeEventListener('input', listener);
        }
    });
}

/**
 * Toggles the visibility of a dropdown content by adding or removing the 'showDropdown' class.
 *
 * @param {string} dropdownId - The ID of the dropdown content element to toggle.
 */
function toggleDropdown(dropdownId) {
    const dropdownContent = document.getElementById(dropdownId);
    dropdownContent.classList.toggle('showDropdown');
    if (dropdownContent.classList.contains('showDropdown')) {
        closeDropdownOnOutsideClick(dropdownContent);
    }
}

/**
 * Closes the dropdown when clicking outside of it.
 *
 * Adds an event listener to the document to close the dropdown if a click occurs outside
 * its boundaries. The listener is added with a slight delay to avoid immediate closure.
 *
 * @param {HTMLElement} dropdownContent - The dropdown element to be managed.
 */
function closeDropdownOnOutsideClick(dropdownContent) {
    function outsideClickListener(event) {
        if (!dropdownContent.contains(event.target)) {
            dropdownContent.classList.remove('showDropdown');
            document.removeEventListener('click', outsideClickListener);
        }
    }
    setTimeout(() => {
        document.addEventListener('click', outsideClickListener);
    }, 0);
}

/**
 * Moves a task to a new status and updates it in the database.
 *
 * @param {number} taskId - The ID of the task to move.
 * @param {string} newStatus - The new status to assign to the task.
 * @param {string} dropdownId - The ID of the dropdown associated with the task.
 */
async function moveToStatus(taskId, newStatus, dropdownId) {
    try {
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex === -1) {
            return;
        }
        tasks[taskIndex].status = newStatus;
        await putDataEdit(`/tasks`, tasks);
        toggleDropdown(dropdownId);
        renderCards();
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Datenbank oder beim Rendern der Karten:', error);
    }
}

/**
 * Renders dropdown options for moving a task to different statuses.
 *
 * @param {number} taskId - The ID of the task for which dropdown options are rendered.
 * @param {string} currentStatus - The current status of the task.
 * @returns {string} Returns HTML string of dropdown options.
 */
function renderDropdownOptions(taskId, currentStatus) {
    const allStatuses = ['toDo', 'inProgress', 'done', 'awaitingFeedback'];
    const availableStatuses = allStatuses.filter(status => status !== currentStatus);
    const dropdownId = `dropdown-content-${taskId}`;

    return availableStatuses.map(status => `
        <p onclick="moveToStatus(${taskId}, '${status}', '${dropdownId}')">${statusLabels[status]}</p>
    `).join('');
}


/**
 * Capitalizes the first letter of a given string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The string with the first letter in uppercase.
 */
function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}