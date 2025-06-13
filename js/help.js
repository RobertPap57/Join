/**
 * Initializes the help section by including HTML content,
 * hiding the help icon, and updating the header profile initials.
 */
function initHelp() {
    includeHTML().then(() => {
        hideHelpIcon();
        updateHeaderProfileInitials();
    });
    checkForCurrentUser() ? null : redirectTo('login.html');
}


/**
 * Navigates the user back to the previous page in the browsing history.
 */
function goBack() {
    window.history.back();
}


/**
 * Hides the help icon element.
 */
function hideHelpIcon() {
    document.getElementById('hide-help-icon').classList.add('d-none');
}
