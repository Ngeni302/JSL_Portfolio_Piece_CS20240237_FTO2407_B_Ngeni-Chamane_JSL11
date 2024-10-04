// TASK: import helper functions from utils
import { getTasks, saveTasks, createNewTask,patchTask, putTask, deleteTask } from "./utils/taskFunctions.js";

// TASK: import initialData
import { initialData } from "./initialData.js";
console.log(initialData);

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}
initializeData();

// TASK: Get elements from the DOM
const elements = { //get elements from HTML that will be used throughout our code so we can call them
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  filterDiv: document.getElementById('filterDiv'),
  sideBar: document.getElementById('side-bar-div'),
  editTaskModal: document.getElementById('edit-task-modal-window'),
  saveChangesBtn: document.getElementById('save-task-changes-btn'),
  Btn: document.getElementById('delete-task-btn'),
  titleInput: document.getElementById('title-input'),
  descInput: document.getElementById('desc-input'),
  selectStatus: document.getElementById('select-status'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  newTaskModal: document.getElementById('new-task-modal-window'),
  tasksContainer: document.querySelectorAll('.tasks-container'),
  boardsContainer: document.getElementById("boards-nav-links-div"),
  columnDivs: document.querySelectorAll(".column-div"),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  headerBoardName: document.getElementById('header-board-name'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  themeSwitch: document.getElementById('label-checkbox-theme')
  
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks(); //fetches a list of tasks using getTask function
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))]; //create list of boards from tasks
  displayBoards(boards); //shows the boards on the browser
  if (boards.length > 0) { //checks if there are any boards available
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard")) //parses the board from JSON
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];  
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click',() => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click',() =>{ 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status=${task.status}]`); 
  if (!column) { //checks if the selected column exists
    console.error(`Column not found for status: ${task.status}`); //error message if column not found
    return; //exits function
  }

  let tasksContainer = column.querySelector('.tasks-container'); //finds tasks container within the selected column
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div'); //creates new div that serves as tasks container
    tasksContainer.className = 'tasks-container'; //assigns name to newly created div
    column.appendChild(tasksContainer); //add new tasks container to selected column
  }

  const taskElement = document.createElement('div'); //creates new div element for the individual task
  taskElement.className = 'task-div'; //assigns class name to the task element
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id); //add data attribute to the task element to store tasks ID
  tasksContainer.appendChild(taskElement);  //add task element to tasks container making it visible to user interface
}



function setupEventListeners() {
  // Cancel editing task event listener
  elements.cancelEditBtn.addEventListener('click',() => toggleModal(false, elements.editTaskModal));
  

  // Cancel adding new task event listener
  elements.cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false, elements.newTaskModal);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click',() => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click',() => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true, elements.newTaskModal);
    elements.filterDiv.style.display = 'none'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.newTaskModal.addEventListener('submit',(event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal= elements.newTaskModal) {
  modal.style.display = show ? 'block': 'none';
  
};

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 
  //Assign user input to the task object
  const task = {
    title: elements.titleInput.value,
    description: elements.descInput.value,
    status: elements.selectStatus.value,
    board: activeBoard,

  };
  // creates new task by saving it and updating the browser
  const newTask = createNewTask(task);
  if (newTask) {
    saveTasks(getTasks());
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
    };
  };

//toggle sidebar visibility and saves the user's preference in local storage
function toggleSidebar(show) {
  elements.sideBar.style.display = show ?'block':'none';
  localStorage.setItem('showSideBar', show);

}

//changes the theme and saves the user's preference in local
function toggleTheme() {
  const isLightTheme = document.body.classList.toggle('light-theme');
  localStorage.setItem('light-theme', isLightTheme? 'enabled' : 'disabled');
}


function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;
  
  
  // Get button elements from the task modal


  // Call saveTaskChanges upon click of Save Changes button
  elements.saveChangesBtn.addEventListener('click',() =>{
    saveTaskChanges(task.id)});

  // Delete task using a helper function and close the task modal
  elements.deleteTaskBtn.addEventListener('click', () =>{
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  });
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}


function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = elements.editTaskTitleInput.value;
  const updatedDescription = elements.editTaskDescInput.value;
  const updatedStatus = elements.editSelectStatus.value;
  
  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: updatedTitle,
    description: updatedDescription,
    status: updatedStatus,
    board: activeBoard,
  };


  // Update task using a helper functoin
  putTask(taskId, updatedTask);
  patchTask(taskId, updatedTask);
  saveTasks(getTasks());
  

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/
document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks() //initial display of boards and tasks

}










