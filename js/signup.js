let containerPassword = document.getElementById('password__container');
let feedbackPassword = document.getElementById('form__wrongPassword__message');



/**
 * Initializes the sign-up page by loading existing users, setting up the password input fields, and disabling the sign-up button if the form is empty.
 * @returns {Promise<void>}
 */
async function initSignUp() {
      await includeHTML();
    checkOrientation();
    await getUsers();
    changePasswordIcon('password');
    changePasswordIcon('password__confirm');
    disableSignupButtonIfFormIsEmpty();
    deleteMessageThatPasswordsDontMatch();
}


/**
 * Checks if the checkbox is checked (true) or unchecked (false).
 * 
 * This function checks if a checkbox element is currently checked by
 * retrieving the value of its 'data-checked' attribute. It returns true
 * if the checkbox is checked, otherwise it returns false.
 *
 * @param {HTMLElement} checkbox - The checkbox element to check.
 * @returns {boolean} True if the checkbox is checked, otherwise false.
 */
function checkIfCheckBoxIsClicked(checkbox) {
    const isChecked = checkbox.getAttribute('data-checked') === 'true';
    return isChecked;
}


/**
 * Toggles the checkbox state and updates its appearance.
 * 
 * This function checks the current state of a checkbox element (based on its `data-checked` attribute),
 * and toggles its state between checked and unchecked. It also updates the `src` attribute of the
 * checkbox image to reflect the new state.
 *
 * @returns {void} This function does not return a value.
 */
function checkBoxClicked() {
    const checkbox = document.getElementById('checkbox');
    const isChecked = checkIfCheckBoxIsClicked(checkbox);
    checkbox.src = isChecked
        ? './assets/img/icons_signup/checkbox_unchecked.png'
        : './assets/img/icons_signup/checkbox_checked.png';
    checkbox.dataset.checked = isChecked ? 'false' : 'true';
    disableSignupButtonIfFormIsEmpty();
}


/**
 * Toggles the visibility of the password in the specified input field.
 * 
 * @param {string} element - The ID of the password input field.
 */
function showPassword(element) {
    const passwordField = document.getElementById(element);
    const passwordIcon = document.getElementById(element + '__icon');
    const isPasswordVisible = passwordField.type === 'password';
    passwordField.type = isPasswordVisible ? 'text' : 'password';
    passwordIcon.src = isPasswordVisible ? './assets/img/icons_signup/visibility.png' : './assets/img/icons_signup/visibility_off.png';
    passwordIcon.classList.toggle('visible_yes', isPasswordVisible);
    passwordField.onkeyup = isPasswordVisible ? '' : 'changePasswordIcon()';
}


/**
 * Updates the password icon based on the content of the specified input field.
 * 
 * @param {string} element - The ID of the password input field.
 */
function changePasswordIcon(element) {
    const passwordField = document.getElementById(element);
    const passwordIcon = document.getElementById(element + '__icon');
    const isEmpty = passwordField.value.length === 0;
    passwordIcon.src = isEmpty ? './assets/img/icons_signup/lock.png' : './assets/img/icons_signup/visibility_off.png';
    passwordIcon.classList.toggle('visible__no', !isEmpty);
    passwordIcon.classList.toggle('pointerEvents__none', isEmpty);
}


/**
 * Disables the sign-up button if any of the required form fields are empty or the checkbox is not checked.
 * 
 * @returns {void}
 */
function disableSignupButtonIfFormIsEmpty() {
    const button = document.getElementById('btn__signUp');
    const name = document.getElementById('name').value.trim().length;
    const email = document.getElementById('email').value.trim().length;
    const password = document.getElementById('password').value.trim().length;
    const passwordConfirm = document.getElementById('password__confirm').value.trim().length;
    const checkbox = document.getElementById('checkbox');
    const isChecked = checkIfCheckBoxIsClicked(checkbox);
    const isEmpty = name === 0 || email === 0 || password === 0 || passwordConfirm === 0 || !isChecked;
    button.disabled = isEmpty;
    button.classList.toggle('btn__disabled', isEmpty);
}


/**
 * Handles the form submission for signing up.
 * Prevents the default form submission action, adds a new user,
 * shows a successful sign-up overlay, and redirects to the login page
 * after a delay of 1.75 seconds.
 * 
 * @param {Event} event - The submit event object.
 */

async function signUpSubmit(event) {
    event.preventDefault();
    await addUser();
    successfullSignUp();
    setTimeout(() => {
        redirectTo('/login.html');
    }, 1750);
}


/**
 * Adds a new user to the database after validating the form inputs.
 * 
 * Retrieves the user's name, email, password, and confirmation password from the input fields,
 * checks if the passwords match, and if they do, creates a new user object and adds it to the database.
 * If the passwords do not match, displays an error message.
 * 
 * @async
 * @returns {Promise<void>} A promise that resolves when the user is successfully added.
 */

async function addUser() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password__confirm').value;
    const passwordsMatching = checkIfPasswordsAreMatching(password, passwordConfirm);
    if (!passwordsMatching) {
        wrongPassword();
        return;
    }
    const newUser = createNewUser(name, email, password);
    await addData('/users', newUser);
}


/**
 * Creates a new user object with the provided name, email, and password.
 * The created user object has the following properties:
 * - name: The user's name.
 * - email: The user's email address.
 * - password: The user's password.
 * - phone: An empty string (no phone number is stored for now).
 * - color: A randomly generated color for the user's avatar.
 * 
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {object} The newly created user object.
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
 * Displays the sign-up success overlay by removing the 'd-none' class.
 */
function successfullSignUp() {
    const element = document.getElementById('signup__overlay');
    element.classList.remove('d-none');
}


/**
 * Checks if the given passwords match.
 * 
 * @param {string} password - The first password.
 * @param {string} passwordConfirm - The second password to confirm against the first.
 * @returns {boolean} True if passwords match, false otherwise.
 */
function checkIfPasswordsAreMatching(password, passwordConfirm) {
    const check = password === passwordConfirm;
    return check;
}


/**
 * Displays an error message indicating that the entered passwords don't match.
 */
function wrongPassword() {
    containerPassword.classList.add('wrongPassword');
    feedbackPassword.innerHTML = `Ups! Your passwords don't match!`;
}


/**
 * Clears the error message indicating that the entered passwords don't match.
 */
function deleteMessageThatPasswordsDontMatch() {
    containerPassword.classList.remove('wrongPassword');
    feedbackPassword.innerHTML = '';
}


/**
 * Checks if the entered password in the password input field matches the given requirements and set the custom validity of the field accordingly.
 * 
 * The requirements are:
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 * - At least 8 characters long
 * 
 * The custom validity message will be a string containing all the requirements that are not met.
 */
function validatePassword() {
    const passwordElement = document.getElementById('password');
    const password = passwordElement.value;
    const requirements = [
        { regex: /(?=.*[A-Z])/, message: 'At least one uppercase letter.\n' },
        { regex: /(?=.*[a-z])/, message: 'At least one lowercase letter.\n' },
        { regex: /(?=.*\d)/, message: 'At least one number.\n' },
        { regex: /(?=.*[@#$!%*?&])/, message: 'At least one special character (@$!%*?&).\n' },
        { test: password.length >= 8, message: 'At least 8 characters long.\n' }
    ];
    const errorMessage = requirements.reduce((msg, req) =>
        msg + ((req.regex && !req.regex.test(password)) || (req.test === false) ? req.message : ''), '');
    passwordElement.setCustomValidity(errorMessage);
}


/**
 * Checks if the entered email address in the email input field matches the given requirements and set the custom validity of the field accordingly.
 * 
 * The requirements are:
 * - The email address must contain an "@" symbol.
 * - The email address must contain a dot (.) after the "@" symbol.
 * - The email address cannot end with a dot (.)).
 * - The local part of the email address contains invalid characters.
 * - The top-level domain must be at least two letters long.
 * - The email address must not already be taken by another user.
 *
 * The custom validity message will be a string containing all the requirements that are not met.
 */
 function validateEmail() {
    const emailElement = document.getElementById('email');
    const email = emailElement.value.trim();

    const validations = [
        { condition: email.indexOf('@') < 1, message: 'The email address must contain an "@" symbol.\n' },
        { condition: email.lastIndexOf('.') <= email.indexOf('@') + 1, message: 'The email address must contain a dot (.) after the "@" symbol.\n' },
        { condition: email.lastIndexOf('.') === email.length - 1, message: 'The email address cannot end with a dot (.).\n' },
        { condition: !/^[a-zA-Z0-9._%+-]+@/.test(email), message: 'The local part of the email address contains invalid characters.\n' },
        { condition: !/[a-zA-Z]{2,}$/.test(email.split('.').pop()), message: 'The top-level domain must be at least two letters long.\n' },
        { condition: users.some(user => user.email.toLowerCase() === email.toLowerCase()), message: 'This email is already taken.\n' }
    ];

    const errorMessage = validations.reduce((msg, val) => val.condition ? msg + val.message : msg, '');
    emailElement.setCustomValidity(errorMessage);
}