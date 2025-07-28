async function initBoard() {
    await includeHTML();
    checkOrientation();
    checkForCurrentUser() ? "" : redirectTo('login.html');
    displayHeaderAvatar();
    highlightLink('board');
}



function getTaskCardHTML(task){
    return `<article class="task-card">
                            <header>
                                <p class="task-category">User Story</p>
                            </header>

                            <h3>${task.title}</h3>

                            <p class="task-desc">Task description</p>

                            <div class="task-progress" role="progressbar" aria-valuenow="2" aria-valuemin="0"
                                aria-valuemax="5">
                                2/5 subtasks
                            </div>

                            <footer>
                                <div class="assigned-avatars" aria-label="Assigned to: John, Lisa, Mike">
                                    <!-- avatar icons -->
                                </div>
                                <div class="task-priority" aria-label="Priority: High">
                                    <!-- icon -->
                                </div>
                            </footer>
                        </article>`;
} 