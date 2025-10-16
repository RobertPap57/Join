/**
 * Sets up the authentication form based on the type.
 * The form inputs, buttons, title, padding and gap are set up based on the type.
 * Additionally, the remembered user is set up if the type is 'login' and the form checkbox label is set up.
 * Finally, the form validation is initialized and the button state is updated.
 * @param {string} type - The type of form to set up ('login' or 'signup').
 */
function setUpAuthForm(type) {
    setUpFormInputs(type);
    setUpFormButtons(type);
    setUpFormTitleAndType(type);
    setUpFormPaddingAndGap(type);
    setUpRememberedUser(type);
    setUpCheckboxLabel(type);
    initFormValidation();
    updateButtonState();
}


/**
 * Sets up form inputs based on type.
 * If type is not 'login', show the name and confirm password input fields.
 * @param {string} type - The type of form to set up.
 */
function setUpFormInputs(type) {
    if (type !== 'login') {
        const nameInput = document.getElementById('name');
        const confirmPassowrdInput = document.getElementById('confirm-password');
        nameInput.parentElement.hidden = false;
        confirmPassowrdInput.parentElement.hidden = false;
    }
}


/**
 * Sets up form padding and gap based on type.
 * If type is not 'login', adds signup-padding class to the form element
 * and gap24 class to the inputs-section element.
 * @param {string} type - The type of form to set up.
 */
function setUpFormPaddingAndGap(type) {
    if (type !== 'login') {
        const form = document.querySelector('form');
        const inputsSection = document.querySelector('.inputs-section');
        form.classList.add('signup-padding');
        inputsSection.classList.add('gap24');
    }
}


/**
 * Sets up the form buttons based on the type of form.
 * If type is not 'login', sets the primary button text to 'Sign up',
 * shows the back button, hides the secondary button and sets its display to none.
 * @param {string} type - The type of form to set up.
 */
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


/**
 * Sets up the form title and data type based on the type of form.
 * If type is not 'login', sets the form title to 'Sign up' and the form data type to 'signup'.
 * @param {string} type - The type of form to set up.
 */
function setUpFormTitleAndType(type) {
    if (type !== 'login') {
        const form = document.getElementById('auth-form');
        const title = document.getElementById('auth-form-title');
        title.innerHTML = 'Sign up';
        form.dataset.type = 'signup';
    }
}


/**
 * Sets up the checkbox label based on the type of form.
 * If type is not 'login', sets the checkbox label to 'I accept the <a href="../pages/privacy-policy.html">Privacy policy</a>'
 * and adds the 'checkbox-label-signup' class to the label element.
 * @param {string} type - The type of form to set up.
 */
function setUpCheckboxLabel(type) {
    if (type !== 'login') {
        const checkboxLabel = document.getElementById('auth-checkbox-label');
        checkboxLabel.innerHTML = `I accept the <a href="../pages/privacy-policy.html">Privacy policy</a>`;
        checkboxLabel.classList.add('checkbox-label-signup');
    }
}


/**
 * Sets up the login form with remembered user credentials from localStorage
 * @param {string} type - The type of form ('login' or other)
 * @returns {void}
 */
function setUpRememberedUser(type) {
    if (type !== 'login') return;
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem("currentUser"));
    } catch (error) {
        console.error(error);         
    }
    if (currentUser) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        if (emailInput) emailInput.value = currentUser.email ?? '';
        if (passwordInput) passwordInput.value = currentUser.password ?? '';
        toggleCheckbox();
        toggleVisibitilyBtn('password', 'password-btn');
    }
}


/**
 * Toggles password visibility in an input field and updates the associated visibility icon
 * @param {string} inputId - The ID of the password input element
 * @param {string} btnId - The ID of the visibility toggle button element
 */
function togglePasswordVisibility(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const icon = btn.querySelector('img');
    if (!input) return;
    if (input.type === 'password') {
        input.focus();
        input.type = 'text';
        icon.src = '../assets/images/components/inputs/visibility.svg';
        btn.ariaLabel = 'Hide passoword';
    } else {
        input.focus();
        input.type = 'password';
        icon.src = '../assets/images/components/inputs/visibility-off.svg';
        btn.ariaLabel = 'Show passoword';
    }
}


/**
 * Toggles the visibility button state and icon based on input value
 * @param {string} inputId - The ID of the input element
 * @param {string} btnId - The ID of the button element
 */
function toggleVisibitilyBtn(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const icon = btn.querySelector('img');
    if (!input) return;
    if (input.value.length > 0) {
        btn.disabled = false;
        btn.ariaHidden = false;
        icon.src = '../assets/images/components/inputs/visibility-off.svg';
        btn.ariaLabel = 'Show passoword';
    } else {
        btn.disabled = true;
        btn.ariaHidden = true;
        icon.src = '../assets/images/components/inputs/lock.svg';
    }
}


/**
 * Toggles the state of a checkbox button and updates its visual representation
 * by switching the checkbox image and aria-checked attribute.
 * Then updates the button state accordingly.
 */
function toggleCheckbox() {
    const btn = document.getElementById('auth-checkbox-btn');
    const checkbox = document.getElementById('auth-checkbox');
    const isChecked = btn.getAttribute('aria-checked') === 'true';
    btn.setAttribute('aria-checked', String(!isChecked));
    checkbox.src = !isChecked
        ? '../assets/images/global/checkbox-checked.svg'
        : '../assets/images/global/checkbox.svg';
    updateButtonState();
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


/**
 * Logs in a user as a guest, creates a guest account, saves it to session storage, 
 * removes any existing user from local storage, and redirects to summary page.
 */
function loginAsGuest() {
    currentUser = createGuestUser();
    saveCurrentUserToSession(currentUser);
    localStorage.removeItem('currentUser');
    redirectTo('summary.html');
}


/**
 * Creates a new user object with basic properties
 * @param {string} name - The name of the user
 * @param {string} email - The email address of the user
 * @param {string} password - The user's password
 * @returns {Object} A new user object with name, email, password, empty phone and random color
 */
function createNewUser(name, email, password) {
    return {
        name: name,
        email: email,
        password: password,
        phone: '',
        color: getRandomColor(),
    };
}


/**
 * Saves the current user object to session storage.
 * @param {object} user - The user object to be saved.
*/
function saveCurrentUserToSession(currentUser) {
    if (!currentUser) return;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
}


/**
 * Handles the submission of authentication forms
 * @param {Event} event - The form submission event
*/
function handleAuthSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    const type = form.dataset.type;
    const formInputs = Object.fromEntries(new FormData(form).entries());
    if (!validateForm(form, type)) return;
    setUpSubmitActions(type, formInputs);
}


/**
 * Executes the appropriate submit action based on the form type.
 * @param {string} type - The type of form action ('login' or 'signup').
 * @param {Object} formInputs - The input data collected from the form.
 */
async function setUpSubmitActions(type, formInputs) {
    if (type === 'login') {
        login(formInputs);
    } else if (type === 'signup') {
        signup(formInputs);
    }
}


/**
 * Handles user registration process
 * @param {Object} params - User registration parameters
 * @param {string} params.name - User's name
 * @param {string} params.email - User's email address
 * @param {string} params.password - User's password
 * @returns {Promise<void>}
 */
async function signup({ name, email, password }) {
    const newUser = createNewUser(name, email, password);
    await addData('/users', newUser);
    localStorage.removeItem('currentUser');
    showToastMsg();
    setTimeout(() => {
        redirectTo('login.html');
    }, 1100);
}


/**
 * Handles user login by validating credentials and managing user session
 * @param {Object} params - The login parameters
 * @param {string} params.email - User's email address
 * @param {string} params.password - User's password
 */
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


/**
 * Validates user login credentials against stored users
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object|null} Matching user object if found, null otherwise
 */
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