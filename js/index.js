"use strict";

/**
 * Initializes the index page by checking for a current user.
 *
 * Checks if there is a current user logged in using session storage.
 * If a current user exists, redirects to the summary page.
 * Otherwise, redirects to the login page.
 */
function initIndex() {
    checkForCurrentUser() ? redirectTo('summary.html') : redirectTo('login.html');
}
