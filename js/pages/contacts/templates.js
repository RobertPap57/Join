/**
 * Generates the HTML for a contact item in the contacts list.
 *
 * @param {Object} contact - The contact object containing the contact's information.
 * @param {string} contact.id - The unique identifier of the contact.
 * @param {string} contact.color - The background color of the contact item.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email address of the contact.
 * @return {string} The HTML for the contact item.
 */
function getContactsListHtml(contact) {
    return `
    <div onclick="displayContact('${contact.id}')" id="${contact.id}" class="contact">
    <div class="profile-avatar-small d-flex-center" id="avatar-${contact.id}">
    </div>
    <div class="contact-data">
    <p>${contact.name}</p>
    <a href="#">${contact.email}</a>
    </div>
    </div>
    `;
}

/**
 * Generates the HTML for a separator with a letter and a separator line.
 *
 * @param {string} letter - The letter to be displayed in the separator.
 * @return {string} The HTML for the separator with the letter and a separator line.
 */
function getContactsSeparatorHtml(letter) {
    return `
    <div class="section-letter">
    ${letter}
    </div>
    <div class="separator-line"></div>`;
}

/**
 * Generates the HTML for displaying a contact.
 *
 * @param {Object} contact - The contact object containing the contact's information.
 * @param {string} contact.color - The background color of the contact's icon.
 * @param {string} contact.initials - The initials of the contact.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email of the contact.
 * @param {string} contact.phone - The phone number of the contact.
 * @param {number} contact.id - The ID of the contact.
 * @return {string} The HTML for displaying the contact.
 */
function getDisplayContactHtml(contact) {
    return `
    <div class="contact-header">
    <div class="profile-avatar contact-img-mobile d-flex-center" id="displayed-avatar-${contact.id}"></div>
    <div class="contact-name">
        <h2>${contact.name}</h2>
        <div class="contact-btns">
        <div>
            <div onclick="editContact('${contact.id}')" class="edit-contact">
                <img src="../assets/images/global/edit.svg" alt="">
                <p>Edit</p>
            </div>
            </div>
            <div onclick="deleteContact('${contact.id}')" class="delete-contact">
                <img src="../assets/images/global/delete.svg" alt="">
                <p>Delete</p>
            </div>
        </div>
    </div>
</div>
<p class="contact-info-p">Contact Information</p>
<div class="contact-info">
    <div>
        <p>Email</p>
        <a href="mailto:${contact.email}">${contact.email}</a>
    </div>
    <div>
        <p>Phone</p>
        <a class="black-font" href="tel:${contact.phone}">${contact.phone}</a>
    </div>
</div>

 <div id="mobile-modal" class="mobile-modal d-none">
        <div id="contact-menu" class="contact-menu">
            <div onclick="editContact('${contact.id}')" class="contact-options-btns">
                <img src="../assets/images/global/edit.svg" alt="">
                <p>Edit</p>
            </div>
            <div onclick="deleteContact('${contact.id}')" class="contact-options-btns">
                <img src="../assets/images/global/delete.svg" alt="">
                <p>Delete</p>
            </div>
        </div>
    </div>
    `;
}

