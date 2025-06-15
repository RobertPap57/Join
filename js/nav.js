/**
 * Highlights the navigation bar link with the given id.
 * @param {string} link - Id of the link to be highlighted.
 */
function highlightLink(link) {
    document.getElementById(link + '-link').classList.add('link-active');
    document.getElementById(link + '-img').src = "./assets/img/nav_img/" + link + "_icon_active.svg";
}


/**
 * Hides the navigation bar links if no current user is logged in.
 */
function hideNavBar() {
    let navLinks = document.getElementById('nav-links');
    if (!currentUser.name) {
        navLinks.classList.add('d-none');
    } else {
        navLinks.classList.remove('d-none');
    }
}
