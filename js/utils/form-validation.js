let validationElements = {};
let eventListeners = {};
let isSingup = false;

const validationMessages = {
    name: {
        required: 'Please enter a full name.',
        fullName: 'Please enter both first and last name.',
        short: 'Name must be at least 2 characters.',
        invalid: 'Name can only include letters and spaces.'
    },
    email: {
        required: 'Please enter an email address.',
        invalid: 'Email address not valid (e.g. name@example.com)',
        taken: 'This email is allready in use.',
    },
    phone: {
        required: 'Please enter a phone number.',
        short: 'Phone number is too short.',
        long: 'Phone number is too long.',
        invalid: 'Phone number not valid (e.g. +49 123 4567890).',
    },
    password: {
        required: 'Please enter a password.',
        invalid: 'Min 8 chars, uppercase, lowercase, number & symbol. ',
        dontMatch: 'Your passwords don\'t match. Please try again.',
        loginFail: 'Check your email and password. Please try again.',

    }
};

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
        validationBtn: document.querySelector('button[type="submit"]')
    };
}

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
}

/**
 * Validates a name input field.
 * @returns {Object} Validation result with isValid boolean and message string.
*/
function validateName() {
    const name = validationElements.name.value.trim();
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
 * @returns {Object} Validation result with isValid boolean and message string.
*/
function validateEmail() {
    const email = validationElements.email.value.trim();
    if (!email) {
        return { isValid: false, message: validationMessages.email.required };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: validationMessages.email.invalid };
    }
    if (isSingup && isEmailTaken()) {
        return { isValid: false, message: "This email is already in use." };
    }
    return { isValid: true, message: '' };
}

/**
 * Checks if the entered email already exists in the users list.
 * @returns {boolean} True if the email is already taken, false otherwise.
 */
function isEmailTaken() {
    const emailValue = validationElements.email.value.trim().toLowerCase();
    return users.some(user => user.email === emailValue);
}

/**
 * Validates a phone input field.
 * @returns {Object} Validation result with isValid boolean and message string.
*/
function validatePhone() {
    const phone = validationElements.phone.value.trim();
    if (!phone) {
        return { isValid: false, message: validationMessages.phone.required };
    }
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?\d+$/.test(cleaned)) {
        return { isValid: false, message: validationMessages.phone.invalid };
    }
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
        return { isValid: false, message: validationMessages.phone.short };
    }
    if (digitsOnly.length > 15) {
        return { isValid: false, message: validationMessages.phone.long };
    }

    return { isValid: true, message: '' };
}

/**
 * Restricts telephone input fields to only allow valid phone number characters.
 */
function restrictTelInputs() {
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', e => {
            let value = e.target.value;
            value = value.replace(/[^\d+()\s-]/g, '');
            value = value.replace(/(?!^)\+/g, '');
            e.target.value = value;
            updateButtonState();
        });
    });
}


/**
 * Validates a password input field.
 * @returns {Object} Validation result with isValid boolean and message string.
 */
function validatePassword() {
    const password = validationElements.password.value.trim();
    if (!password) {
        return { isValid: false, message: validationMessages.password.required };
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return { isValid: false, message: validationMessages.password.invalid };
    }
    return { isValid: true, message: '' };
}

/**
 * Validates a confirm password input field against the original password.
 * @returns {Object} Validation result with isValid boolean and message string.
 */
function validateConfirmPassword() {
    const confirmPassword = validationElements.confirmPassword.value.trim();
    const password = validationElements.password.value.trim();
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
 * @param {HTMLInputElement} input - The input element to show error for.
 * @param {string} message - The error message to display.
 */
function showValidationError(input, message) {
    if (!input) return;
    input.style.borderColor = '#FF8190';
    const inputId = input.id;
    const validationMsg = document.getElementById(`${inputId}-validation-msg`);
    if (validationMsg) {
        validationMsg.textContent = message;
        validationMsg.hidden = false;
    }
}

/**
 * Clears validation error for an input element.
 * @param {HTMLInputElement} input - The input element to clear error for.
 */
function clearValidationError(input) {
    if (!input) return;
    input.style.borderColor = '';
    const inputId = input.id;
    const validationMsg = document.getElementById(`${inputId}-validation-msg`);
    if (validationMsg) {
        validationMsg.hidden = true;
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
        bindEventListenerOnce(input, 'focus', () => { setInputActive(input); clearValidationError(input); }, 'validation');
        bindEventListenerOnce(input, 'input', () => { setInputActive(input); updateButtonState(); }, 'validation');
        bindEventListenerOnce(input, 'blur', () => { removeInputActive(input); }, 'validation');
    });
}


/**
 * Validates a specific form input based on its type.
 * @param {string} input - The name of the input field to validate (e.g., 'name', 'email', 'phone', 'password', 'confirmPassword').
 * @returns {boolean} True if the input is valid, false otherwise.
 */
function validateInput(input) {
    let result;
    switch (input) {
        case 'name':
            result = validateName();
            break;
        case 'email':
            result = validateEmail();
            break;
        case 'phone':
            result = validatePhone();
            break;
        case 'password':
            result = validatePassword();
            break;
        case 'confirmPassword':
            result = validateConfirmPassword();
            break;
        default:
            return false;
    }
    if (!result.isValid) {
        showValidationError(validationElements[input], result.message);
        return false
    } else {
        clearValidationError(validationElements[input]);
        return true
    }
}


/**
 * Validates all relevant input fields in a form based on the form type.
 *
 * @param {HTMLFormElement} form - The form element to validate.
 * @param {string} type - The type of form ('login', 'my-account', etc.).
 * @returns {boolean} True if all required inputs are valid, otherwise false.
 */
function validateForm(form, type) {
    if (type === 'my-account') return true;
    if (type === 'signup') isSingup = true;
    const inputs = Array.from(form.querySelectorAll('input'));
    let allValid = true;
    for (const input of inputs) {
        const inputName = input.name;
        if (type === 'login' && (inputName === 'name' || inputName === 'confirmPassword')) {
            continue;
        }
        const isValid = validateInput(inputName);
        if (!isValid) allValid = false;
    }
    return allValid;
}

/**
 * Sets an input element to active state with visual styling.
 * @param {HTMLInputElement} input - The input element to set as active.
 */
function setInputActive(input) {
    if (!input) return;
    input.style.borderColor = '#29ABE2';
}

/**
 * Removes active state from an input element.
 * @param {HTMLInputElement} input - The input element to remove active state from.
 */
function removeInputActive(input) {
    if (!input) return;
    input.style.borderColor = '';
}

/**
 * Updates the button state based on validation status.
 */
function updateButtonState() {
    const button = validationElements.validationBtn;
    if (!button) return;
    if (button.form && button.form.id === 'task-form') return;
    if (areInputsEmpty() || checkSignupCheckbox()) {
        button.disabled = true;
    } else {
        button.disabled = false;
    }
}

function checkSignupCheckbox() {
    const checkbox = document.getElementById('auth-checkbox-btn');
    if (!checkbox) return false;
    const label = checkbox.nextElementSibling;
    const isChecked = checkbox.getAttribute('aria-checked') === 'true';
    const isSignup = label.classList.contains('checkbox-label-signup');
    if (!isChecked && isSignup) return true;
    else return false;
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
 * Checks if any required inputs are empty.
 * @returns {boolean} True if any inputs are empty, false otherwise.
 */
function areInputsEmpty() {
    const inputs = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    return inputs.some(inputName => {
        const input = validationElements[inputName];
        if (!input) return false;
        const wrapper = input.parentElement;
        if (!wrapper || wrapper.offsetParent === null) return false;
        return input.value.trim() === '';
    });
}

/**
 * Highlights email and password fields with an error color and displays a login failure message.
 */
function showLoginValidationError() {
    validationElements.email.style.borderColor = '#FF8190';
    validationElements.password.style.borderColor = '#FF8190';
    const passwordMsg = document.getElementById(`${validationElements.password.id}-validation-msg`);
    if (passwordMsg) {
        passwordMsg.textContent = validationMessages.password.loginFail;
        passwordMsg.hidden = false;
    }
}

