


function setUpAuthForm(type) {
    setUpFormInputs(type);
    setUpFormButtons(type);
    setUpFormTitleAndType(type);
    setUpRememberedUser(type);
    setUpCheckboxLabel(type);
    initFormValidation();
    updateButtonState();
}

function setUpFormInputs(type) {
    if (type !== 'login') {
        const nameInput = document.getElementById('name');
        const confirmPassowrdInput = document.getElementById('confirm-password');
        nameInput.parentElement.hidden = false;
        confirmPassowrdInput.parentElement.hidden = false;
    }
}

function setUpFormButtons(type) {
    if (type !== 'login') {
        const backBtn = document.getElementById('back-btn');
        const secondaryBtn = document.getElementById('auth-secondary-btn');
        const primaryBtn = document.getElementById('auth-primary-btn');
        primaryBtn.innerHTML = 'Sign up';
        backBtn.hidden = false;
        secondaryBtn.hidden = true;
        secondaryBtn.style.display = 'none';
    }
}

function setUpFormTitleAndType(type) {
    if (type !== 'login') {
        const form = document.getElementById('auth-form')
        const title = document.getElementById('auth-form-title');
        title.innerHTML = 'Sign up';
        form.dataset.type = 'signup';

    }
}
function setUpCheckboxLabel(type) {
    if (type !== 'login') {
        const checkboxLabel = document.getElementById('auth-checkbox-label');
        checkboxLabel.innerHTML = `I accept the <a href="../pages/privacy-policy.html">Privacy policy</a>`;
        checkboxLabel.classList.add('checkbox-label-signup');
    }

}

function setUpRememberedUser(type) {
    if (type !== 'login') return;
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem("currentUser"));
    } catch {
    }
    if (currentUser) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        if (emailInput) emailInput.value = currentUser.email ?? '';
        if (passwordInput) passwordInput.value = currentUser.password ?? '';
        toggleCheckbox();
        toggleVisibitilyBtn('password', 'password-btn')
    }
}

function handleAuthSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget; // the form element
    const type = form.dataset.type;   // get login/signup type from data-type
    const formInputs = Object.fromEntries(new FormData(form).entries());
    setUpSubmitActions(type, formInputs);
}

async function setUpSubmitActions(type, formInputs) {
    if (type === 'login') {
        login(formInputs);
    } else if (type === 'signup') {
        // signup(formInputs); 
    }
}


function togglePasswordVisibility(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const icon = btn.querySelector('img');
    if (!input) return;
    if (input.type === 'password') {
        input.focus();
        input.type = 'text';
        icon.src = '../assets/images/components/inputs/visibility.svg'
        btn.ariaLabel = 'Hide passoword'
    } else {
        input.focus();
        input.type = 'password';
        icon.src = '../assets/images/components/inputs/visibility-off.svg';
        btn.ariaLabel = 'Show passoword'
    }
}

function toggleVisibitilyBtn(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const icon = btn.querySelector('img');
    if (!input) return;
    if (input.value.length > 0) {
        btn.disabled = false;
        icon.src = '../assets/images/components/inputs/visibility-off.svg';
        btn.ariaLabel = 'Show passoword'
    } else {
        btn.disabled = true;
        icon.src = '../assets/images/components/inputs/lock.svg';
    }
}




function toggleCheckbox() {
    const btn = document.getElementById('auth-checkbox-btn');
    const checkbox = document.getElementById('auth-checkbox');
     const isChecked = btn.getAttribute('aria-checked') === 'true';

    btn.setAttribute('aria-checked', String(!isChecked));
    checkbox.src = !isChecked
        ? '../assets/images/global/checkbox-checked.svg'
        : '../assets/images/global/checkbox.svg';
}





/**
 * Creates a guest user object with default values.
 * @returns {object} The guest user object 
 */
function createGuestUser() {
    return {
        name: 'Guest',
        email: 'guest@join.de',
        id: 'guest',
        color: '#00BEE8',
        password: 'guest',
    };
}


function loginAsGuest() {
    currentUser = createGuestUser();
    saveCurrentUserToSession(currentUser);
    localStorage.removeItem('currentUser');
    redirectTo('summary.html');
}


/**
 * Saves the current user object to session storage.
 * @param {object} user - The user object to be saved.
 */
function saveCurrentUserToSession(currentUser) {
    if (!currentUser) return;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
}



function login({ email, password }) {
    const matchingUser = validateLoginCredentials(email, password);
    if (matchingUser) {
        saveCurrentUserToSession(matchingUser);
        const checkbox = document.getElementById('auth-checkbox-btn');
        if (checkbox?.getAttribute('aria-checked') === 'true') {
            localStorage.setItem('currentUser', JSON.stringify(matchingUser));
        } else {
            localStorage.removeItem('currentUser');
        }
        redirectTo('summary.html');
    } else {
        localStorage.removeItem('currentUser');
    }
}

function validateLoginCredentials(email, password) {
    const matchingUser = users.find(
        user => user.email === email.trim() && user.password === password.trim()
    );

    if (!matchingUser) {
        showLoginValidationError();
        return null;
    }

    clearValidationError(validationElements.email);
    clearValidationError(validationElements.password);
    return matchingUser;
}
