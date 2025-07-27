/**
 * Form validation utilities and functions
 */

let validationElements = {};
let eventListeners = {};

const validationMessages = {
    name: {
        required: 'Please enter a full name',
        fullName: 'Please enter both first and last name.',
        short: 'Name must be at least 2 characters.',
        invalid: 'Name can only include letters and spaces.'
    },
    email: {
        required: 'Please enter an email address',
        invalid: 'Email address not valid (e.g. name@example.com)',
    },
    phone: {
        required: 'Please enter a phone number',
        short: 'Phone number is too short',
        long: 'Phone number is too long',
        invalid: 'Phone number not valid (e.g. +49 123 4567890)',
    },
    password: {
        required: 'Check your email and password. Please try again.',
        invalid: 'Password can only include letters, numbers, and special characters',
        dontMatch: 'Your passwords don\'t match. Please try again.'
    }
};

/**
 * Initializes form validation by setting up elements and listeners.
 */
function initFormValidation() {
    validationElements = getValidationElements();
    setupValidationListeners();
    restrictTelInputs();
}

/**
 * Clears form validation by removing invalid states and stopping listeners.
 */
function clearFormValidation() {
    clearInvalidInputs();
    stopValidationListeners();
}

/**
 * Gets validation elements from the DOM.
 * @returns {Object} Object containing form validation elements.
 */
function getValidationElements() {
    return {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirm-password'),
        validationMsg: document.querySelector('.validation-msg'),
        validationBtn: document.querySelector('.primary-btn')
    };
}

/**
 * Restricts telephone input fields to only allow valid phone number characters.
 */
function restrictTelInputs() {
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', e => {
            e.target.value = e.target.value.replace(/[^\d+()\s-]/g, '');
        });
    });
}

/**
 * Validates a name input field.
 * @param {HTMLInputElement} nameInput - The name input element to validate.
 * @returns {Object} Validation result with isValid boolean and message string.
 */
function validateName(nameInput) {
    const name = nameInput.value.trim();
    if (!name) {
        return { isValid: false, message: validationMessages.name.required };
    }
    if (name.length < 2) {
        return { isValid: false, message: validationMessages.name.short };
    }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
        return { isValid: false, message: validationMessages.name.invalid };
    }
    const words = name.split(/\s+/).filter(word => word.length > 0);
    if (words.length < 2) {
        return { isValid: false, message: validationMessages.name.fullName };
    }
    return { isValid: true, message: '' };
}

/**
 * Validates an email input field.
 * @param {HTMLInputElement} emailInput - The email input element to validate.
 * @returns {Object} Validation result with isValid boolean and message string.
 */
function validateEmail(emailInput) {
    const email = emailInput.value.trim();
    if (!email) {
        return { isValid: false, message: validationMessages.email.required };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: validationMessages.email.invalid };
    }
    return { isValid: true, message: '' };
}

/**
 * Validates a phone input field.
 * @param {HTMLInputElement} phoneInput - The phone input element to validate.
 * @returns {Object} Validation result with isValid boolean and message string.
 */
function validatePhone(phoneInput) {
    const phone = phoneInput.value.trim();
    if (!phone) {
        return { isValid: false, message: validationMessages.phone.required };
    }
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.length < 7) {
        return { isValid: false, message: validationMessages.phone.short };
    }
    if (cleaned.length > 16) {
        return { isValid: false, message: validationMessages.phone.long };
    }
    if (!/^[+]?[\d]{7,15}$/.test(cleaned)) {
        return { isValid: false, message: validationMessages.phone.invalid };
    }
    return { isValid: true, message: '' };
}

/**
 * Validates a password input field.
 * @param {HTMLInputElement} passwordInput - The password input element to validate.
 * @returns {Object} Validation result with isValid boolean and message string.
 */
function validatePassword(passwordInput) {
    const password = passwordInput.value.trim();
    if (!password) {
        return { isValid: false, message: validationMessages.password.required };
    }
    if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) {
        return { isValid: false, message: validationMessages.password.invalid };
    }
    return { isValid: true, message: '' };
}

/**
 * Validates a confirm password input field against the original password.
 * @param {HTMLInputElement} confirmPasswordInput - The confirm password input element.
 * @param {HTMLInputElement} passwordInput - The original password input element.
 * @returns {Object} Validation result with isValid boolean and message string.
 */
function validateConfirmPassword(confirmPasswordInput, passwordInput) {
    const confirmPassword = confirmPasswordInput.value.trim();
    const password = passwordInput.value.trim();
    if (!confirmPassword) {
        return { isValid: false, message: validationMessages.password.required };
    }
    if (confirmPassword !== password) {
        return { isValid: false, message: validationMessages.password.dontMatch };
    }
    return { isValid: true, message: '' };
}

/**
 * Shows validation error for an input element.
 * @param {HTMLInputElement} inputElement - The input element to show error for.
 * @param {string} message - The error message to display.
 */
function showValidationError(inputElement, message) {
    if (!inputElement) return;
    inputElement.style.borderColor = '#FF8190';
    const inputId = inputElement.id;
    const validationMsg = document.getElementById(`${inputId}-validation-msg`);
    if (validationMsg) {
        validationMsg.textContent = message;
        validationMsg.classList.remove('d-none');
    }
}

/**
 * Clears validation error for an input element.
 * @param {HTMLInputElement} inputElement - The input element to clear error for.
 */
function clearValidationError(inputElement) {
    if (!inputElement) return;
    inputElement.style.borderColor = '';
    const inputId = inputElement.id;
    const validationMsg = document.getElementById(`${inputId}-validation-msg`);
    if (validationMsg) {
        validationMsg.classList.add('d-none');
    }
}

/**
 * Sets up validation event listeners for form inputs.
 */
function setupValidationListeners() {
    const inputs = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    inputs.forEach(inputName => {
        const input = validationElements[inputName];
        if (!input) return;
        eventListeners[inputName] = {
            focus: () => setInputActive(input),
            input: () => {
                setInputActive(input);
                validateInput(input, inputName);
                setInputActive(input);
            },
            blur: () => {
                removeInputActive(input);
                validateInput(input, inputName);
            }
        };
        input.addEventListener('focus', eventListeners[inputName].focus);
        input.addEventListener('input', eventListeners[inputName].input);
        input.addEventListener('blur', eventListeners[inputName].blur);
    });
}

/**
 * Validates an input element based on its type.
 * @param {HTMLInputElement} inputElement - The input element to validate.
 * @param {string} inputType - The type of input validation to perform.
 */
function validateInput(inputElement, inputType) {
    let result;
    switch (inputType) {
        case 'name':
            result = validateName(inputElement);
            break;
        case 'email':
            result = validateEmail(inputElement);
            break;
        case 'phone':
            result = validatePhone(inputElement);
            break;
        case 'password':
            result = validatePassword(inputElement);
            break;
        case 'confirmPassword':
            result = validateConfirmPassword(inputElement, validationElements.password);
            break;
        default:
            return;
    }
    if (!result.isValid) {
        showValidationError(inputElement, result.message);
    } else {
        clearValidationError(inputElement);
    }
    updateButtonState();
}

/**
 * Sets an input element to active state with visual styling.
 * @param {HTMLInputElement} inputElement - The input element to set as active.
 */
function setInputActive(inputElement) {
    if (!inputElement) return;
    inputElement.style.borderColor = '#29ABE2';
}

/**
 * Removes active state from an input element.
 * @param {HTMLInputElement} inputElement - The input element to remove active state from.
 */
function removeInputActive(inputElement) {
    if (!inputElement) return;
    inputElement.style.borderColor = '';
}

/**
 * Updates the button state based on validation status.
 */
function updateButtonState() {
    const button = validationElements.validationBtn;
    if (!button) return;
    const visibleMessages = document.querySelectorAll('.validation-msg:not(.d-none)');
    if (visibleMessages.length > 0 || areInputsEmpty()) {
        button.classList.add('button-disabled');
    } else {
        button.classList.remove('button-disabled');
    }
}

/**
 * Clears validation errors from all invalid inputs.
 */
function clearInvalidInputs() {
    const inputs = Object.values(validationElements);
    inputs.forEach(input => {
        if (input && input.tagName === 'INPUT') {
            clearValidationError(input);
        }
    });
}

/**
 * Stops all validation event listeners.
 */
function stopValidationListeners() {
    const inputs = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    inputs.forEach(inputName => {
        const input = validationElements[inputName];
        const listeners = eventListeners[inputName];
        if (input && listeners) {
            input.removeEventListener('focus', listeners.focus);
            input.removeEventListener('input', listeners.input);
            input.removeEventListener('blur', listeners.blur);
        }
    });
    eventListeners = {};
}

/**
 * Checks if any required inputs are empty.
 * @returns {boolean} True if any inputs are empty, false otherwise.
 */
function areInputsEmpty() {
    const inputs = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    return inputs.some(inputName => {
        const input = validationElements[inputName];
        if (!input) return false;
        return input.value.trim() === '';
    });
}