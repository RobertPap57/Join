

/**
 * Initializes the summary page by including HTML content and updating greeting text.
 * 
 * This function initializes the summary page by including HTML content using the includeHTML function
 * and updating the greeting text using the updateGreetingText function, fetching data from realtime database and render the summary.html
 *
 */
async function initSummary() {
  await includeHTML();
  checkOrientation();
  checkForCurrentUser() ? checkForGreeting() : redirectTo('login.html');
  displayProfileIconInitials();
  highlightLink('summary');
  await getTasks();
  renderSummary();
}


/**
 * Object mapping image IDs to their corresponding source paths for different states.
 */
const imgIdToSrcMap = {
  summary__toDo: {
    highlight: './assets/img/icons_summary/edit_light.png',
    reset: './assets/img/icons_summary/edit_dark.png'
  },
  summary__Done: {
    highlight: './assets/img/icons_summary/done_light.png',
    reset: './assets/img/icons_summary/done_dark.png'
  }
};


/**
 * Checks if the greeting has already been displayed in the session storage.
 * If not, updates the greeting text, sets the greeting animation, and marks
 * the greeting as displayed in the session storage.
 */
const checkForGreeting = () => {
  if (sessionStorage.getItem('greeting')) {
    updateGreetingText();
  } else {
    updateGreetingText();
    setGreetingAnimation();
    sessionStorage.setItem('greeting', 'true');
  }
};


/**
 * Changes the image source of an element based on a specified state, 
 * if the window width is greater than 992 pixels.
 * 
 * @param {HTMLElement} element - The HTML element whose image source will be changed.
 * @param {string} state - The state to set the image to ('highlight' or 'reset').
 */
const changeIconImage = (element, state) => {
  if (window.innerWidth <= 992) return;
  const img = element.querySelector('img');
  const newSrc = imgIdToSrcMap[img?.id]?.[state];
  if (newSrc) img.src = newSrc;
};



/**
 * Updates greeting text and current user name for desktop and mobile views.
 * 
 * Clears and then sets the greeting text and current user name for both desktop
 * and mobile elements.
 */
const updateGreetingText = () => {
  const userName = document.getElementById('user__name');
  const userNameMobile = document.getElementById('user__name-mobile');
  const greetingText = document.getElementById('greeting__text');
  const greetingTextMobile = document.getElementById('greeting__text-mobile');
  clearText(greetingText);
  clearText(greetingTextMobile);
  clearText(userName);
  clearText(userNameMobile);
  setGreetingText(greetingText);
  setGreetingText(greetingTextMobile);
  setCurrentUserName(userName);
  setCurrentUserName(userNameMobile);
};


/**
 * Sets a greeting animation for mobile devices.
 * 
 * Shows and hides the overlay container to create a brief greeting animation 
 * for mobile devices when the window width is less than 1220 pixels.
 */
function setGreetingAnimation() {
  const containerMobile = document.getElementById('overlay');
  if (window.innerWidth < 1207) {
    containerMobile.classList.remove("d-none");
    setTimeout(function () {
      containerMobile.classList.add("d-none");
    }, 1800);
  }
}


/**
 * Changes the source image of buttons to a highlighted version.
 * 
 * @param {Element} element - The element containing the button image.
 */
function changeIcon(element) {
  changeIconImage(element, 'highlight');
}


/**
 * Resets the source image of buttons to their original version.
 * 
 * @param {Element} element - The element containing the button image.
 */
function resetIcon(element) {
  changeIconImage(element, 'reset');
}


/**
 * Clears the text content of an HTML element.
 * 
 * @param {HTMLElement} element - The HTML element whose text content will be cleared.
 */
function clearText(element) {
  element.innerText = '';
}


/**
 * Sets the greeting text based on the current time of the day.
 * 
 * @param {HTMLElement} greetingText - The HTML element to set the greeting text into.
 */
function setGreetingText(greetingText) {
  const timesOfDay = {
    morning: "Good morning,",
    afternoon: "Good afternoon,",
    evening: "Good evening,"
  };
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? timesOfDay.morning : (currentTime < 18 ? timesOfDay.afternoon : timesOfDay.evening);
  greetingText.innerText = greeting;
}


/**
 * Capitalizes the first character of a string.
 * 
 * @param {string} string - The string to capitalize the first character of.
 * @returns {string} The string with the first character capitalized.
 */
function capitalizeFirstChar(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


/**
 * Sets the current user's name in the provided HTML element.
 * 
 * If a currentUser object exists, sets the inner text of the userName element
 * to the capitalized name of the currentUser.
 * 
 * @function setCurrentUserName
 * @param {HTMLElement} userName - The HTML element where the user's name will be displayed.
 * @param {object|null} currentUser - The current user object containing the user's details.
 *                                   Must have a 'name' property.
 */
function setCurrentUserName(userName) {
  if (currentUser) {
    userName.innerText = capitalizeFirstChar(currentUser['name']);
  }
}


/**
 * Renders summary data based on task criteria and counts.
 * 
 * Retrieves counts for tasks based on status ('toDo', 'done', 'inProgress', 'awaitingFeedback')
 * and priority ('urgent'), then renders this data to corresponding summary elements.
 * Additionally, renders the total number of tasks and urgent tasks nearest to their due dates.
 * 
 */
function renderSummary() {
  const todo = countTasksByCriteria('status', 'toDo');
  const done = countTasksByCriteria('status', 'done');
  const progress = countTasksByCriteria('status', 'inProgress');
  const awaitingFeedback = countTasksByCriteria('status', 'awaitingFeedback');
  const urgent = countTasksByCriteria('priority', 'urgent');
  const tasksAmount = tasks.length;
  renderDataToSummary("summary__todo", todo);
  renderDataToSummary("summary__done", done);
  renderDataToSummary("summary__progress", progress);
  renderDataToSummary("summary__feedback", awaitingFeedback);
  renderDataToSummary("summary__urgent", urgent);
  renderDataToSummary("summary__tasks", tasksAmount);
  renderUrgentTasksNearestDueDate();
}


/**
 * Counts the number of tasks that match a specified criteria and value.
 * 
 * @function countTasksByCriteria
 * @param {string} criteria - The property of the task object to compare (e.g., 'status', 'priority').
 * @param {string} value - The value to compare against (case insensitive).
 * @returns {number} The count of tasks matching the criteria and value.
 */
function countTasksByCriteria(criteria, value) {
  return tasks.filter(task => task[criteria].toLowerCase() === value.toLowerCase()).length;
}


/**
 * Renders a number to a summary element identified by its ID.
 * 
 * @function renderDataToSummary
 * @param {string} id - The ID of the HTML element to render data into.
 * @param {number} number - The number to render into the element.
 */
function renderDataToSummary(id, number) {
  let element = document.getElementById(id);
  element.innerText = `${number}`;
}


/**
 * Retrieves the most urgent task based on priority and due date.
 * 
 * @function getMostUrgentTask
 * @param {Array<object>} tasks - An array of task objects to search through.
 * @returns {object|null} The most urgent task object or null if no urgent tasks exist.
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
 * Formats a date string into a localized date format.
 * 
 * @function formatDateString
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string in the format 'Month Day, Year' (e.g., 'January 1, 2024').
 */
function formatDateString(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}


/**
 * Renders the nearest due date of the most urgent task to the summary element.
 * 
 * Retrieves the most urgent task from the tasks array, formats its due date,
 * and renders the formatted date to the summary element with ID 'summary__date'.
 * If no urgent tasks are found, renders 'no urgent tasks' to the summary element
 * and logs a message to the console.
 * 
 * @function renderUrgentTasksNearestDueDate
 */
function renderUrgentTasksNearestDueDate() {
  const mostUrgentTask = getMostUrgentTask(tasks);
  if (mostUrgentTask) {
    const mostUrgentTasksDueDate = formatDateString(mostUrgentTask.dueDate);
    renderDataToSummary("summary__date", mostUrgentTasksDueDate);
  } else {
    renderDataToSummary("summary__date", 'no urgent tasks');
  }
}
