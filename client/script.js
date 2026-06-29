const API_URL = "https://todo-app-52er.onrender.com/api/tasks";
const toast = document.getElementById("toast");
const loader = document.getElementById("loader");
const emptyState = document.getElementById("emptyState");

if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDate");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const updateBtn = document.getElementById("updateBtn");
const allBtn = document.getElementById("allBtn");
const pendingBtn = document.getElementById("pendingBtn");
const completedBtn = document.getElementById("completedBtn");
const welcomeUser = document.getElementById("welcomeUser");

const username = localStorage.getItem("username");


if(username){
    welcomeUser.textContent = `👋 Welcome, ${username}`;
}

let currentFilter = "all";
let editTaskId = null;

// Load all tasks
async function loadTasks() {
  loader.style.display = "block";
taskList.style.display = "none";
  const res = await fetch(API_URL);
  const tasks = await res.json();
  document.getElementById("totalTasks").textContent = tasks.length;

  document.getElementById("pendingTasks").textContent =
  tasks.filter(task => !task.completed).length;

  document.getElementById("completedTasks").textContent =
  tasks.filter(task => task.completed).length;

  const keyword = searchInput.value.toLowerCase();



let filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(keyword)
);

if (sortSelect.value === "az") {
    filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
}

if (sortSelect.value === "za") {
    filteredTasks.sort((a, b) => b.title.localeCompare(a.title));
}

if (sortSelect.value === "date") {
    filteredTasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
}

if (currentFilter === "pending") {
    filteredTasks = filteredTasks.filter(task => !task.completed);
}

if (currentFilter === "completed") {
    filteredTasks = filteredTasks.filter(task => task.completed);
}

  taskList.innerHTML = "";
  if (filteredTasks.length === 0) {
    emptyState.style.display = "block";
} else {
    emptyState.style.display = "none";
}

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.innerHTML = `
${task.completed ? "✅" : "⬜"} ${task.title}
<br>
<small>📅 Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}</small>

<button class="complete-btn" onclick="toggleComplete('${task._id}', ${task.completed})">
${task.completed ? "Undo" : "Complete"}
</button>

<button class="edit-btn" onclick="editTask('${task._id}', '${task.title}')">
✏ Edit
</button>

<button class="delete-btn" onclick="deleteTask('${task._id}')">
🗑 Delete
</button>
`;
    taskList.appendChild(li);
  });

  loader.style.display = "none";
taskList.style.display = "block";
}

// Add new task
addBtn.addEventListener("click", async () => {
  const title = taskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (!title) {
    alert("Please enter a task.");
    return;
  }

  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
    title,
    dueDate,
}),
  });

  taskInput.value = "";
  dueDateInput.value = "";
  loadTasks();
});

updateBtn.addEventListener("click", async () => {
    const title = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    if (!title) {
        alert("Please enter a task.");
        return;
    }

    await fetch(`${API_URL}/${editTaskId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title,
            dueDate
        })
    });

    taskInput.value = "";
    dueDateInput.value = "";
    editTaskId = null;

    addBtn.style.display = "inline-block";
    updateBtn.style.display = "none";

    loadTasks();
});

// Load tasks when page opens
// loadTasks();

// Edit task
function editTask(id, title) {
    taskInput.value = title;
    editTaskId = id;

    addBtn.style.display = "none";
    updateBtn.style.display = "inline-block";
}

async function toggleComplete(id, completed) {
    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            completed: !completed,
        }),
    });

    loadTasks();
}
// Delete task
async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
    return;
}
  await fetch(`http://localhost:5000/api/tasks/${id}`, {
    method: "DELETE",
  });

  loadTasks();
}

searchInput.addEventListener("input", loadTasks);

allBtn.addEventListener("click", () => {
    currentFilter = "all";
    loadTasks();
});

pendingBtn.addEventListener("click", () => {
    currentFilter = "pending";
    loadTasks();
});

completedBtn.addEventListener("click", () => {
    currentFilter = "completed";
    loadTasks();
});

sortSelect.addEventListener("change", loadTasks);

const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){
        themeBtn.innerHTML = "☀️";
    }else{
        themeBtn.innerHTML = "🌙";
    }
});

// Logout
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");

        showToast("👋 Logout Successful!");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);

        
    }

});

const profileBtn = document.getElementById("profileBtn");
const profileMenu = document.getElementById("profileMenu");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");

profileName.textContent = localStorage.getItem("username") || "User";
profileEmail.textContent = localStorage.getItem("email") || "No Email";

profileBtn.addEventListener("click", () => {
    profileMenu.classList.toggle("show");
});

document.addEventListener("click", (e) => {
    if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove("show");
    }
});