/**
 * Navigation component functionality and link management
 */

/**
 * Highlights the navigation bar link with the given id.
 * @param {string} link - Id of the link to be highlighted.
 */
function highlightLink(link) {
    document.getElementById(link + '-link').classList.add('link-active');
    if (!['privacy-policy', 'legal-notice', 'login'].includes(link)) {
        document.getElementById(link + '-img').src = "../assets/images/components/nav/" + link + "-white.svg";
    } else return;
}

/**
 * Hides the navigation bar links if no current user is logged in.
 */
function hideNavBar() {
    let navLinks = document.getElementById('nav-links');
    let logInLink = document.getElementById('login-link');
    if (!currentUser.name) {
        navLinks.classList.add('d-none');
        logInLink.classList.remove('d-none');
    } else {
        navLinks.classList.remove('d-none');
        logInLink.classList.add('d-none');
    }
}
