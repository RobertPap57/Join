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
 * Renders the summary page by counting tasks based on their status and priority.
 * Then renders the counts to the respective summary items.
 * Finally, renders the upcoming deadline.
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
 * @param {string} key - The property name of the task object to compare.
 * @param {string} value - The value to match against the task's property.
 * @returns {number} The count of tasks matching the specified key and value.
*/
function countTasks(key, value) {
  return tasks.filter(task => task[key].toLowerCase() === value.toLowerCase()).length;
}


/**
 * Updates the inner text of a DOM element with the specified ID to display a given number.
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
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string in "Month Day, Year" format.
*/
function formatDateString(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}


/**
 * Renders the most urgent task with the earliest due date in the summary page.
 * If no urgent tasks are found, renders a message indicating no urgent tasks.
 * @param {Array<Object>} tasks - The array of task objects to search through.
 * @param {string} tasks[].priority - The priority level of the task (e.g., 'urgent').
 * @param {string|Date} tasks[].dueDate - The due date of the task.
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
 * Updates the source of an icon based on the screen size and state (hover or not).
 * If the screen size is below 768px and the icon is not the urgent icon, appends '-mobile.svg' to the base path.
 * If the state is 'hover' and the screen size is below 768px, appends '-mobile-hover.svg' to the base path.
 * If the state is 'hover' and the screen size is not below 768px, appends '-hover.svg' to the base path.
 * @param {HTMLElement} img - The icon element to update.
 * @param {string} basePath - The base path of the icon image.
 * @param {string} [state=''] - The state of the icon (either 'hover' or empty string).
 */
function updateIconSrc(img, basePath, state = '') {
  let newSrc = basePath;
  if (img.id !== 'urgent-icon' && window.innerWidth < 768) {
    newSrc = newSrc.replace(/\.svg$/, '-mobile.svg');
  }
  if (state === 'hover') {
    if (img.id !== 'urgent-icon' && window.innerWidth < 768) {
      newSrc = basePath.replace(/\.svg$/, '-mobile-hover.svg');
    } else if (img.id !== 'urgent-icon') {
      newSrc = basePath.replace(/\.svg$/, '-hover.svg');
    }
  }
  img.src = newSrc;
}


/**
 * Sets up the icon source images based on the screen size and state (hover or not) for
 * the icons in the summary page.
 * If the screen size is below 768px and the icon is not the urgent icon, appends
 * '-mobile.svg' to the base path.
 * If the state is 'hover' and the screen size is below 768px, appends '-mobile-hover.svg'
 * to the base path.
 * If the state is 'hover' and the screen size is not below 768px, appends '-hover.svg' to
 * the base path.
 * @param {string} icon.base - The base path of the icon image.
 * @param {string} [state=''] - The state of the icon (either 'hover' or empty string).
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
 * Sets the greeting text based on the current time of day.
 * If the user is a guest, appends an exclamation mark to the end of the greeting.
 * If the user is not a guest, appends a comma to the end of the greeting.
 * @param {HTMLElement} greetingMessage - The element to update with the greeting text.
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