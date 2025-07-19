/**
 * Save the task and push it to the database.
 */
async function saveTask() {
    const taskData = gatherTaskData();
    const newTask = createTaskObject(taskData);
    await addData('tasks', newTask);
    showTaskAddedMessage();
}

/**
 * Gathers all task data from the form.
 * @returns {Object} Object containing all task form data
 */
function gatherTaskData() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('due-date-input').value;
    const category = document.getElementById('category-displayed').textContent;
    const priority = getSelectedPriority();
    const assignedTo = selectedContacts.map(item => item.id);
    const newSubtasks = subtasks.map((item) => ({
        content: item,
        completed: false,
    }));

    return { title, description, dueDate, category, priority, assignedTo, newSubtasks };
}

/**
 * Gets the selected priority from priority buttons.
 * @returns {string} Selected priority value
 */
function getSelectedPriority() {
    const priorityBtns = document.querySelectorAll('.prio-btn');
    let priority;
    priorityBtns.forEach(item => {
        if (item.classList.contains('active')) {
            priority = item.id;
        }
    });
    return priority;
}

/**
 * Creates a new task object from task data.
 * @param {Object} taskData - Task form data
 * @returns {Object} New task object
 */
function createTaskObject(taskData) {
    return {
        id: Date.now(),
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        status: 'todo',
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        subTasks: taskData.newSubtasks,
        assignedTo: taskData.assignedTo,
        attachments: attachments
    };
}

/**
 * Clear the task form and reset all fields.
 */
function clearTask() {
    resetFormFields();
    clearArrays();
    resetUIElements();
    clearValidationMessages();
}

/**
 * Resets all form fields to their default state.
 */
function resetFormFields() {
    document.querySelector('form').reset();
    document.querySelectorAll('.checked').forEach(item => {
        item.classList.remove('checked');
    });
}

/**
 * Clears all data arrays.
 */
function clearArrays() {
    selectedContacts.length = 0;
    subtasks.length = 0;
    attachments.length = 0;
}

/**
 * Resets UI elements to their default state.
 */
function resetUIElements() {
    attachmentsList.innerHTML = '';
    deselectContacts();
    renderSubtasks();
    renderContacts();
    selectMediumPriority();
    resetCategory();
}

/**
 * Clears all validation messages.
 */
function clearValidationMessages() {
    clearValidationMessage('title');
    clearValidationMessage('date');
    clearValidationMessage('category');
}

/**
 * Deselect all list items and update the display.
 */
function deselectContacts() {
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
 * Clears validation messages for a specific field.
 * @param {string} fieldType - Type of field ('title', 'date', 'category')
 */
function clearValidationMessage(fieldType) {
    const fieldConfig = getFieldConfig();
    const config = fieldConfig[fieldType];
    if (config) {
        clearFieldError(config, fieldType);
    }
}

/**
 * Gets field configuration object for validation.
 * @returns {Object} Configuration object with field settings
 */
function getFieldConfig() {
    return {
        title: {
            input: document.getElementById('title'),
            message: document.getElementById('title-required'),
            errorClass: 'field-required'
        },
        date: {
            input: document.getElementById('due-date-input'),
            message: document.getElementById('date-required'),
            errorClass: 'field-required'
        },
        category: {
            input: document.getElementById('category-container'),
            message: document.getElementById('category-required'),
            errorClass: 'category-required-border'
        }
    };
}

/**
 * Clears error styling and messages for a field.
 * @param {Object} config - Field configuration object
 * @param {string} fieldType - Type of field
 */
function clearFieldError(config, fieldType) {
    config.input.classList.remove(config.errorClass);
    config.message.style.opacity = '0';
    
    if (fieldType === 'date') {
        config.message.textContent = 'This field is required';
    }
}

/**
 * Adds event listeners to form fields to clear validation messages on focus/click.
 */
function addValidationEventListeners() {
    const titleInput = document.getElementById('title');
    const dueDateInput = document.getElementById('due-date-input');
    const categoryContainer = document.getElementById('category-container');
    const categoryBtn = document.getElementById('category-btn');

    titleInput.addEventListener('focus', () => clearValidationMessage('title'));
    dueDateInput.addEventListener('focus', () => clearValidationMessage('date'));
    categoryContainer.addEventListener('click', () => clearValidationMessage('category'));
    
    if (categoryBtn) {
        categoryBtn.addEventListener('click', () => clearValidationMessage('category'));
    }
}

/**
 * Validates the form fields and shows error messages if necessary.
 * @returns {boolean} True if form is valid, false otherwise
 */
function validateForm() {
    let isValid = true;
    isValid = validateRequiredFields() && isValid;
    isValid = validateDateField() && isValid;
    return isValid;
}

/**
 * Validates required form fields.
 * @returns {boolean} True if all required fields are valid
 */
function validateRequiredFields() {
    const fields = getValidationFields();
    let isValid = true;
    
    fields.forEach(field => {
        if (field.isEmpty()) {
            setFieldError(field);
            isValid = false;
        }
    });
    return isValid;
}

/**
 * Gets array of validation field configurations.
 * @returns {Array} Array of field validation objects
 */
function getValidationFields() {
    return [
        {
            element: document.getElementById('title'),
            message: document.getElementById('title-required'),
            errorClass: 'field-required',
            isEmpty: () => document.getElementById('title').value.trim() === ''
        },
        {
            element: document.getElementById('category-container'),
            message: document.getElementById('category-required'),
            errorClass: 'category-required-border',
            isEmpty: () => document.getElementById('category-displayed').textContent === 'Select task category'
        }
    ];
}

/**
 * Sets error state for a validation field.
 * @param {Object} field - Field configuration object
 */
function setFieldError(field) {
    field.element.classList.add(field.errorClass);
    field.message.style.opacity = '1';
}

/**
 * Validates the date field for required and future date.
 * @returns {boolean} True if date field is valid
 */
function validateDateField() {
    const dueDateInput = document.getElementById('due-date-input');
    const dateMessage = document.getElementById('date-required');
    
    if (dueDateInput.value.trim() === '') {
        setDateError(dueDateInput, dateMessage, 'This field is required');
        return false;
    }
    
    if (!isFutureDate(dueDateInput.value)) {
        setDateError(dueDateInput, dateMessage, 'This field requires a future date.');
        return false;
    }
    
    return true;
}

/**
 * Checks if the given date is in the future.
 * @param {string} dateValue - Date value to check
 * @returns {boolean} True if date is in the future
 */
function isFutureDate(dateValue) {
    const selectedDate = new Date(dateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
}

/**
 * Sets error state for date field.
 * @param {Element} dueDateInput - Date input element
 * @param {Element} dateMessage - Date error message element
 * @param {string} message - Error message text
 */
function setDateError(dueDateInput, dateMessage, message) {
    dueDateInput.classList.add('field-required');
    dateMessage.textContent = message;
    dateMessage.style.opacity = '1';
}

/**
 * Handles the form submit event, prevents default submission and performs validation.
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
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


