/**
 * Save the task and push it to the database.
 */
async function saveTask() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('due-date-input').value;
    const category = document.getElementById('category-displayed').textContent;
    const priorityBtns = document.querySelectorAll('.prio-btn');
    let priority;

    priorityBtns.forEach(item => {
        if (item.classList.contains('active')) {
            priority = item.id;
        }
    });

    const assignedTo = selectedContacts.map(item => item.id);
    const newSubtasks = subtasks.map((item, index) => ({
        id: index,
        content: item,
        completed: false,
    }));

    const newTask = {
        id: Date.now(),
        title: title,
        description: description,
        category: category,
        status: actStatus,
        dueDate: dueDate,
        priority: priority,
        subTasks: newSubtasks,
        assignedTo: assignedTo,
    };



    const tasks = await fetchTasks();


    tasks.push(newTask);


    await updateTasks(tasks);

    showTaskAddedMessage();

}

/**
 * Clear the task form and reset all fields.
 */
function clearTask() {
    document.querySelector('form').reset();
    document.querySelectorAll('.checked').forEach(item => {
        item.classList.remove('checked');
    });
    selectedContacts.length = 0;
    subtasks.length = 0;
    deselectListItems();
    renderSubtasks();
    renderContacts();
    selectMediumPriority();
    resetCategory();
}

/**
 * Deselect all list items and update the display.
 */
function deselectListItems() {
    const listItems = document.querySelectorAll('.list-item.assigned-to');

    listItems.forEach((item, i) => {
        if (item.classList.contains('checked')) {
            const img = item.querySelector('.checkbox');
            item.classList.remove('checked');
            img.classList.remove('checked');
            img.src = './assets/img/icons_add_task/checkbox.svg';

            const contact = filteredContacts[i];
            const index = selectedContacts.indexOf(contact);
            if (index !== -1) {
                selectedContacts.splice(index, 1);
            }
        }
    });
    closeContactList();
    renderSelectedContactsBelow();
}

/**
 * Set the medium priority button as active.
 */
function selectMediumPriority() {
    const buttons = document.querySelectorAll('.prio-btn');
    buttons.forEach(button => {
        const prio = button.id;
        const img = button.querySelector('img');
        if (prio === 'medium') {
            button.classList.add('active');
            img.src = svgMappings['medium-active'];
        } else {
            button.classList.remove('active');
            img.src = svgMappings[prio];
        }
    });
}

/**
 * Reset the category display to the default text.
 */
function resetCategory() {
    const categoryDisplayed = document.getElementById('category-displayed');
    categoryDisplayed.textContent = "Select task category";
}

/**
 * Close the contact list menu.
 */
function closeContactList() {
    document.getElementById('contacts-list').classList.remove('show-menu');
}

/**
 * Close the contact list when clicking outside of it.
 */
function closeContactListOnOutsideClick() {
    document.addEventListener('click', function (event) {
        const selectBtnContainer = document.getElementById('contacts-list');
        const listItemsContainer = document.querySelector('.list-items');

        if (!selectBtnContainer.contains(event.target) && !listItemsContainer.contains(event.target)) {
            closeContactList();
        }
    });
}

/**
 * Prevent form submission when pressing Enter key.
 */
function preventFormSubmitOnEnter() {
    const form = document.querySelector('form');
    form.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
}

/**
 * Resets the validation messages for the form fields.
 *
 * @param {boolean} titleClicked - Indicates if the title input was clicked.
 * @param {boolean} dueDateClicked - Indicates if the due date input was clicked.
 * @param {boolean} categoryClicked - Indicates if the category container was clicked.
 */
function resetValidationMessages(titleClicked, dueDateClicked, categoryClicked) {
    const titleInput = document.getElementById('title');
    const dueDateInput = document.getElementById('due-date-input');
    const categoryContainer = document.getElementById('category-container');
    const titleRequiredMsg = document.getElementById('title-required');
    const dateRequiredMsg = document.getElementById('date-required');
    const categoryRequiredMsg = document.getElementById('category-required');

    if (titleClicked) {
        titleInput.classList.remove('field-required');
        titleRequiredMsg.style.opacity = '0';
    }
    if (dueDateClicked) {
        dueDateInput.classList.remove('field-required');
        dateRequiredMsg.style.opacity = '0';
    }
    if (categoryClicked) {
        categoryContainer.classList.remove('category-required-border');
        categoryRequiredMsg.style.opacity = '0';
    }


}

/**
 * Adds event listeners to the form fields to handle validation messages.
 */
function addValidationEventListeners() {
    let titleClicked = false;
    let dueDateClicked = false;
    let categoryClicked = false;

    const titleInput = document.getElementById('title');
    const dueDateInput = document.getElementById('due-date-input');
    const categoryContainer = document.getElementById('category-container');

    titleInput.addEventListener('click', () => {
        titleClicked = true;
        resetValidationMessages(titleClicked, dueDateClicked, categoryClicked);
    });

    dueDateInput.addEventListener('click', () => {
        dueDateClicked = true;
        resetValidationMessages(titleClicked, dueDateClicked, categoryClicked);
    });

    categoryContainer.addEventListener('click', () => {
        categoryClicked = true;
        resetValidationMessages(titleClicked, dueDateClicked, categoryClicked);
    });
}

/**
 * Validates the form fields and shows error messages if necessary.
 *
 * @returns {boolean} - Returns true if the form is valid, otherwise false.
 */
function validateForm() {
    const titleInput = document.getElementById('title');
    const dueDateInput = document.getElementById('due-date-input');
    const categoryDisplayed = document.getElementById('category-displayed');
    const titleRequiredMsg = document.getElementById('title-required');
    const dateRequiredMsg = document.getElementById('date-required');
    const categoryRequiredMsg = document.getElementById('category-required');
    const categoryContainer = document.getElementById('category-container');

    let isValid = true;
    if (titleInput.value.trim() === '') {
        titleInput.classList.add('field-required');
        titleRequiredMsg.style.opacity = '1';
        isValid = false;
    }
    if (dueDateInput.value.trim() === '') {
        dueDateInput.classList.add('field-required');
        dateRequiredMsg.style.opacity = '1';
        isValid = false;
    }
    if (categoryDisplayed.textContent === 'Select task category') {
        categoryContainer.classList.add('category-required-border');
        categoryRequiredMsg.style.opacity = '1';
        isValid = false;
    }

    return isValid;
}

/**
 * Handles the form submit event, prevents default submission and performs validation.
 *
 * @param {Event} event - The submit event object.
 */
function handleFormSubmit(event) {
    event.preventDefault();

    let titleClicked = true;
    let dueDateClicked = true;
    let categoryClicked = true;
    resetValidationMessages(titleClicked, dueDateClicked, categoryClicked);

    if (validateForm()) {
        saveTask();
    }
}

/**
 * Prevents default form submission and validates the form fields.
 */
function preventDefaultValidation() {
    const form = document.getElementById('add-task-form');
    addValidationEventListeners();
    form.addEventListener('submit', handleFormSubmit);
}

/**
 * Send the new task data to the Firebase database.
 */
async function updateTasks(newTasksArray) {
    await fetch(`${BASE_URL}/tasks.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTasksArray)
    });
}

/**
 * Fetches tasks from the Firebase database.
 *
 * @return {Promise<Array>} A promise that resolves to an array of tasks. If no data is found, an empty array is returned.
 */
async function fetchTasks() {
    const response = await fetch(`${BASE_URL}/tasks.json`);
    const data = await response.json();
    return data || [];
}

