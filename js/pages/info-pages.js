/**
 * Initializes the legal notice page by including HTML content,
 * hiding navigation and header icons, and highlighting the legal notice link.
 */
async function initLegalNotice() {
    await includeHTML();
    hideNavBar();
    hideHelpIcon();
    checkForCurrentUser() ? initHeader() : hideHeaderActions();
    highlightLink('legal-notice');
}


/**
 * Initializes the privacy policy page by including HTML content,
 * hiding navigation and header icons, and highlighting the privacy policy link.
 */
async function initPrivacyPolicy() {
    await includeHTML();
    hideNavBar();
    hideHelpIcon();
    checkForCurrentUser() ? initHeader() : hideHeaderActions();
    highlightLink('privacy-policy');
}


/**
 * Initializes the help section by including HTML content,
 * hiding the help icon, and updating the header profile initials.
 * Redirects to the login page if no user is logged in.
 */
async function initHelp() {
    await includeHTML();
    checkScreenOrientation();
    hideHelpIcon();
    checkForCurrentUser() ? null : redirectTo('login.html');
    initHeader();
}
