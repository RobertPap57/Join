
/**
 * Initializes the legal notice section by including HTML content,
 * hides the navigation bar, header icons, and highlights the legal notice link.
 */
function initLegalNotice() {
    includeHTML().then(() => {
        hideNavBar();
        hideHeaderIcons();
        highlightLegalNotice();
    });
}


/**
 * Navigates the user back to the previous page in the browsing history.
 */
function goBack() {
    window.history.back();
}
