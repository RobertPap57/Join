let containerPassword = document.getElementById('password__container');
let containerMail = document.getElementById('mail__container');
let feedbackMail = document.getElementById('form__wrongMail__message');
let feedbackPassword = document.getElementById('form__wrongPassword__message');


/**
 * Initializes the login page by checking if a user is already logged in, checking if the database is empty, removing display none after animation, checking if a user is stored in local storage, changing the password input field icon, disabling the login button if the form is empty, and resetting the wrong login message.
 * @async
 * @function initLogin
 * @returns {Promise<void>} A promise that resolves when all the initialization steps are completed.
 */
async function initLogin() {
    await includeHTML();
    checkOrientation();
    checkForCurrentUserLogin();
    await checkIfDatabaseIsEmpty();
    changeOfDisplayNoneAfterAnimation();
    checkLocalStorageForUserData();
    changePasswordIcon();
    disableLoginButtonIfFormIsEmpty();
    logInIsCorrected();
}

/**
 * Checks if the database collections are empty and resets them if necessary.
 * 
 * Asynchronously fetches users, contacts, and tasks from the database.
 * If any of these collections are empty, it resets the database to the initial
 * dummy data and refetches the collections to ensure they are populated.
 * 
 * @async
 * @function checkIfDatabaseIsEmpty
 * @returns {Promise<void>} A promise that resolves when the check and potential reset are complete.
 */

async function checkIfDatabaseIsEmpty() {
    await getUsers();
    await getContacts();
    await getTasks();
    if (tasks.length === 0 || users.length === 0 || contacts.length === 0) {
        await resetDatabase();
        await getUsers();
        await getContacts();
        await getTasks();
    } else {
        return;
    }
};



/**
 * Changes the display of the overlay and logo elements after the animation is finished.
 *
 * After 2000 milliseconds (2 seconds), the overlay element is given the class 'd-none'
 * and the logo element has the class 'd-none' removed. This causes the overlay to disappear
 * and the logo to appear.
 *
 * @return {void} This function does not return anything.
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
 * Checks local storage for user login data, and if found, updates the current user and the login form accordingly.
 *
 * Retrieves the user data from local storage using the 'currentUser' key.
 * If user data is found, sets the global currentUser variable to the parsed user object and updates the login form to show the user as logged in.
 * If no user data is found, updates the login form to show the user as not logged in.
 *
 * @returns {void} This function does not return anything.
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
 * Retrieves user data from local storage, parses it to a user object, and returns it.
 * If no user data is found or if the data is invalid, returns null.
 * 
 * @returns {Object|null} The user object if data is found and valid, null otherwise.
 */
function checkLocalStorageForLoginData() {
    const userInLocalStorageString = localStorage.getItem('currentUser');
    if (userInLocalStorageString) {
        try {
            const userInLocalStorage = JSON.parse(userInLocalStorageString);
            return userInLocalStorage;
        } catch (error) {
            return null;
        }
    } else {
        return null;
    }
}


/**
 * Updates the appearance of a checkbox element based on a boolean value.
 * 
 * This function takes a checkbox element and a boolean value as parameters.
 * It sets the src attribute of the checkbox to either a checked or unchecked image
 * based on the boolean value, and sets the 'data-checked' attribute of the checkbox
 * to the boolean value as a string.
 * 
 * @param {HTMLElement} checkbox - The checkbox element to update.
 * @param {boolean} isChecked - The boolean value indicating whether the checkbox is checked or not.
 * @returns {void} This function does not return anything.
 */
function updateCheckboxState(checkbox, isChecked) {
    checkbox.src = isChecked ? '../assets/images/global/checkbox-checked.svg' : '../assets/images/global/checkbox.svg';
    checkbox.dataset.checked = isChecked ? 'true' : 'false';
}


/**
 * Updates the state of the login form based on whether the current user is logged in and their data is stored in local storage.
 * 
 * Retrieves the email and password fields of the login form and sets their values to the current user's email and password
 * if the user is logged in and their data is stored in local storage, and clears their values otherwise.
 * Also updates the state of the checkbox element in the login form to reflect whether the user is logged in or not.
 * 
 * @param {boolean} inStorage - A boolean indicating whether the user is logged in and their data is stored in local storage.
 * @returns {void} This function does not return anything.
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
 * Toggles the state of a checkbox element when clicked.
 * 
 * This function retrieves a checkbox element by its ID, determines its current
 * checked state using the 'checkIfCheckBoxIsClicked' function, and then toggles
 * the checkbox state by updating its appearance and data attributes using the
 * 'updateCheckboxState' function.
 *
 * @returns {void} This function does not return a value.
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
        const matchingUser = users.find(user => user.email === email);
        if (!matchingUser) {
            wrongMail();
        } else if (matchingUser.password !== password) {
            wrongPassword();
        } else {
            return matchingUser;
        }
    } catch (error) {
        return null;
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
    checkbox.src = '../assets/images/global/checkbox.svg';
    redirectTo('summary.html');
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
    const matchingUser = await checkLoginValues(email, password);
    if (matchingUser) {
        currentUser = matchingUser;
        saveCurrentUserToSessionStorage(currentUser);
        clearForm('email', 'password');
        const checkbox = document.getElementById('checkbox');
        if (checkIfCheckBoxIsClicked(checkbox)) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
        await addUserToContacts();
        redirectTo('summary.html');
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
 * Adds the 'wrongPassword' class to the container of the password input field 
 * and updates the innerHTML of the feedback message element with an error message.
 */
function wrongPassword() {
    containerPassword.classList.add('wrongPassword');
    feedbackPassword.innerHTML = 'Wrong password Ups! Try again.';
}

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
        return false;
    }
}


/**
 * Adds the current user to the contacts database if not already present.
 *
 * Checks if the current user is already in the contacts list by comparing
 * their ID and email with existing contacts. If the user does not exist in
 * the contacts, their data is sent to the database.
 *
 * @async
 * @returns {Promise<void>} Resolves when the user is added to the contacts or if they already exist.
 */

async function addUserToContacts() {
    const exists = contacts.some(contact =>
        contact.id === currentUser.id || contact.email === currentUser.email
    );

    if (!exists) {
        const { id, ...userData } = currentUser;
        userData.name = `${userData.name} (You)`;
        await putData(`contacts/${id}`, userData);
    } else {
        return;
    }
}
