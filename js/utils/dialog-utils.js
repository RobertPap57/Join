/**
 * Traps focus inside a dialog element when the Tab key is pressed.
 * - Prevents focus from leaving the dialog when Tab is pressed with the Shift key.
 * - Prevents focus from leaving the dialog when Tab is pressed without the Shift key.
 * - Focuses the first focusable element inside the dialog when Tab is pressed with the Shift key and the user is currently focused on the last focusable element.
 * - Focuses the last focusable element inside the dialog when Tab is pressed without the Shift key and the user is currently focused on the first focusable element.
 */
function trapFocusInDialogEvent() {
    const dialogs = document.querySelectorAll('dialog');
    if (dialogs.length === 0) return;
    dialogs.forEach((dialog) => {
        const focusable = getFocusableElements(dialog);
        if (focusable.length === 0) return;
        bindEventListenerOnce(dialog, 'keydown', (e) => trapFocusInDialog(e, focusable), 'trap_focus');
    });
}


/**
 * Returns an array of focusable elements within a given container element.
 * Elements that are disabled, have aria-hidden="true", or are not visible will be excluded.
 * @param {Element} container - The container element to search for focusable elements.
 * @returns {Array<Element>} - An array of focusable elements within the given container element.
 */
function getFocusableElements(container) {
    return Array.from(
        container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
    ).filter(el => !(el.disabled || el.getAttribute("aria-hidden") === "true" || !isVisible(el)));
}


/**
 * Returns true if the given element is visible, false otherwise.
 * An element is considered visible if its display CSS property is not "none" and its visibility CSS property is not "hidden".
 * @param {Element} el - The element to check for visibility.
 * @returns {boolean} - True if the element is visible, false otherwise.
 */
function isVisible(el) {
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
}


/**
 * Traps the focus in the dialog when the Tab key is pressed.
 * If the Shift key is pressed and the user is currently focused on the first focusable element, it will move the focus to the last focusable element.
 * If the Shift key is not pressed and the user is currently focused on the last focusable element, it will move the focus to the first focusable element.
 * @param {KeyboardEvent} e - The event triggered by the Tab key press.
 * @param {Array<Element>} focusable - An array of focusable elements within the dialog.
 */
function trapFocusInDialog(e, focusable) {
    if (e.key === 'Tab') {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }
}


/**
 * Prevents dialogs from closing when pressing Enter or Space on buttons inside
 * any <dialog> element, and triggers the button's click event instead.
 * This works for both existing and dynamically added dialogs/buttons.
*/
function enableDialogKeyboardButtons() {
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof HTMLButtonElement) {
            const dialog = e.target.closest('dialog');
            if (dialog) {
                e.preventDefault();
                e.stopPropagation();
                e.target.dispatchEvent(new MouseEvent("click", {
                    bubbles: false,
                    cancelable: true,
                    view: window
                }));
            }
        }
    });
}


/**
 * Attaches an event listener to a dialog element that closes the dialog when a click occurs outside its bounds.
 *
 * @param {HTMLElement} dialog - The dialog element to monitor for outside clicks.
 * @param {Function} onClose - The callback function to execute when a click outside the dialog is detected.
*/
function closeDialogOnClickOutside(dialog, onClose) {
     const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        bindEventListenerOnce(dialog, 'touchstart', (e) => {
            detectTouchOutside(dialog, onClose, e);
        });
    } else {
        bindEventListenerOnce(dialog, 'click', (e) => {
            detectClickOutide(dialog, onClose, e);
        });
    }
}


/**
 * Detects touch events outside a given dialog element and triggers the onClose callback.
 * @param {HTMLElement} dialog - The dialog element to detect touches outside of.
 * @param {Function} onClose - Callback function executed when a touch occurs outside the dialog.
 * @param {TouchEvent|MouseEvent} e - The event object from the touch or mouse interaction.
 */
function detectTouchOutside(dialog, onClose, e) {
    const rect = dialog.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const clickedInside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (!clickedInside) {
        onClose();
    }
}


/**
 * Detects click events outside a given dialog element and triggers the onClose callback.
 * @param {HTMLElement} dialog - The dialog element to detect clicks outside of.
 * @param {Function} onClose - Callback function executed when a click occurs outside the dialog.
 * @param {MouseEvent} e - The mouse event object.
 */
function detectClickOutide(dialog, onClose, e) {
    const rect = dialog.getBoundingClientRect();
    const clickedInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
    if (!clickedInside) {
        onClose();
    }
}


/**
 * Attaches an event listener to a dialog element to handle the 'cancel' event (typically triggered by pressing the Escape key).
 * Prevents the default dialog close behavior and calls the provided onClose callback instead.
 *
 * @param {HTMLDialogElement} dialog - The dialog element to attach the event listener to.
 * @param {Function} onClose - The callback function to execute when the dialog is requested to close.
 */
function closeDialogOnEsc(dialog, onClose) {
    if (!dialog) return;
    dialog.addEventListener('cancel', (e) => {
        e.preventDefault();
        onClose();
    });
}


/**
 * Opens a dialog with optional animation.
 * @param {HTMLDialogElement} dialog - The dialog element.
 * @param {boolean} [animate=false] - Whether to add an animation class.
 */
function openDialog(dialog, animate = false) {
    if (!dialog) return;
    if (animate) dialog.classList.add('animate-dialog');
    else dialog.classList.remove('animate-dialog');
    dialog.showModal();
    dialog.classList.add('open-dialog');
}


/**
 * Closes a dialog and removes animation classes if present.
 * @param {HTMLDialogElement} dialog - The dialog element.
 */
function closeDialog(dialog) {
    if (dialog.classList.contains('animate-dialog')) {
        dialog.classList.remove('open-dialog');
        setTimeout(() => {
            dialog.close();
            dialog.classList.remove('animate-dialog');
        }, 125);
    } else {
        dialog.classList.remove('open-dialog');
        dialog.close();
    }
}