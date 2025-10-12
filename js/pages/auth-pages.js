/**
 * Initializes an authentication page (login or signup).
 *
 * @param {('login'|'signup')} page - The type of auth page to initialize.
 *                                    'login' runs DB check and intro animation,
 *                                    'signup' only sets up the form.
 */
async function initAuthPage(page) {
    checkScreenOrientation();
    if (page === 'login') {
        handleIntroAnimation();
        await checkIfDatabaseIsEmpty();
    } else {
        await getUsers();
    }
    await includeHTML();
    setUpAuthForm(page);
}


/**
 * Checks if the users, contacts, or tasks databases are empty.
 * If any are empty, resets the database and reloads the data.
 * @async
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
    const hasPlayed = sessionStorage.getItem('loginAnimationPlayed');
    const headerLogo = document.querySelector('.header-logo');
    const section = document.getElementById('animation-section');
    if (!hasPlayed) {
        section.classList.remove('d-none');
        headerLogo.classList.add('d-none');
        setTimeout(() => {
            section.classList.add('d-none');
            headerLogo.classList.remove('d-none');
            sessionStorage.setItem('loginAnimationPlayed', 'true');
        }, 1000);
    }
}


/**
 * Shows the confirmation popup dialog for user registration.
 * The dialog is shown after a short delay to allow for a smooth animation.
 */
function showToastMsg() {
    const wrapper = document.getElementById('toast-msg-wrapper');
    const toastMsg = document.querySelector('.toast-msg');
    const modal = document.querySelector('.toast-modal');
    wrapper.classList.remove('d-none');
    setTimeout(() => {
        toastMsg.classList.add('toast-msg-slide-in');
        modal.classList.add('show');
    }, 10);

};