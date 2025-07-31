/**
 * HTML Templates for Add Task Feature
 * Contains all HTML generation functions for contacts, subtasks, attachments, and UI elements
 */

/**
 * Returns HTML for a selected contact avatar.
 * @param {Object} contact
 * @returns {string}
 */
function getSelectedContactHTML(contact) {
    return `
        <div class="cicle" style="background-color: ${contact.color}">${createNameInitials(contact.name)}</div>
    `;
}

/**
 * Generates HTML for a subtask list item.
 * @param {string} item - Subtask text
 * @param {number} index - Index in subtasks array
 * @returns {string} HTML string for subtask list item
 */
function getSubtaskListItemHTML(item, index) {
    return `
        <li class="subtask-list-item" data-index="${index}">
            <p class="li-text"> 
            ${item}
            </p>
            <div class="subtask-edit-icon-div">
                <div class="edit-subtask-btn">
                    <img src="../assets/images/global/edit.svg" alt="edit">
                </div>
                <div class="subtask-divider-2"></div>
                <div class="delete-subtask-btn">
                    <img src="../assets/images/global/delete.svg" alt="delete">
                </div>
            </div>
        </li>
    `;
}

/**
 * Generates HTML for editing a subtask.
 * @param {string} text - Current subtask text
 * @returns {string} HTML string for edit mode
 */
function getEditSubtaskHTML(text) {
    return `
        <input class="edit-subtask-input" type="text" value="${text}">
        <div class="edit-subtask-button-div">
            <span class="delete-subtask-btn edit"><img src="../assets/images/global/delete.svg"></span>
            <div class="subtask-divider"></div>
            <span class="confirm-subtask-edit-btn"><img src="../assets/images/global/check.svg"></span>
        </div>
    `;
}

/**
 * Returns HTML for an attachment item.
 * @param {object} attachment - The attachment object.
 * @param {string} attachment.base64 - Base64 encoded image data
 * @param {string} attachment.filename - Original filename
 * @param {number} index - Index in attachments array
 * @param {string} buttonType - 'delete' or 'download'
 * @returns {string} HTML string for attachment item
 */
function getAttachmentHtml(attachment, index, buttonType) {
    const buttonHtml = buttonType === 'delete'
        ? `<button class="delete-attachment-btn" onclick="deleteAttachment(${index})">
                <img src="../assets/images/global/delete-white.svg" alt="Delete">
            </button>`
        : `<a href="${attachment.base64}" download="${attachment.name}" class="download-attachment-btn">
                <img src="../assets/images/pages/boards/download-white.svg" alt="Download">
            </a>`;

    return `
        <li class="attachment-item">
            <img class="attachment-img" src="${attachment.base64}" draggable="false" alt="">
            ${buttonHtml}
            <span class="attachment-name" draggable="false">${attachment.name}</span>
        </li>
    `;
}

/**
 * Generates an HTML string for a contact list item, including selection state.
 *
 * @param {Object} contact - The contact object containing details.
 * @param {number|string} contact.id - The unique identifier for the contact.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.color - The color used for the contact's avatar.
 * @param {boolean} isSelected - Indicates if the contact is selected.
 * @returns {string} The HTML string representing the contact list item.
 */
function getContactHTML(contact, isSelected) {
    return `
        <li class="list-item assigned-to ${isSelected ? 'checked' : ''}" data-id="${contact.id}">
            <div class="list-item-name">
                <div class="cicle" style="background-color: ${contact.color}">${createNameInitials(contact.name)}</div>
                <span>${contact.name}</span>
            </div>
            <img class="checkbox ${isSelected ? 'checked' : ''}" src="../${isSelected ? 'assets/images/pages/add-task/checkbox-checked.svg' : 'assets/images/global/checkbox.svg'}" alt="">
        </li>
    `;
}