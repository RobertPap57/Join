"use strict";


/**
 * Base URL for the Firebase Realtime Database.
 * @type {string}
 */


/**
 * DOM element representing the container for the password input field.
 * @type {HTMLElement}
 */
let containerPassword = document.getElementById('password__container');


/**
 * DOM element representing the feedback message for incorrect password input.
 * @type {HTMLElement}
 */
let feedbackPassword = document.getElementById('form__wrongPassword__message');


/**
 * Array of color codes representing user avatar colors.
 * @type {string[]}
 */
const userColors = [
    '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF',
    '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B',
]


/**
 * Initializes the sign-up page by performing necessary actions.
 * 
 * Calls functions to change password icons for password fields,
 * disable the sign-up button if the form is empty,
 * and delete any messages indicating that passwords do not match.
 */
async function initSignUp() {
    await getDataFromFirebase();
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
 * Redirects the browser to the last visited page.
 * 
 * This function changes the current location of the browser
 *
 */
function goBack() {
    window.history.back();
}


/**
 * Toggles the visibility of the password in the specified input field.
 * 
 * @param {string} element - The ID of the password input field.
 */
function showPassword(element) {
    const passwordField = document.getElementById(element);
    const passwordIcon = document.getElementById(element+'__icon');
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
    const passwordIcon = document.getElementById(element+'__icon');
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
 * Prevents the default form submission action and invokes the sign-up process.
 * 
 * @param {Event} event - The event object representing the form submission.
 */
function signUpSubmit(event) {
    event.preventDefault();
    signUp();
}


/**
 * Retrieves data from Firebase for tasks, users, and contacts.
 * 
 * Asynchronously retrieves data from Firebase for tasks, users, and contacts,
 * ensuring each collection is populated and not empty.
 * 
 */
async function getDataFromFirebase() {
    tasks = await checkIfDatabaseIsEmpty("/tasks");
    users = await checkIfDatabaseIsEmpty("/users");
    contacts = await checkIfDatabaseIsEmpty("/contacts");
}


/**
 * Checks if the database or specified path within the database is empty.
 * 
 * Asynchronously loads data from the specified path and returns a default
 * value (tasksDummy) if the result is falsy (empty or undefined).
 * 
 * @async
 * @function checkIfDatabaseIsEmpty
 * @param {string} [path=""] - The path within the database to check for data.
 * @returns {Promise<any>} A promise that resolves with the loaded data or tasksDummy if empty.
 */
const checkIfDatabaseIsEmpty = async (path = "") => {
    const result = await loadData(path);
    if (!result) {
      console.warn("Datenbank bzw. angegebener Pfad innerhalb der Datenbank ist leer");
      return tasksDummy;
    }
    return result;
};


/**
 * Handles the sign-up process by collecting user input, validating passwords, creating a new user object,
 * saving user data, and performing subsequent sign-up actions.
 */
function signUp() {
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
    const newContact = createNewContact(newUser);
    saveUserData(newUser, newContact);
    performSignUpActions();
}


/**
 * Creates a new user object with the provided name, email, and password.
 * Generates a unique user ID based on the current timestamp,
 * assigns a random color from userColors array, and creates initials from the user's name.
 * 
 * @param {string} name - The name of the new user.
 * @param {string} email - The email of the new user.
 * @param {string} password - The password of the new user.
 * @returns {object} The newly created user object.
 */
function createNewUser(name, email, password) {
    const date = new Date();
    const newUserID = date.getTime();
    const newUserColor = userColors[randomUserColors()];
    const newUserInitials = createUserInitials(name);
    return {
        name: name,
        email: email,
        password: password,
        phone: '',
        color: newUserColor,
        initials: newUserInitials,
        id: newUserID,
    };
}


/**
 * Creates a new contact object based on the provided user object.
 * 
 * @param {object} user - The user object containing user information.
 * @returns {object} The newly created contact object.
 */
function createNewContact(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: '',
        color: user.color,
        initials: user.initials,
    };
}


/**
 * Saves the new user and contact data to the database.
 * 
 * @param {object} newUser - The new user object to be added.
 */
function saveUserData(newUser, newContact) {
    users.push(newUser);
    putData("/users", users);
}


/**
 * Performs actions after successful user sign-up:
 * clears the sign-up form, displays a success message, and redirects to the login page after a delay.
 */
function performSignUpActions() {
    clearSignUpForm();
    successfullSignUp();
    setTimeout(redirectToLogin, 1750);
}


/**
 * Displays the sign-up success overlay by removing the 'd-none' class.
 */
function successfullSignUp() {
    const element = document.getElementById('signup__overlay');
    element.classList.remove('d-none');
}


/**
 * Redirects the user to the login.html page.
 */
function redirectToLogin() {
    window.location.href = 'login.html';
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
 * Clears the input fields of the sign-up form.
 */
function clearSignUpForm() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password__confirm').value = '';
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
 * Generates a random index to pick a color from the userColors array.
 *
 * @returns {number} Random index within the bounds of the userColors array.
 */
function randomUserColors() {
    const amount = userColors.length;
    const randomColor = Math.floor(Math.random() * (amount + 1));
    return randomColor;
}


/**
 * Creates initials from the given name.
 *
 * @param {string} name - The full name to create initials from.
 * @returns {string} Initials generated from the first letters of each word in the name.
 */
function createUserInitials(name) {
    const names = name.split(' ');
    const firstNameInitial = names[0].charAt(0).toUpperCase();
    const lastNameInitial = names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : '';
    return firstNameInitial + lastNameInitial;
}


/**
 * Validates the password based on specified criteria and sets a custom validity message.
 */
function validatePassword() {
    const passwordElement = document.getElementById('password');
    const password = passwordElement.value;
    const requirements = [
        { regex: /(?=.*[A-Z])/, message: 'Mindestens ein Großbuchstabe.\n' },
        { regex: /(?=.*[a-z])/, message: 'Mindestens ein Kleinbuchstabe.\n' },
        { regex: /(?=.*\d)/, message: 'Mindestens eine Zahl.\n' },
        { regex: /(?=.*[@#$!%*?&])/, message: 'Mindestens ein Sonderzeichen (@$!%*?&).\n' },
        { test: password.length >= 8, message: 'Mindestens 8 Zeichen lang.\n' }
    ];
    const errorMessage = requirements.reduce((msg, req) => 
        msg + ((req.regex && !req.regex.test(password)) || (req.test === false) ? req.message : ''), '');
    passwordElement.setCustomValidity(errorMessage);
}


/**
 * Validates the email address based on specified criteria and sets a custom validity message.
 */
function validateEmail() {
    const emailElement = document.getElementById('email');
    const email = emailElement.value;
    const validations = [
        { condition: email.indexOf('@') < 1, message: 'Die E-Mail-Adresse muss ein @-Symbol enthalten.\n' },
        { condition: email.lastIndexOf('.') <= email.indexOf('@') + 1, message: 'Die E-Mail-Adresse muss einen Punkt (.) nach dem @-Symbol enthalten.\n' },
        { condition: email.lastIndexOf('.') === email.length - 1, message: 'Die E-Mail-Adresse darf nicht mit einem Punkt (.) enden.\n' },
        { condition: !/^[a-zA-Z0-9._%+-]+@/.test(email), message: 'Der lokale Teil der E-Mail-Adresse enthält ungültige Zeichen.\n' },
        { condition: !/[a-zA-Z]{2,}$/.test(email.split('.').pop()), message: 'Die Top-Level-Domain muss mindestens zwei Buchstaben lang sein.\n' }
    ];
    const errorMessage = validations.reduce((msg, val) => val.condition ? msg + val.message : msg, '');
    emailElement.setCustomValidity(errorMessage);
}
