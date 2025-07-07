let isDragging = false, startX, scrollLeft, lastX, velocity = 0, inertiaId;

function startDrag(e) {
    const list = getList();
    isDragging = true;
    startX = getPageX(e) - list.offsetLeft;
    scrollLeft = list.scrollLeft;
    lastX = getPageX(e);
    stopInertia();
    addDragListeners();
}

function dragMove(e) {
    if (!isDragging) return;
    const list = getList();
    const x = getPageX(e) - list.offsetLeft;
    const walk = (x - startX) * -1;
    velocity = getPageX(e) - lastX;
    lastX = getPageX(e);
    list.scrollLeft = scrollLeft + walk;
}

function stopDrag() {
    isDragging = false;
    removeDragListeners();
    startInertia();
}

function startInertia() {
    const list = getList();
    function inertia() {
        if (Math.abs(velocity) < 0.5) return;
        list.scrollLeft -= velocity;
        velocity *= 0.95;
        inertiaId = requestAnimationFrame(inertia);
    }
    inertia();
}

function stopInertia() {
    if (inertiaId) cancelAnimationFrame(inertiaId);
}

function getList() {
    return document.getElementById('attachmentsList');
}

function getPageX(e) {
    return e.touches ? e.touches[0].pageX : e.pageX;
}

function addDragListeners() {
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', dragMove);
    document.addEventListener('touchend', stopDrag);
}

function removeDragListeners() {
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', stopDrag);
}
