const STORAGE_KEY = "daylight-tasks-v1";
let tasks = loadTasks();
let currentFilter = "all";
const list = document.getElementById("list");
const form = document.getElementById("task-form");
const input = document.getElementById("todo");
const priorityInput = document.getElementById("type");
const today = new Date();
document.getElementById("today").textContent = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(today);
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function render() {
  list.replaceChildren();
  const query = document.getElementById("search").value.trim().toLowerCase();
  const visible = tasks
    .map((task, index) => ({ ...task, index }))
    .filter((task) => {
      const matchesFilter =
        currentFilter === "all" ||
        (currentFilter === "active" && !task.completed) ||
        (currentFilter === "completed" && task.completed);
      return matchesFilter && task.item.toLowerCase().includes(query);
    });
  for (const task of visible) {
    const row = document.createElement("li");
    row.className = "task-row" + (task.completed ? " completed" : "");
    const check = document.createElement("button");
    check.type = "button";
    check.className = "check-button";
    check.setAttribute(
      "aria-label",
      task.completed ? "Mark task incomplete" : "Complete task",
    );
    check.textContent = task.completed ? "✓" : "";
    check.addEventListener("click", () => toggleTask(task.index));
    const content = document.createElement("div");
    content.className = "task-content";
    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.item;
    title.title = "Double click to edit";
    title.addEventListener("dblclick", () => editTask(task.index));
    const meta = document.createElement("div");
    meta.className = "task-meta";
    const badge = document.createElement("span");
    badge.className = "priority-badge priority-" + task.type;
    badge.textContent = task.type + " priority";
    meta.append(badge);
    content.append(title, meta);
    const actions = document.createElement("div");
    actions.className = "row-actions";
    const select = document.createElement("select");
    select.className = "priority-select";
    select.setAttribute("aria-label", "Change priority");
    for (const value of ["high", "medium", "low"]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value[0].toUpperCase() + value.slice(1);
      option.selected = task.type === value;
      select.append(option);
    }
    select.addEventListener("change", () =>
      changePriority(task.index, select.value),
    );
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-button";
    remove.setAttribute("aria-label", "Delete task");
    remove.textContent = "×";
    remove.addEventListener("click", () => deleteTask(task.index));
    actions.append(select, remove);
    row.append(check, content, actions);
    list.append(row);
  }
  const remaining = tasks.filter((task) => !task.completed).length;
  const completed = tasks.length - remaining;
  document.getElementById("all-count").textContent = tasks.length;
  document.getElementById("remaining-count").textContent =
    remaining + " task" + (remaining === 1 ? "" : "s") + " left";
  document.getElementById("task-summary").textContent = tasks.length
    ? completed + " of " + tasks.length + " tasks completed"
    : "Your next small win is waiting.";
  const percent = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  document.getElementById("progress-value").textContent = percent + "%";
  document.querySelector(".progress-ring").style.background =
    "conic-gradient(#7665d5 " + percent * 3.6 + "deg,#eeeefa 0deg)";
  const empty = document.getElementById("empty-state");
  empty.classList.toggle("visible", visible.length === 0);
  document.getElementById("empty-title").textContent = query
    ? "No matching tasks"
    : currentFilter === "completed"
      ? "Nothing completed yet"
      : currentFilter === "active"
        ? "You’re all caught up!"
        : "A fresh start.";
  document.getElementById("empty-copy").textContent = query
    ? "Try another search."
    : currentFilter === "completed"
      ? "Completed tasks will show up here."
      : "Add a task above and make today count.";
  document.getElementById("clear-completed").disabled = completed === 0;
}
function addTask(item, type) {
  tasks.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    item,
    type,
    completed: false,
    createdAt: Date.now(),
  });
  save();
  render();
}
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  save();
  render();
}
function changePriority(index, type) {
  tasks[index].type = type;
  save();
  render();
}
function deleteTask(index) {
  tasks.splice(index, 1);
  save();
  render();
}
function editTask(index) {
  const next = prompt("Edit task", tasks[index].item);
  if (next === null) return;
  const item = next.trim();
  if (item) {
    tasks[index].item = item;
    save();
    render();
  }
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const item = input.value.trim();
  if (!item) {
    input.focus();
    return;
  }
  addTask(item, priorityInput.value);
  input.value = "";
  input.focus();
});
document.querySelectorAll(".filter").forEach((button) =>
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach((filter) => {
      const selected = filter === button;
      filter.classList.toggle("active", selected);
      filter.setAttribute("aria-selected", String(selected));
    });
    render();
  }),
);
document.getElementById("search").addEventListener("input", render);
document.getElementById("clear-completed").addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  save();
  render();
});
render();
