const containerIds = ['to-do', 'in-progress', 'await-feedback', 'done'];
let selectedContainerIndex = null;
let draggedTaskId = null;
let draggedTaskStatus = null;
let ghostElement = null;
let cardDisabled = false;


/**
 * Enables long hold detection on an element. If the element is touched or clicked and held for a certain amount of time, the long hold event will be triggered.
 * The long hold event will be triggered on touchstart, mousedown, touchmove, mousemove, and mouseup events.
 * The long hold event will not be triggered on desktop devices with a precise pointer.
 * @param {HTMLElement} element - The element to enable long hold detection on.
 */
function enableLongHoldDetection(element) {
    if (!element) return;
    if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 1400) {
        bindEventListenerOnce(element, "touchstart", startHold, "longHold");
        bindEventListenerOnce(element, "touchend", endHold, "longHold");
        bindEventListenerOnce(element, "touchmove", endHoldIfMoving, "longHold");
        bindEventListenerOnce(element, 'mousedown', startHold, 'longHold');
        bindEventListenerOnce(element, 'mouseup', endHold, 'longHold');
        bindEventListenerOnce(element, 'mouseleave', endHold, 'longHold');
        bindEventListenerOnce(element, 'mousemove', endHoldIfMoving, 'longHold');
    }
}


/**
 * Handles long hold event on task containers.
 * Disables dragging, starts a timer, and sets the long hold state.
 * If the timer is not cleared, it sets the long hold state to true, enables dragging, and rotates the element.
 * @param {DragEvent} event - The event object from the long hold start event.
 */
function startHold(event) {
    const element = event.currentTarget;
    clearHoldTimer(element);
    element.draggable = false;
    element.dataset.holdTimeout = setTimeout(() => {
        element.dataset.longHold = "true";
        element.draggable = true;
        element.style.transform = 'rotate(5deg)';
    }, 500);
}


/**
 * Ends the long hold detection on an element.
 * Clears the long hold timer, resets the element's long hold state, and resets the element's transform.
 * @param {DragEvent} event - The event object from the long hold end event.
 */
function endHold(event) {
    const element = event.currentTarget;
    if (element.dataset.longHold !== "true") {
        clearHoldTimer(element);
    }
}


/**
 * Checks if the element is being moved while holding down on it.
 * If the element is being moved, it clears the long hold timer.
 * This prevents the long hold from being triggered when the user is trying to drag the element.
 * @param {DragEvent} event - The drag event
 */
function endHoldIfMoving(event) {
    const element = event.currentTarget;
    if (element.dataset.longHold === "false") {
        clearHoldTimer(element);
    }
}


/**
 * Clears the long hold timer for a given element.
 * If the element has a long hold timeout set, it clears the timeout.
 * Resets the element's long hold state, disables dragging, and resets the element's transform.
 * @param {HTMLElement} element - The element to clear the long hold timer for.
 */
function clearHoldTimer(element) {
    if (element.dataset.holdTimeout) {
        clearTimeout(element.dataset.holdTimeout);
    }
    element.dataset.holdTimeout = null;
    element.dataset.longHold = "false";
    element.style.transform = "";
    element.draggable = false;
}


/**
 * Prevents drag events on all elements with the 'download-attachment-btn' class.
 * This disables dragging for download buttons to avoid unintended behavior.
 */
function blockDragOnDownloadBtn() {
    document.querySelectorAll('.download-attachment-btn').forEach(link => {
        link.addEventListener('dragstart', event => {
            event.preventDefault();
        });
    });
}


/**
 * Handles drop event for task containers.
 * Updates task status when dropped in a different container.
 * @param {DragEvent} event - The drop event
 */
async function handleDrop(event) {
    event.preventDefault();
    stopDrag();
    if (draggedTaskId) {
        const container = event.currentTarget;
        const containerStatus = container.id;
        if (containerStatus !== draggedTaskStatus) {
            await updateTaskStatus(draggedTaskId, container);
        }
        draggedTaskId = null;
        removeShadowElements();
    }
}


/**
 * Cancels drag operation by resetting all related variables and removing shadow elements.
 * Removes event listener for trapping tab while dragging.
 * Resets transform and aria-grabbed attributes for all task cards.
 */
function cancelDrag() {
    draggedTaskId = null;
    draggedTaskStatus = null;
    selectedContainerIndex = null;
    removeShadowElements();
    document.removeEventListener("keydown", trapTabWhileDragging, true);
    const cards = document.querySelectorAll('.task-card');
    cards.forEach(card => {
        card.style.transform = '';
        card.removeAttribute('aria-grabbed');
    });
}


/**
 * Scrolls a container to its maximum position, either horizontally or vertically
 * depending on the screen width.
 * @param {HTMLElement} container - The container element to be scrolled.
 * @param {boolean} smooth - Whether to scroll smoothly or not. Default is true.
 */
function scrollToContainerMax(container, smooth = true) {
    if (window.innerWidth > 1400) {
        container.scrollTo({
            top: container.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
    } else {
        container.scrollTo({
            left: container.scrollWidth,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }
}


/**
 * Enables automatic scrolling when the user is dragging an element near the edge of the window.
 * This is useful for providing a seamless experience when dragging elements that are larger than the window.
 * Listens to 'dragover' and 'touchmove' events and scrolls the window when the user is near the edge of the window.
 */
function enableAutoScrollOnDrag() {
    document.addEventListener('dragover', scrollOnDragMove);
    document.addEventListener('touchmove', scrollOnDragMove);
}


/**
 * Scrolls the window when the user is dragging an element near the top or bottom of the window.
 * This is useful for providing a seamless experience when dragging elements that are larger than the window.
 * @param {Event} e - The drag event or touch event.
 * If the user is dragging near the bottom of the window, the function scrolls the window down.
 * If the user is dragging near the top of the window, the function scrolls the window up.
 * The amount of scrolling is proportional to the distance between the user's position and the edge of the window.
 */
function scrollOnDragMove(e) {
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    const windowHeight = window.innerHeight;
    const distBottom = windowHeight - y;
    const distTop = y;
    if (distBottom < 150) {
        const extraSpeed = (150 - distBottom) * 1;
        const speed = 100 + extraSpeed;
        window.scrollBy({ top: speed, behavior: 'auto' });
    }
    if (distTop < 250) {
        const extraSpeed = (250 - distTop) * 1;
        const speed = 100 + extraSpeed;
        window.scrollBy({ top: -speed, behavior: 'auto' });
    }
}


/**
 * Scrolls a board row into view if it is not already visible.
 * @param {HTMLElement} container - The container element to be scrolled into view.
 * If the container is not provided or if the window width is greater than 1400, the function does nothing.
 * If the container is partially visible, the function scrolls it into full view.
 * If the container is fully visible, the function does nothing.
 */
function scrollBoardRowIntoView(container) {
    if (!container || window.innerWidth > 1400) return;
    const rect = container.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    if (rect.bottom > viewHeight) {
        window.scrollBy({
            top: rect.bottom - viewHeight + 20,
            behavior: "smooth"
        });
    }
    if (rect.top < 96) {
        window.scrollBy({
            top: rect.top - 96,
            behavior: "smooth"
        });
    }
}


/**
 * Shows shadow element in the specified container at the appropriate position.
 * @param {HTMLElement} container - The container to show shadow element in
 */
function showShadowElement(container) {
    hideShadowElement(container);
    const shadowElement = createShadowElement();
    container.appendChild(shadowElement);
}


/**
 * Hides shadow element from the specified container by removing it from DOM.
 * @param {HTMLElement} container - The container to remove shadow element from
 */
function hideShadowElement(container) {
    const existingShadow = container.querySelector('.task-card-shadow');
    if (existingShadow) {
        existingShadow.remove();
    }
}


/**
 * Removes all shadow elements from all task containers.
 */
function removeShadowElements() {
    const shadows = document.querySelectorAll('.task-card-shadow');
    shadows.forEach(shadow => shadow.remove());
}


/**
 * Creates a shadow element for drop indication during drag operations.
 * @returns {HTMLElement} The created shadow element with disabled pointer events
 */
function createShadowElement() {
    const shadowElement = document.createElement('div');
    shadowElement.className = 'task-card-shadow';
    shadowElement.style.pointerEvents = 'none';
    return shadowElement;
}