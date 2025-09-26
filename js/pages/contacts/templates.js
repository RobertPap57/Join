/**
 * Generates the HTML for a contact item in the contacts list.
 *
 * @param {Object} contact - The contact object containing the contact's information.
 * @param {string} contact.id - The unique identifier of the contact.
 * @param {string} contact.color - The background color of the contact item.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email address of the contact.
 * @returns {string} The HTML for the contact item.
 */
function getContactsListHtml(contact) {
    return `
    <li>
    <button onclick="displayContact('${contact.id}')" id="${contact.id}" class="contact">
    <div class="profile-avatar-small d-flex-center" id="avatar-${contact.id}">
    </div>
    <div class="contact-data">
    <p>${contact.name}</p>
    <span>${contact.email}</span>
    </div>
    </button>
    </li>
    `;
}

/**
 * Generates the HTML for a separator with a letter and a separator line.
 *
 * @param {string} letter - The letter to be displayed in the separator.
 * @returns {string} The HTML for the separator with the letter and a separator line.
 */
function getContactsSeparatorHtml(letter) {
    return `
    <li class="section-letter">
      <span aria-hidden="true">${letter}</span>
    <span class="sr-only">Contacts starting with ${letter}</span>
    </li>
    <li class="separator-line" aria-hidden="true"></li>`;
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
 * @returns {string} The HTML for displaying the contact.
 */
function getDisplayContactHtml(contact) {
    return `
        <article class="contact-details" tabindex="-1">
        <p class="sr-only">Press Escape to return to the contacts list.</p>
        <header class="contact-header">
            <div class="profile-avatar font-w-400 contact-img-mobile d-flex-center" id="displayed-avatar-${contact.id}" aria-hidden="true">
            </div>
            <div class="contact-name">
                <h2>${contact.name}</h2>
                <section class="contact-btns" aria-label="Contact actions">
                    <div>
                        <button type="button" onclick="editContact('${contact.id}')" class="edit-contact">
                            <img src="../assets/images/global/edit.svg" alt="">
                            <p>Edit</p>
                        </button>
                    </div>
                    <button type="button" onclick="deleteContact('${contact.id}')" class="delete-contact">
                        <img src="../assets/images/global/delete.svg" alt="">
                        <p>Delete</p>
                    </button>
                </section>
            </div>
        </header>
        <section class="contact-info">
            <h3 class="contact-info-heading">Contact Information</h3>
            <div>
                <span><b>Email</b></span>
                <a href="mailto:${contact.email}">${contact.email}</a>
            </div>
            <div>
                <span><b>Phone</b></span>
                <a class="black-font" href="tel:${contact.phone}">${contact.phone}</a>
            </div>
        </section>
        <dialog id="contact-menu" class="contact-menu" aria-label="Contact options">
            <button onclick="editContact('${contact.id}')" class="contact-options-btns">
                <img src="../assets/images/global/edit.svg" alt="">
                <span>Edit</span>
            </button>
            <button onclick="deleteContact('${contact.id}')" class="contact-options-btns">
                <img src="../assets/images/global/delete.svg" alt="">
                <span>Delete</span>
            </button>
        </dialog>
    </article>
    `;
}
