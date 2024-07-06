"use strict";


/**
 * Base URL for Firebase Realtime Database API.
 * 
 * Represents the base URL used to access the Firebase Realtime Database API.
 * 
 * @constant
 * @type {string}
 */

/**
 * Initializes the login page by executing various setup functions asynchronously.
 * 
 * Calls multiple functions asynchronously to initialize the login page:
 * - checkForCurrentUserLogin: Checks if a current user is logged in.
 * - changeOfDisplayNoneAfterAnimation: Handles animation and display changes after login.
 * - checkLocalStorageForUserData: Checks local storage for user data.
 * - changePasswordIcon: Updates the password icon based on user interaction.
 * - disableLoginButtonIfFormIsEmpty: Disables the login button if the form is empty.
 * - logInIsCorrected: Handles corrections and validations during login process.
 * 
 */
async function initLogin() {
    checkForCurrentUserLogin();
    changeOfDisplayNoneAfterAnimation();
    checkLocalStorageForUserData();
    changePasswordIcon();
    disableLoginButtonIfFormIsEmpty();
    logInIsCorrected();
}


/**
 * Toggles the display of overlay and overlay-logo elements after an animation delay.
 * 
 * This function adds the 'd-none' class to the overlay element and removes the
 * 'd-none' class from the logo element after a delay of 1800 milliseconds, simulating
 * the end of an animation.
 *
 */
function changeOfDisplayNoneAfterAnimation() {
    let overlay = document.getElementById('overlay');
    let logo = document.getElementById('header__logo');
    if (overlay && logo) {
        setTimeout(() => {
            overlay.classList.add('d-none');
            logo.classList.remove('d-none');
        }, 2000);
    }
}


/**
 * Redirects the browser to the summary page.
 * 
 * This function changes the current location of the browser to 'summary.html', effectively
 * navigating the user to the summary page.
 *
 */
function redirectToSummary() {
    window.location.href = 'summary.html';
}


/**
 * Redirects the browser to the signup page.
 * 
 * This function changes the current location of the browser to 'signup.html', effectively
 * navigating the user to the signup page.
 *
 */
function redirectToSignUp() {
    window.location.href = 'signup.html';
}


/**
 * Checks local storage for user data related to login.
 * 
 * Retrieves user data from local storage using the checkLocalStorageForLoginData function.
 * Updates the current user variable if user data is found and calls updateLogInForm with the appropriate parameter.
 * If no user data is found, calls updateLogInForm with false.
 */
function checkLocalStorageForUserData() {
    const userInLocalStorage = checkLocalStorageForLoginData();
    if (userInLocalStorage) {
        currentUser = userInLocalStorage;
        updateLogInForm(true);
    } else {
        updateLogInForm(false);
    }
}


/**
 * Checks local storage for user login data.
 * 
 * Retrieves the user data from local storage using the 'currentUser' key.
 * Parses the JSON string retrieved from local storage to convert it into a JavaScript object.
 * Returns the parsed user object if retrieval and parsing are successful.
 * Returns null if no user data is found in local storage or if there is an error parsing the JSON.
 * 
 * @returns {object | null} The parsed user object from local storage, or null if not found or parsing error.
 */
function checkLocalStorageForLoginData() {
    const userInLocalStorageString = localStorage.getItem('currentUser');
    if (userInLocalStorageString) {
        try {
            const userInLocalStorage = JSON.parse(userInLocalStorageString);
            return userInLocalStorage;
        } catch (error) {
            console.error('Error parsing JSON from Local Storage', error);
            return null;
        }
    } else {
        return null;
    }
}


/**
 * Updates the state (checked or unchecked) of a checkbox element.
 * 
 * Sets the source (src) attribute of the checkbox element's image based on the isChecked parameter.
 * Updates the dataset.checked attribute of the checkbox to reflect the isChecked state.
 * 
 * @param {HTMLElement} checkbox - The checkbox element to update.
 * @param {boolean} isChecked - The desired checked state:
 *                              - true: Checkbox should be checked.
 *                              - false: Checkbox should be unchecked.
 */
function updateCheckboxState(checkbox, isChecked) {
    checkbox.src = isChecked ? './assets/img/icons_login/checkbox_checked.png' : './assets/img/icons_login/checkbox_unchecked.png';
    checkbox.dataset.checked = isChecked ? 'true' : 'false';
}


/**
 * Updates the login form fields based on whether user data is stored locally.
 * 
 * Sets the value of email and password fields in the login form based on the inStorage parameter:
 * - If inStorage is true, sets emailField value to currentUser.email and passwordField value to currentUser.password.
 * - If inStorage is false, clears both emailField and passwordField values.
 * Updates the checkbox state using the updateCheckboxState function based on the inStorage parameter.
 * 
 * @param {boolean} inStorage - Indicates whether user data is stored locally:
 *                              - true: User data is stored locally (currentUser object is available).
 *                              - false: No user data is stored locally (currentUser object is not available).
 */
function updateLogInForm(inStorage) {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const checkbox = document.getElementById('checkbox');
    emailField.value = inStorage ? currentUser.email : '';
    passwordField.value = inStorage ? currentUser.password : '';
    updateCheckboxState(checkbox, inStorage);
}


/**
 * Handles the click event of a checkbox element.
 * 
 * Retrieves the current state of the checkbox using the checkIfCheckBoxIsClicked function.
 * Updates the state of the checkbox to the opposite of its current state using the updateCheckboxState function.
 * 
 */
function checkBoxClicked() {
    const checkbox = document.getElementById('checkbox');
    const isChecked = checkIfCheckBoxIsClicked(checkbox);
    updateCheckboxState(checkbox, !isChecked);
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
 * Checks login credentials against user data loaded from a database.
 * 
 * Loads user data from the '/users' endpoint using the loadData function.
 * Finds a user with a matching email in the loaded data.
 * Compares the provided password with the password of the matching user.
 * Logs appropriate warnings or errors for invalid credentials or database errors.
 * Calls the wrongPassword function if the password does not match.
 * Returns the matching user object if login is successful, or null otherwise.
 * 
 * @async
 * @param {string} email - The email address entered by the user for login.
 * @param {string} password - The password entered by the user for login.
 * @returns {object | null} The user object if login is successful, or null if not found or incorrect password.
 */
async function checkLoginValues(email, password) {
    try {
        const datas = await loadData("/users");
        const matchingContact = datas.find(data => data.email === email);
        if (!matchingContact) {
            wrongMail();
        } else if (matchingContact.password !== password) {
            wrongPassword();
        } else {
            return matchingContact;
        }
    } catch (error) {
        console.error("Error loading user data", error);
    }
    return null;
}


/**
 * Creates a guest user object with default values.
 * 
 * @returns {object} The guest user object 
 */
function createGuestUser() {
    return {
        name: 'guest',
        email: 'guest@join.de',
        id: 'guest',
        color: '#00BEE8',
        initials: 'G',
        password: 'guest',
    };
}


/**
 * Logs in the user as a guest.
 * Creates a guest user, saves it to session storage,
 * clears login form fields, resets checkbox state,
 * removes 'currentUser' from local storage,
 * and redirects to the summary page.
 */
function loginAsGuest() {
    currentUser = createGuestUser();
    saveCurrentUser(currentUser);
    clearForm('email', 'password');
    localStorage.removeItem('currentUser');
    checkbox.src = './assets/img/icons_login/checkbox_unchecked.png';
    redirectToSummary();
}


/**
 * Saves the current user object to session storage.
 * 
 * @param {object} user - The user object to be saved.
 */
function saveCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}


/**
 * Handles the form submission for logging in.
 * Prevents the default form submission action,
 * and calls the login function to handle the login process.
 * 
 * @param {Event} event - The submit event object.
 */
function loginSubmit(event) {
    event.preventDefault();
    login();
}


/**
 * Handles the login process asynchronously.
 * Retrieves email and password from form input fields,
 * checks login credentials against user data,
 * updates session storage with the current user if login is successful,
 * clears login form fields, manages checkbox state in local storage,
 * and redirects to the summary page upon successful login.
 * Logs a warning message if login fails.
 */
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const matchingContact = await checkLoginValues(email, password);
    if (matchingContact) {
        currentUser = matchingContact;
        saveCurrentUserToSessionStorage(currentUser);
        clearForm('email', 'password');
        const checkbox = document.getElementById('checkbox');
        if (checkIfCheckBoxIsClicked(checkbox)) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
        redirectToSummary();
        await addUserToContacts();
    } else {
        localStorage.removeItem('currentUser');
    }
}


/**
 * Clears the values of specified form input fields.
 * 
 * @param {string} email - The ID of the email input field.
 * @param {string} password - The ID of the password input field.
 */
function clearForm(email, password) {
    document.getElementById(`${email}`).value = '';
    document.getElementById(`${password}`).value = '';
}


/**
 * Saves the current user object to session storage if it exists.
 * Displays a warning message and returns early if currentUser is not available.
 * 
 * @param {object} currentUser - The user object to be saved.
 */
function saveCurrentUserToSessionStorage(currentUser) {
    if (currentUser) {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        /* console.warn("currentUser NA - save to local Storage not possible");*/
        return;
    }
}


/**
 * Toggles the visibility of the password field and updates the visibility icon.
 * 
 * Finds the password field and its visibility icon by ID.
 * Changes the password field type between 'password' and 'text' to show or hide the password.
 * Updates the visibility icon source accordingly ('./assets/img/icons_login/visibility.png' or './assets/img/icons_login/visibility_off.png').
 * Toggles the 'visible' class on the icon based on password visibility.
 * Sets an event listener on the password field based on its visibility state.
 */
function showPassword() {
    const passwordField = document.getElementById('password');
    const passwordIcon = document.getElementById('password__icon');
    const isPasswordVisible = passwordField.type === 'password';
    passwordField.type = isPasswordVisible ? 'text' : 'password';
    passwordIcon.src = isPasswordVisible ? './assets/img/icons_login/visibility.png' : './assets/img/icons_login/visibility_off.png';
    passwordIcon.classList.toggle('visible', isPasswordVisible);
    passwordField.onkeyup = isPasswordVisible ? null : 'changePasswordIcon()';
}


/**
 * Updates the password visibility icon based on the password field's state.
 * 
 * Finds the password field and its icon by ID.
 * Checks if the password field is empty to determine the icon source and visibility.
 * Updates the icon source to './assets/img/icons_login/lock.png' if the password field is empty,
 * or './assets/img/icons_login/visibility_off.png' if not.
 * Toggles classes 'visible__no' and 'pointerEvents__none' on the icon based on whether the password field is empty.
 */
function changePasswordIcon() {
    const passwordField = document.getElementById('password');
    const passwordIcon = document.getElementById('password__icon');
    const isEmpty = passwordField.value.length === 0;
    passwordIcon.src = isEmpty ? './assets/img/icons_login/lock.png' : './assets/img/icons_login/visibility_off.png';
    passwordIcon.classList.toggle('visible__no', !isEmpty);
    passwordIcon.classList.toggle('pointerEvents__none', isEmpty);
}


/**
 * Disables the login button if the email or password fields are empty or contain only whitespace; otherwise, enables it.
 * 
 * Finds the login button, email field, and password field by their IDs.
 * Trims whitespace from the values in the email and password fields and checks their lengths.
 * Disables the login button if either field is empty or contains only whitespace.
 * Toggles the 'btn__disabled' class on the button based on its disabled state.
 */
function disableLoginButtonIfFormIsEmpty() {
    const button = document.getElementById('btn__logIn');
    const emailLength = document.getElementById('email').value.trim().length;
    const passwordLength = document.getElementById('password').value.trim().length;
    button.disabled = !(emailLength > 0 && passwordLength > 0);
    button.classList.toggle('btn__disabled', button.disabled);
}


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
 * Adds the 'wrongPassword' class to the container of the password input field
 * and updates the innerHTML of the feedback message element with an error message.
 */
function wrongPassword() {
    containerPassword.classList.add('wrongPassword');
    feedbackPassword.innerHTML = 'Wrong password Ups! Try again.';
}


/**
 * DOM element representing the container for the password input field.
 * @type {HTMLElement}
 */
let containerMail = document.getElementById('mail__container');


/**
 * DOM element representing the feedback message for incorrect password input.
 * @type {HTMLElement}
 */
let feedbackMail = document.getElementById('form__wrongMail__message');


/**
 * Adds the 'wrongMail' class to the container of the mail input field
 * and updates the innerHTML of the feedback message element with an error message.
 */
function wrongMail() {
    containerMail.classList.add('wrongMail');
    feedbackMail.innerHTML = 'Wrong eMail Ups! Try again.';
}


/**
 * Removes the 'wrongPassword' class from the container of the password input field
 * and clears the innerHTML of the feedback message element.
 */
function logInIsCorrected() {
    containerPassword.classList.remove('wrongPassword');
    feedbackPassword.innerHTML = '';
    containerMail.classList.remove('wrongMail');
    feedbackMail.innerHTML = '';
}


/**
 * Checks if there is a current user logged in based on session storage.
 * 
 * Retrieves the user string from session storage.
 * If no user string is found, logs a warning and returns false.
 * Attempts to parse the user string as JSON.
 * If successful, returns true indicating a valid logged-in user.
 * If parsing fails, logs an error and returns false.
 * 
 * @returns {boolean} True if a valid current user exists; otherwise, false.
 */
function checkForCurrentUserLogin() {
    const userString = sessionStorage.getItem('currentUser');
    if (!userString) {
        return false;
    }
    try {
        const userJSON = JSON.parse(userString);
        return true;
    } catch (error) {
        console.error('Error parsing JSON from Session Storage', error);
        return false;
    }
}


/**
 * Adds the current user to the contacts list and updates the database.
 * 
  */
async function addUserToContacts() {
    const userToContacts = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: "",
        color: currentUser.color,
        initials: currentUser.initials,
    };
    contacts.push(userToContacts);
    await updateDataBase(contacts, 'contacts'); 
}


/**
 * Updates the specified array in the database.
 * 
 * @param {Array} array - The array to be updated in the database.
 * @param {string} arrayName - The name of the array in the database.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
async function updateDataBase(array, arrayName) {
    await fetch(`${BASE_URL}/${arrayName}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(array)
    }); 
}