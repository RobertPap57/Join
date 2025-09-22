const summaryIcons = [
  { id: 'to-do-icon', base: '../assets/images/pages/summary/to-do.svg' },
  { id: 'done-icon', base: '../assets/images/pages/summary/done.svg' },
  { id: 'urgent-icon', base: '../assets/images/pages/summary/urgent.svg' }
];

/**
 * Initializes the summary page by including HTML, checking orientation,
 * verifying the current user, initializing the header, highlighting the summary link,
 * fetching tasks, and initializing popups.
 * Redirects to the login page if no current user is found.
 */
async function initSummary() {
  checkForCurrentUser() ? checkForGreeting() : redirectTo('login.html');
  await includeHTML();
  checkScreenOrientation();
  initHeader();
  highlightLink('summary');
  await getTasks();
  initPopup();
  renderSummary();
  setIconSrc();
  preventFormSubmitOnEnter();
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
  return tasks.reduce((earliest, task) => {
    if (task.priority.toLowerCase() !== 'urgent') return earliest;
    if (!earliest) return task;
    return new Date(task.dueDate) < new Date(earliest.dueDate) ? task : earliest;
  }, null);
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
    renderDataToSummary("upcoming-deadline", mostUrgentTasksDueDate);
  } else {
    renderDataToSummary("upcoming-deadline", 'no urgent tasks');
  }
}

/**
 * Updates the `src` attribute of an image element based on its ID, the current window width, 
 * and an optional state (e.g., 'hover'). 
 * 
 * - For images other than 'urgent-icon', if the window width is less than 767px, 
 *   the source is modified to use the '-mobile.svg' or '-mobile-hover.svg' variant.
 * - If the state is 'hover', the source is modified to use the '-hover.svg' or '-mobile-hover.svg' variant.
 * 
 * @param {HTMLImageElement} img - The image element whose source will be updated.
 * @param {string} basePath - The base path of the image source (should end with '.svg').
 * @param {string} [state=''] - Optional state, e.g., 'hover', to determine the image variant.
 */
function updateIconSrc(img, basePath, state = '') {
  let newSrc = basePath;
  if (img.id !== 'urgent-icon' && window.innerWidth < 767) {
    newSrc = newSrc.replace(/\.svg$/, '-mobile.svg');
  }
  if (state === 'hover') {
    if (img.id !== 'urgent-icon' && window.innerWidth < 767) {
      newSrc = basePath.replace(/\.svg$/, '-mobile-hover.svg');
    } else if (img.id !== 'urgent-icon') {
      newSrc = basePath.replace(/\.svg$/, '-hover.svg');
    }
  }
  img.src = newSrc;
}

/**
 * Sets the source of summary icon images and attaches event listeners to their parent elements
 * to update the icon source on hover and touch interactions.
 * 
 * Iterates over the `summaryIcons` array, finds each icon's image element by ID,
 * and updates its source using `updateIconSrc`. For each icon (except 'urgent-icon'),
 * adds event listeners to the parent element to change the icon's source on mouse and touch events.
 *
 * Dependencies:
 * - `summaryIcons`: Array of icon objects with `id` and `base` properties.
 * - `updateIconSrc(img: HTMLElement, base: string, state?: string)`: Function to update the image source.
 */
function setIconSrc() {
  summaryIcons.forEach(icon => {
    const img = document.getElementById(icon.id);
    if (!img) return;
    updateIconSrc(img, icon.base);
    const parent = img.parentElement.parentElement;
    if (!parent || img.id === 'urgent-icon') return;
    parent.addEventListener('mouseenter', () => updateIconSrc(img, icon.base, 'hover'));
    parent.addEventListener('mouseleave', () => updateIconSrc(img, icon.base));
    parent.addEventListener('touchstart', () => updateIconSrc(img, icon.base, 'hover'));
    parent.addEventListener('touchend', () => updateIconSrc(img, icon.base));
  });
}

/**
 * Checks if a greeting has already been shown in the current session.
 * If not, updates the greeting text, triggers the greeting animation,
 * and marks the greeting as shown in sessionStorage.
 * If already shown, only updates the greeting text.
 */
function checkForGreeting() {
  updateGreetingText();
  if (!sessionStorage.getItem('greeting') && window.innerWidth <= 1300) {
    setGreetingAnimation();
    sessionStorage.setItem('greeting', 'true');
  }
}

function setGreetingAnimation() {
  const greeting = document.getElementById('greeting');
  greeting.style.display = 'flex';
  setTimeout(() => {
    greeting.style.display = 'none';
  }, 1800);
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
 * Sets the greeting message text based on the current time of day and user status.
 *
 * @param {HTMLElement} greetingMessage - The DOM element where the greeting text will be displayed.
 *
 * The function uses the current hour to determine whether to display "Good morning", "Good afternoon", or "Good evening".
 * If the current user is 'Guest', it appends an exclamation mark; otherwise, it appends a comma.
 *
 * @global
 * @requires currentUser - The current logged-in user object.
 */
function setGreetingText(greetingMessage) {
  const greetings = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening"
  };
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? greetings.morning : (currentTime < 18 ? greetings.afternoon : greetings.evening);
  if (currentUser.name === 'Guest') {
    greetingMessage.innerText = greeting + '!';
  } else {
    greetingMessage.innerText = greeting + ','
  }
}

/**
 * Sets the display name of the current user in the provided DOM element.
 * If the current user is not a guest, their name is capitalized and displayed.
 * If the current user is a guest or not defined, the display is cleared.
 *
 * @param {HTMLElement} userName - The DOM element where the user's name will be displayed.
 */
function setCurrentUserName(userName) {
  if (currentUser) {
    if (currentUser.name !== 'Guest') {
      userName.innerText = capitalizeFirstLetter(currentUser['name']);
    } else {
      userName.innerText = '';
    }
  }
}

window.addEventListener('resize', setIconSrc);