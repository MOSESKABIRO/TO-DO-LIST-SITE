// ---------- 1. Grab elements ----------
const input = document.getElementById("new-task");
const dateInput = document.getElementById("new-date");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("task-list");
const count = document.getElementById("count");
const clearBtn = document.getElementById("clear-btn");
const tabs = document.querySelectorAll(".tabs button");

// ---------- 2. Data ----------
const STORAGE_KEY = "my-todo-tasks";
let tasks = [];
let filter = "all"; // all, active or done

// ---------- 3. Saving and loading ----------
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    // Storage can be blocked (private mode, for example). The app still works.
  }
}

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    tasks = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(tasks)) tasks = [];
  } catch (error) {
    tasks = [];
  }
}

// ---------- 4. Date helpers ----------
// Today as "YYYY-MM-DD", so it can be compared with due dates
function todayString() {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

// "2026-10-06" becomes something readable like "6 Oct"
function formatDate(dateString) {
  const d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// ---------- 5. Draw the page from the data ----------
function render() {
  list.innerHTML = "";

  const shown = tasks.filter(function (task) {
    if (filter === "active") return !task.done;
    if (filter === "done") return task.done;
    return true;
  });

  if (shown.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = tasks.length
      ? "Nothing in this group."
      : "No tasks yet. Add your first one above.";
    list.appendChild(empty);
  }

  shown.forEach(function (task) {
    const li = document.createElement("li");
    if (task.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Mark done: " + task.text);
    checkbox.addEventListener("change", function () {
      task.done = checkbox.checked;
      saveTasks();
      render();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    li.append(checkbox, text);

    if (task.due) {
      const due = document.createElement("span");
      due.className = "due";
      due.textContent = formatDate(task.due);
      if (!task.done && task.due < todayString()) {
        due.classList.add("overdue");
      }
      li.appendChild(due);
    }

    const del = document.createElement("button");
    del.className = "delete";
    del.innerHTML = "&times;";
    del.setAttribute("aria-label", "Delete: " + task.text);
    del.addEventListener("click", function () {
      tasks = tasks.filter(function (t) {
        return t !== task;
      });
      saveTasks();
      render();
    });

    li.appendChild(del);
    list.appendChild(li);
  });

  // Footer: "1 of 4 done"
  const doneCount = tasks.filter(function (t) {
    return t.done;
  }).length;
  count.textContent = doneCount + " of " + tasks.length + " done";
  clearBtn.style.visibility = doneCount > 0 ? "visible" : "hidden";

  // Highlight the current tab
  tabs.forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.filter === filter);
  });
}

// ---------- 6. Actions ----------
function addTask() {
  const value = input.value.trim();
  if (value === "") return;

  tasks.unshift({ text: value, done: false, due: dateInput.value });
  input.value = "";
  dateInput.value = "";
  input.focus();
  saveTasks();
  render();
}

addBtn.addEventListener("click", addTask);
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") addTask();
});

tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    filter = tab.dataset.filter;
    render();
  });
});

clearBtn.addEventListener("click", function () {
  tasks = tasks.filter(function (t) {
    return !t.done;
  });
  saveTasks();
  render();
});

// ---------- 7. Start ----------
loadTasks();
render();