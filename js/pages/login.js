/**
 * Initializes the login page.
 * - Checks screen orientation
 * - Loads shared HTML components
 * - Ensures database is initialized
 * - Runs the intro animation
 * - Sets up the auth form in "login" mode
 */
async function initLogin() {
    checkScreenOrientation();
    await includeHTML();
    await checkIfDatabaseIsEmpty();
    handleIntroAnimation();
    setUpAuthForm('login');
}

/**
 * Checks if the users, contacts, or tasks databases are empty.
 * If any are empty, resets the database and reloads the data.
 * @async
 * @returns {Promise<void>}
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
 * Handles the intro animation by hiding the overlay and intro logo,
 * and showing the header logo after a short delay.
 */
function handleIntroAnimation() {
    const overlay = document.querySelector('.intro-overlay');
    const introLogo = document.querySelector('.intro-logo');
    const headerLogo = document.querySelector('.header-logo');
    if (overlay && introLogo && headerLogo) {
        setTimeout(() => {
            overlay.classList.add('d-none');
            introLogo.classList.add('d-none');
            headerLogo.classList.remove('d-none');
        }, 1000);
    }
}

