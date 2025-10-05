/**
 * Opens the task form dialog for a given type.
 * @param {string} type - The type of dialog to open. Can be either 'edit-task' or 'add-task-dialog'.
 * @param {object} [options] - Optional options for the dialog.
 */
function openTaskFormDialog(type, options = {}) {
    const dialog = document.getElementById('task-form-dialog');
    const closeButton = dialog.querySelector('.close-task-form-dialog-btn');
    const formBottom = dialog.querySelector('.form-bottom');
    resetTaskFormDialogClasses(dialog, closeButton, formBottom);
    switch (type) {
        case 'edit-task':
            openEditTaskDialog(dialog, closeButton, formBottom, options);
            break;
        case 'add-task-dialog':
            openAddTaskDialog(dialog, options);
            break;
    }
}


/**
 * Resets the CSS classes of the task form dialog and its children back to their default state.
 * @param {HTMLElement} dialog - The task form dialog element.
 * @param {HTMLElement} closeButton - The close button of the task form dialog.
 * @param {HTMLElement} formBottom - The bottom element of the task form dialog.
 */
function resetTaskFormDialogClasses(dialog, closeButton, formBottom) {
    dialog.classList.remove('task-form-dialog-edit');
    closeButton.classList.remove('close-task-form-dialog-btn-edit');
    formBottom.classList.remove('form-bottom-edit');
}


/**
 * Opens the task form dialog for editing a task.
 * @param {HTMLElement} dialog - The task form dialog element.
 * @param {HTMLElement} closeButton - The close button of the task form dialog.
 * @param {HTMLElement} formBottom - The bottom element of the task form dialog.
 * @param {object} [options] - Optional options for the dialog.
 */
function openEditTaskDialog(dialog, closeButton, formBottom, options) {
    addEditTaskClasses(dialog, closeButton, formBottom);
    initTaskForm('edit-task', options);
    populateTaskFormIfNeeded(options, 'edit-task');
    openTaskDialog(dialog, false);
    animateEditTaskDialogOnMobile(dialog);
    setupTaskFormDialogClosingListeners(dialog);
    document.getElementById('detailed-task-dialog').close();
}


/**
 * Adds the CSS classes 'task-form-dialog-edit', 'close-task-form-dialog-btn-edit', and 'form-bottom-edit' to the task form dialog, close button, and form bottom elements, respectively.
 * @param {HTMLElement} dialog - The task form dialog element.
 * @param {HTMLElement} closeButton - The close button of the task form dialog.
 * @param {HTMLElement} formBottom - The bottom element of the task form dialog.
 */
function addEditTaskClasses(dialog, closeButton, formBottom) {
    dialog.classList.add('task-form-dialog-edit');
    closeButton.classList.add('close-task-form-dialog-btn-edit');
    formBottom.classList.add('form-bottom-edit');
}


/**
 * Populates the task form with data from an existing task if the task ID is provided in the options.
 * @param {Object} options - The options object containing the task ID.
 * @param {string} type - The type of task form to populate.
 */
function populateTaskFormIfNeeded(options, type) {
    if (options.taskId) {
        const task = tasks.find(t => t.id === options.taskId);
        if (task) setTimeout(() => {
            populateTaskForm(task, type);
            disableSubmitButtonOnEmptyForm();
        }, 0);
    }
}



/**
 * Adds the CSS class 'animate-dialog' to the task form dialog element after a 10ms delay if the window width is less than 1024px.
 * This is used to animate the opening of the task form dialog on mobile devices.
 * @param {HTMLElement} dialog - The task form dialog element.
 */
function animateEditTaskDialogOnMobile(dialog) {
    if (window.innerWidth < 1024) {
        setTimeout(() => dialog.classList.add('animate-dialog'), 10);
    }
}


/**
 * Opens the task form dialog for adding a task.
 * If the window width is less than 1024px, it will redirect to the 'add-task.html' page.
 * @param {HTMLElement} dialog - The task form dialog element.
 * @param {object} [options] - Optional options for the dialog.
 */
function openAddTaskDialog(dialog, options) {
    if (window.innerWidth < 1024) {
        redirectTo('add-task.html');
        return;
    }
    initTaskForm('add-task-dialog', options);
    openTaskDialog(dialog, true);
    setupTaskFormDialogClosingListeners(dialog);
}


/**
 * Populates the task form with data from an existing task.
 * @param {Object} task - The task object containing all task data
 */
function populateTaskForm(task) {
    if (!task) return;
    populateBasicFields(task);
    populatePriority(task.priority);
    populateCategory(task.category);
    populateSubtasks(task.subtasks);
    populateAttachments(task.attachments);
    populateAssignedContacts(task.assignedTo);
    renderSubtasks();
    renderAttachments();
    renderSelectedContactsBelow();
}


/**
 * Populates the basic form fields (title, description, due date).
 * @param {Object} task - The task object
 */
function populateBasicFields(task) {
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const dueDateInput = document.getElementById('due-date-input');
    if (titleInput) titleInput.value = task.title || '';
    if (descriptionInput) descriptionInput.value = task.description || '';
    if (dueDateInput) {
        dueDateInput.value = task.dueDate || '';
        dueDateInput.classList.remove('color-grey');
    }
}


/**
 * Populates the priority buttons and ensures events still work.
 * @param {string} priority - The priority value ('urgent', 'medium', 'low')
 */
function populatePriority(priority) {
    if (!priority) return;
    resetPriorityButtons();
    setPriorityButtonActive(priority);
}


/**
 * Resets all priority buttons to non-active state.
 */
function resetPriorityButtons() {
    const priorityButtons = document.querySelectorAll('.prio-btn');
    priorityButtons.forEach(button => {
        const buttonId = button.id;
        const img = button.querySelector('img');
        button.classList.remove('active');
        img.src = `../assets/images/global/${buttonId}.svg`;
    });
}


/**
 * Sets the specified priority button as active.
 * @param {string} priority - The priority to activate
 */
function setPriorityButtonActive(priority) {
    const button = document.getElementById(priority);
    if (!button) return;
    button.classList.add('active');
    const img = button.querySelector('img');
    if (img) {
        img.src = `../assets/images/global/${priority}-white.svg`;
    }
}


/**
 * Populates the category dropdown and ensures it still works.
 * @param {string} category - The category value
 */
function populateCategory(category) {
    if (!category) return;
    const categoryDisplay = document.getElementById('category-displayed');
    const categoryContainer = document.getElementById('category-container');
    if (categoryDisplay) {
        categoryDisplay.textContent = category;
        categoryDisplay.dataset.selected = category;
        categoryContainer.classList.remove('show-menu');
        clearValidationMessage('category');
    }
}


/**
 * Populates the subtasks list from the given task subtasks.
 * @param {Object|Array} taskSubtasks - The task subtasks to populate the list with.
 * If an array, expects each item to be an object with 'content' and 'completed' properties.
 * If an object, expects it to have properties that can be iterated over with Object.values(), with each value being an object with 'content' and 'completed' properties.
 * If the taskSubtasks is empty or null, does nothing.
 */
function populateSubtasks(taskSubtasks) {
    subtasks = [];
    if (!taskSubtasks) return;
    const subtasksArray = Array.isArray(taskSubtasks)
        ? taskSubtasks
        : Object.values(taskSubtasks);

    subtasksArray.forEach(subtask => {
        if (subtask && subtask.content) {
            subtasks.push({
                id: subtask.id || createUniqueId(),
                content: subtask.content,
                completed: subtask.completed || false
            });
        }
    });
}


/**
 * Populates the attachments array from task data.
 * @param {Object} taskAttachments - The attachments object from the task
 */
function populateAttachments(taskAttachments) {
    attachments = [];
    if (!taskAttachments) return;
    const attachmentsArray = Array.isArray(taskAttachments)
        ? taskAttachments
        : Object.values(taskAttachments);
    attachmentsArray.forEach(attachment => {
        if (attachment && attachment.base64) {
            attachments.push(attachment);
        }
    });
}


/**
 * Populates the selected contacts array from assigned contacts IDs.
 * @param {Array} assignedContactIds - Array of contact IDs
 */
function populateAssignedContacts(assignedContactIds) {
    selectedContacts.length = 0;
    if (!assignedContactIds || !assignedContactIds.length) return;
    assignedContactIds.forEach(contactId => {
        const contact = findContactById(contactId);
        if (contact) {
            selectedContacts.push(contact);
        }
    });
    updateContactsListUI();
}


/**
 * Updates the UI to show selected contacts in the contacts list.
 */
function updateContactsListUI() {
    const listItems = document.querySelectorAll('.list-item.assigned-to');
    listItems.forEach(item => {
        const contactId = item.getAttribute('data-id');
        const isSelected = selectedContacts.some(contact => contact.id === contactId);

        if (isSelected) {
            const checkbox = item.querySelector('.checkbox');
            item.classList.add('checked');
            checkbox.classList.add('checked');
            checkbox.src = '../assets/images/pages/add-task/checkbox-checked.svg';
        }
    });
}

