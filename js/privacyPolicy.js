async function initPrivacyPolicy() {
    await includeHTML()
    hideNavBar()
    hideHeaderIcons();
    highlightLink('privacy-policy');

}

function goBack() {
    window.history.back();
}

