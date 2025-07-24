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


function initFormValidation() {
    validationElements = getValidationElements();
    setupValidationListeners();
    restrictTelInputs();
}

function clearFormValidation() {
    clearInvalidInputs();
    stopValidationListeners();
}

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

function restrictTelInputs() {
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', e => {
            e.target.value = e.target.value.replace(/[^\d+()\s-]/g, '');
        });
    });
}

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

function clearValidationError(inputElement) {
    if (!inputElement) return;
    inputElement.style.borderColor = '';
    const inputId = inputElement.id;
    const validationMsg = document.getElementById(`${inputId}-validation-msg`);

    if (validationMsg) {
        validationMsg.classList.add('d-none');
    }
}

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

function setInputActive(inputElement) {
    if (!inputElement) return;
    inputElement.style.borderColor = '#29ABE2';
}

function removeInputActive(inputElement) {
    if (!inputElement) return;
    inputElement.style.borderColor = '';
}

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

function clearInvalidInputs() {
    const inputs = Object.values(validationElements);
    inputs.forEach(input => {
        if (input && input.tagName === 'INPUT') {
            clearValidationError(input);
        }
    });
}

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

function areInputsEmpty() {
    const inputs = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    
    return inputs.some(inputName => {
        const input = validationElements[inputName];
        if (!input) return false;
        return input.value.trim() === '';
    });
}



