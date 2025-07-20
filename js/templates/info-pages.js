/**
 * Initialization functions for various informational pages.
 * This file contains functions to set up the legal notice, privacy policy, and help pages.
 */

/**
 * Initializes the legal notice page by including HTML content,
 * hiding navigation and header icons, and highlighting the legal notice link.
 *
 * @async
 */
async function initLegalNotice() {
    await includeHTML();
    hideNavBar();
    hideHeaderIcons();
    highlightLink('legal-notice');
}

/**
 * Initializes the privacy policy page by including HTML content,
 * hiding navigation and header icons, and highlighting the privacy policy link.
 *
 * @async
 */
async function initPrivacyPolicy() {
    await includeHTML();
    hideNavBar();
    hideHeaderIcons();
    highlightLink('privacy-policy');
}

/**
 * Initializes the help section by including HTML content,
 * hiding the help icon, and updating the header profile initials.
 * Redirects to the login page if no user is logged in.
 *
 * @async
 */
async function initHelp() {
   await includeHTML();
   checkOrientation();
   hideHelpIcon();
   checkForCurrentUser() ? null : redirectTo('login.html');
   displayProfileIconInitials();
}


