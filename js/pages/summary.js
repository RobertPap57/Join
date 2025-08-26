/**
 * Initializes the summary page by including HTML, checking orientation,
 * verifying the current user, initializing the header, highlighting the summary link,
 * fetching tasks, and initializing popups.
 * Redirects to the login page if no current user is found.
 */
async function initSummary() {
  await includeHTML();
  checkOrientation();
  checkForCurrentUser() ? checkForGreeting() : redirectTo('login.html');
  initHeader();
  highlightLink('summary');
  await getTasks();
  initPopup();
}

/**
 * Checks if a greeting has already been shown in the current session.
 * If not, updates the greeting text, triggers the greeting animation,
 * and marks the greeting as shown in sessionStorage.
 * If already shown, only updates the greeting text.
 */
function checkForGreeting() {
  if (sessionStorage.getItem('greeting')) {
    updateGreetingText();
  } else {
    updateGreetingText();
    sessionStorage.setItem('greeting', 'true');
  }
}

/**
 * Updates the greeting text and user name displayed on the summary page.
 * Clears the current content of the greeting and user name elements,
 * then sets them using helper functions.
 */
function updateGreetingText() {
  const userName = document.getElementById('user-name');
  const greetingMessage = document.getElementById('greeting-message');
  userName.innerText = '';
  greetingMessage.innerText = '';
  setGreetingText(greetingMessage);
  setCurrentUserName(userName);
}

/**
 * Sets the greeting message based on the current time of day.
 *
 * @param {HTMLElement} greetingMessage - The DOM element where the greeting text will be displayed.
 */
function setGreetingText(greetingMessage) {
  const greetings = {
    morning: "Good morning,",
    afternoon: "Good afternoon,",
    evening: "Good evening,"
  };
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? greetings.morning : (currentTime < 18 ? greetings.afternoon : greetings.evening);
  greetingMessage.innerText = greeting;
}

/**
 * Sets the inner text of the provided DOM element to the capitalized name of the current user.
 *
 * @param {HTMLElement} userName - The DOM element where the user's name will be displayed.
 */
function setCurrentUserName(userName) {
  if (currentUser) {
    userName.innerText = capitalizeFirstLetter(currentUser['name']);
  }
}


/**
 * Renders the summary section by counting tasks based on specific status and priority mappings,
 * updating the summary display with these counts, the total number of tasks, and the upcoming deadline.
 *
 * Iterates through predefined mappings for task statuses and priorities, counts the number of tasks
 * matching each mapping, and updates the summary UI accordingly.
 */
function renderSummary() {
  const mappings = [
    { key: "status", value: "to-do" },
    { key: "status", value: "done" },
    { key: "status", value: "in-progress" },
    { key: "status", value: "await-feedback" },
    { key: "priority", value: "urgent" }
  ];
  mappings.forEach(({ key, value }) => {
    const count = countTasks(key, value);
    renderDataToSummary(value, count);
  });
  renderDataToSummary("tasks", tasks.length);
  renderUpcomingDeadline();
}

/**
 * Counts the number of tasks where the specified key matches the given value (case-insensitive).
 *
 * @param {string} key - The property name of the task object to compare.
 * @param {string} value - The value to match against the task's property.
 * @returns {number} The count of tasks matching the specified key and value.
 */
function countTasks(key, value) {
  return tasks.filter(task => task[key].toLowerCase() === value.toLowerCase()).length;
}

/**
 * Updates the inner text of a DOM element with the specified ID to display a given number.
 *
 * @param {string} id - The ID of the DOM element to update.
 * @param {number} number - The number to display in the element.
 */
function renderDataToSummary(id, number) {
  const element = document.getElementById(id);
  if (element) {
    element.innerText = number;
  }
}

/**
 * Returns the most urgent task with the earliest due date from a list of tasks.
 *
 * @param {Array<Object>} tasks - The array of task objects to search through.
 * @param {string} tasks[].priority - The priority level of the task (e.g., 'urgent').
 * @param {string|Date} tasks[].dueDate - The due date of the task.
 * @returns {Object|null} The most urgent task with the earliest due date, or null if no urgent tasks are found.
 */
function getMostUrgentTask(tasks) {
  const urgentTasks = tasks.filter(task => task.priority.toLowerCase() === 'urgent');
  if (urgentTasks.length === 0) {
    return null;
  }
  return urgentTasks.reduce((earliestTask, currentTask) => {
    return new Date(currentTask.dueDate) < new Date(earliestTask.dueDate) ? currentTask : earliestTask;
  });
}

/**
 * Formats a date string into a human-readable format (e.g., "January 1, 2024").
 *
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string in "Month Day, Year" format.
 */
function formatDateString(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}

/**
 * Renders the due date of the most urgent upcoming task.
 * If there are no urgent tasks, displays a message indicating so.
 *
 * Depends on:
 * - getMostUrgentTask(tasks): Returns the most urgent task object or null/undefined.
 * - formatDateString(date): Formats a date string for display.
 * - renderData(elementId, data): Renders data to a specified element.
 */
function renderUpcomingDeadline() {
  const mostUrgentTask = getMostUrgentTask(tasks);
  if (mostUrgentTask) {
    const mostUrgentTasksDueDate = formatDateString(mostUrgentTask.dueDate);
    renderData("upcoming-deadline", mostUrgentTasksDueDate);
  } else {
    renderData("upcoming-deadline", 'no urgent tasks');
  }
}
