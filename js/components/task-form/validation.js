/**
 * Form validation and utility functions for Add Task
 * Handles form validation, date settings, and UI utilities
 */

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
 * Checks if the given date is today or in the future (ignores time).
 * @param {string} dateValue - Date value to check
 * @returns {boolean} True if date is today or in the future
 */
function isFutureDate(dateValue) {
    const selectedDate = new Date(dateValue);
    const now = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return selectedDate.getTime() >= now.getTime();
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
 * Handles the form submit event with dynamic submission behavior.
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    
    const form = event.target;
    const formType = form.dataset.formType || 'add-task';
    
    submitFormByType(formType, form);
}

/**
 * Routes form submission to the appropriate handler function.
 * @param {string} formType - Type of form being submitted
 * @param {HTMLFormElement} form - The form element
 */
function submitFormByType(formType, form) {
    switch (formType) {
        case 'edit-task':
            const taskId = form.dataset.taskId;
            if (taskId) updateTaskData(taskId);
            break;
        default:
            addTask(formType);
            break;
    }
}

/**
 * Prevents default form submission and validates the form fields.
 */
function preventDefaultValidation() {
    const form = document.getElementById('task-form');
    addValidationEventListeners();
    form.addEventListener('submit', handleFormSubmit);
}


/**
 * Sets minimum date to today for date picker.
 */
function setMinDateToToday() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayString = `${yyyy}-${mm}-${dd}`;
    const dateInput = document.getElementById('due-date-input');
    dateInput.setAttribute('min', todayString);
    addDateInputListeners(dateInput);
}

/**
 * Adds focus and blur event listeners to date input for styling.
 * @param {Element} dateInput - Date input element
 */
function addDateInputListeners(dateInput) {
    dateInput.addEventListener('focus', () => {
        dateInput.classList.remove('color-grey');
    });
    dateInput.addEventListener('blur', () => {
        if (!dateInput.value) {
            dateInput.classList.add('color-grey');
        }
    });
}

/**
 * Clear the task form and reset all fields.
 */
function clearTask() {
    resetFormFields();
    clearArrays();
    resetUIElements();
    clearValidationMessages();
    document.getElementById('due-date-input').classList.add('color-grey');
}

/**
 * Resets all form fields to their default state.
 */
function resetFormFields() {
    document.getElementById('task-form').reset();
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
    document.getElementById('attachments-list').innerHTML = '';
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