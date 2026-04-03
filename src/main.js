// Show splash only on first launch
if (!localStorage.getItem("kaizenHasLaunched")) {
    localStorage.setItem("kaizenHasLaunched", "true");
    document.body.classList.remove("skip-splash"); // allow splash to show
}
/* ============================================================
   LOCAL STORAGE HELPERS
============================================================ */
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}

/* ============================================================
   LOAD ALL DATA
============================================================ */
let tasks = load("tasks", []);
let habits = load("habits", []);
let notes = load("notes", "");
let projects = load("projects", []);
let micro = load("micro", []);
let highlight = load("highlight", "");
let simpleMode = load("simpleMode", true);
let darkMode = load("darkMode", false);

/* ============================================================
   DOM ELEMENTS (ALL PAGES)
============================================================ */
const taskInput = document.getElementById("taskInput");
const taskEstimateInput = document.getElementById("taskEstimateInput");
const taskProjectInput = document.getElementById("taskProjectInput");
const taskList = document.getElementById("taskList");

const habitInput = document.getElementById("habitInput");
const habitList = document.getElementById("habitList");

const notesArea = document.getElementById("notesArea");

const projectNameInput = document.getElementById("projectNameInput");
const projectList = document.getElementById("projectList");

const microInput = document.getElementById("microInput");
const microList = document.getElementById("microList");

const highlightInput = document.getElementById("highlightInput");
const highlightDisplay = document.getElementById("highlightDisplay");

const simpleModeBtn = document.getElementById("simpleModeBtn");
const advancedModeBtn = document.getElementById("advancedModeBtn");
const darkModeBtn = document.getElementById("darkModeBtn");

/* ============================================================
   SIMPLE / ADVANCED MODE
============================================================ */
function applyMode() {
  if (simpleMode) {
    document.body.classList.add("mode-simple");
    simpleModeBtn.classList.add("active");
    advancedModeBtn.classList.remove("active");
  } else {
    document.body.classList.remove("mode-simple");
    advancedModeBtn.classList.add("active");
    simpleModeBtn.classList.remove("active");
  }
}

if (simpleModeBtn) {
  simpleModeBtn.addEventListener("click", () => {
    simpleMode = true;
    save("simpleMode", true);
    applyMode();
  });
}

if (advancedModeBtn) {
  advancedModeBtn.addEventListener("click", () => {
    simpleMode = false;
    save("simpleMode", false);
    applyMode();
  });
}

applyMode();

/* ============================================================
   DARK MODE
============================================================ */
function applyDarkMode() {
  if (darkMode) {
    document.body.classList.add("dark");
    if (darkModeBtn) darkModeBtn.textContent = "Light Mode";
  } else {
    document.body.classList.remove("dark");
    if (darkModeBtn) darkModeBtn.textContent = "Dark Mode";
  }
}

if (darkModeBtn) {
  darkModeBtn.addEventListener("click", () => {
    darkMode = !darkMode;
    save("darkMode", darkMode);
    applyDarkMode();
  });
}

applyDarkMode();

/* ============================================================
   DAILY HIGHLIGHT
============================================================ */
if (highlightInput) {
  highlightInput.value = highlight;

  highlightInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      highlight = highlightInput.value.trim();
      save("highlight", highlight);
      renderHighlight();
    }
  });
}

function renderHighlight() {
  if (highlightDisplay) {
    highlightDisplay.textContent = highlight || "No highlight set.";
  }
}

renderHighlight();

/* ============================================================
   NOTES (AUTO-SAVE)
============================================================ */
if (notesArea) {
  notesArea.value = notes;
  notesArea.addEventListener("input", () => {
    notes = notesArea.value;
    save("notes", notes);
  });
}

/* ============================================================
   TASKS — ENTER TO ADD
============================================================ */
if (taskInput) {
  taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const text = taskInput.value.trim();
      if (!text) return;

      const estimate = taskEstimateInput ? Number(taskEstimateInput.value) || 0 : 0;
      const projectName = taskProjectInput ? taskProjectInput.value.trim() : "";

      tasks.push({
        text,
        completed: false,
        estimate,
        actual: 0,
        project: projectName
      });

      save("tasks", tasks);

      taskInput.value = "";
      if (taskEstimateInput) taskEstimateInput.value = "";
      if (taskProjectInput) taskProjectInput.value = "";

      renderTasks();
      renderDashboard();
      renderProjects();
    }
  });
}

function renderTasks() {
  if (!taskList) return;

  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} />
      <span>${task.text}</span>
      <button class="delete-btn">✖</button>
    `;

    // toggle complete
    li.querySelector("input").addEventListener("change", () => {
      task.completed = !task.completed;
      save("tasks", tasks);
      renderTasks();
      renderDashboard();
    });

    // delete
    li.querySelector(".delete-btn").addEventListener("click", () => {
      tasks.splice(index, 1);
      save("tasks", tasks);
      renderTasks();
      renderDashboard();
    });

    taskList.appendChild(li);
  });
}

/* ============================================================
   HABITS — ENTER TO ADD
============================================================ */
if (habitInput) {
  habitInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const text = habitInput.value.trim();
      if (!text) return;

      habits.push({ text, completed: false });
      save("habits", habits);

      habitInput.value = "";
      renderHabits();
      renderDashboard();
    }
  });
}

function renderHabits() {
  if (!habitList) return;

  habitList.innerHTML = "";

  habits.forEach((habit, index) => {
    const div = document.createElement("div");
    div.className = "habit-item";

    div.innerHTML = `
      <input type="checkbox" ${habit.completed ? "checked" : ""} />
      <span>${habit.text}</span>
      <button class="delete-btn">✖</button>
    `;

    // toggle complete
    div.querySelector("input").addEventListener("change", () => {
      habit.completed = !habit.completed;
      save("habits", habits);
      renderHabits();
      renderDashboard();
    });

    // delete
    div.querySelector(".delete-btn").addEventListener("click", () => {
      habits.splice(index, 1);
      save("habits", habits);
      renderHabits();
      renderDashboard();
    });

    habitList.appendChild(div);
  });
}

/* ============================================================
   PROJECTS — ENTER TO ADD
============================================================ */
if (projectNameInput) {
  projectNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const name = projectNameInput.value.trim();
      if (!name) return;

      if (!projects.find(p => p.name === name)) {
        projects.push({ name });
        save("projects", projects);
      }

      projectNameInput.value = "";
      renderProjects();
      renderDashboard();
    }
  });
}

function renderProjects() {
  if (!projectList) return;

  projectList.innerHTML = "";

  projects.forEach((project, index) => {
    const div = document.createElement("div");
    div.className = "project-item";

    div.innerHTML = `
      <span>${project.name}</span>
      <button class="delete-btn">✖</button>
    `;

    // delete
    div.querySelector(".delete-btn").addEventListener("click", () => {
      projects.splice(index, 1);
      save("projects", projects);
      renderProjects();
      renderDashboard();
    });

    projectList.appendChild(div);
  });
}

/* ============================================================
   MICRO — ENTER TO ADD
============================================================ */
if (microInput) {
  microInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const text = microInput.value.trim();
      if (!text) return;

      micro.push({ text, completed: false });
      save("micro", micro);

      microInput.value = "";
      renderMicro();
      renderDashboard();
    }
  });
}

function renderMicro() {
  if (!microList) return;

  microList.innerHTML = "";

  micro.forEach((item, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <input type="checkbox" ${item.completed ? "checked" : ""} />
      <span>${item.text}</span>
      <button class="delete-btn">✖</button>
    `;

    // toggle complete
    li.querySelector("input").addEventListener("change", () => {
      item.completed = !item.completed;
      save("micro", micro);
      renderMicro();
      renderDashboard();
    });

    // delete
    li.querySelector(".delete-btn").addEventListener("click", () => {
      micro.splice(index, 1);
      save("micro", micro);
      renderMicro();
      renderDashboard();
    });

    microList.appendChild(li);
  });
}

/* ============================================================
   COLLAPSIBLES (Dashboard)
============================================================ */
document.querySelectorAll(".collapse-section").forEach(section => {
  const header = section.querySelector(".collapse-header");
  header.addEventListener("click", () => {
    section.classList.toggle("open");
  });
});

/* ============================================================
   DASHBOARD RENDERING
============================================================ */
function renderDashboard() {
  const activeTasksCount = document.getElementById("activeTasksCount");
  const activeHabitsCount = document.getElementById("activeHabitsCount");
  const activeMicroCount = document.getElementById("activeMicroCount");
  const activeProjectsCount = document.getElementById("activeProjectsCount");
  const activeTimeCount = document.getElementById("activeTimeCount");

  const activeTasksList = document.getElementById("activeTasksList");
  const activeHabitsList = document.getElementById("activeHabitsList");
  const activeMicroList = document.getElementById("activeMicroList");
  const activeProjectsList = document.getElementById("activeProjectsList");
  const activeTimeList = document.getElementById("activeTimeList");

  if (activeTasksCount) activeTasksCount.textContent = tasks.filter(t => !t.completed).length;
  if (activeHabitsCount) activeHabitsCount.textContent = habits.filter(h => !h.completed).length;
  if (activeMicroCount) activeMicroCount.textContent = micro.filter(m => !m.completed).length;
  if (activeProjectsCount) activeProjectsCount.textContent = projects.length;
  if (activeTimeCount) activeTimeCount.textContent = tasks.filter(t => t.estimate > 0).length;

  if (activeTasksList) {
    activeTasksList.innerHTML = tasks.filter(t => !t.completed).map(t => `<div class="collapse-item">${t.text}</div>`).join("");
  }

  if (activeHabitsList) {
    activeHabitsList.innerHTML = habits.filter(h => !h.completed).map(h => `<div class="collapse-item">${h.text}</div>`).join("");
  }

  if (activeMicroList) {
    activeMicroList.innerHTML = micro.filter(m => !m.completed).map(m => `<div class="collapse-item">${m.text}</div>`).join("");
  }

  if (activeProjectsList) {
    activeProjectsList.innerHTML = projects.map(p => `<div class="collapse-item">${p.name}</div>`).join("");
  }

  if (activeTimeList) {
    activeTimeList.innerHTML = tasks
      .filter(t => t.estimate > 0)
      .map(t => `<div class="collapse-item">${t.text} — ${t.estimate} min</div>`)
      .join("");
  }

  renderWeeklyReport();
}

renderDashboard();

/* ============================================================
   WEEKLY REPORT
============================================================ */
function renderWeeklyReport() {
  const weeklyTasks = document.getElementById("weeklyTasks");
  const weeklyHabits = document.getElementById("weeklyHabits");
  const weeklyMicro = document.getElementById("weeklyMicro");
  const weeklyAccuracy = document.getElementById("weeklyAccuracy");
  const weeklyProjects = document.getElementById("weeklyProjects");

  if (!weeklyTasks) return;

  const completedTasks = tasks.filter(t => t.completed).length;
  const completedHabits = habits.filter(h => h.completed).length;
  const completedMicro = micro.filter(m => m.completed).length;

  const estimates = tasks.filter(t => t.estimate > 0);
  const accuracy = estimates.length ? Math.round((completedTasks / estimates.length) * 100) : 0;

  const projectProgress = projects.length ? Math.round((completedTasks / projects.length) * 100) : 0;

  weeklyTasks.textContent = completedTasks;
  weeklyHabits.textContent = completedHabits;
  weeklyMicro.textContent = completedMicro;
  weeklyAccuracy.textContent = accuracy + "%";
  weeklyProjects.textContent = projectProgress + "%";
}
document.addEventListener("DOMContentLoaded", () => {
  if (taskList) renderTasks();
  if (habitList) renderHabits();
  if (projectList) renderProjects();
  if (microList) renderMicro();
  if (highlightDisplay) renderHighlight();
  renderDashboard();
});