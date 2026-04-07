const API_BASE = "/api";
const TOKEN_KEY = "todo-manager-token";

const state = {
  authMode: "login",
  token: localStorage.getItem(TOKEN_KEY) || "",
  user: null,
  lists: [],
};

const authCard = document.getElementById("auth-card");
const appCard = document.getElementById("app-card");
const feedback = document.getElementById("feedback");
const topSignup = document.getElementById("top-signup");
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const authForm = document.getElementById("auth-form");
const authSubmit = document.getElementById("auth-submit");
const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");
const currentUser = document.getElementById("current-user");
const createListForm = document.getElementById("create-list-form");
const listNameInput = document.getElementById("list-name-input");
const logoutButton = document.getElementById("logout-button");
const refreshListsButton = document.getElementById("refresh-lists-button");
const listsContainer = document.getElementById("lists-container");
const listTemplate = document.getElementById("list-template");

function showFeedback(message, type = "info") {
  feedback.classList.remove("hidden", "error");
  feedback.textContent = message;

  if (type === "error") {
    feedback.classList.add("error");
  }
}

function clearFeedback() {
  feedback.textContent = "";
  feedback.classList.add("hidden");
  feedback.classList.remove("error");
}

function setAuthMode(mode) {
  state.authMode = mode;
  loginTab.classList.toggle("active", mode === "login");
  signupTab.classList.toggle("active", mode === "signup");
  authSubmit.textContent = mode === "login" ? "Login" : "Create account";
}

function renderAuthState() {
  const isLoggedIn = Boolean(state.token && state.user);

  authCard.classList.toggle("hidden", isLoggedIn);
  appCard.classList.toggle("hidden", !isLoggedIn);

  if (isLoggedIn) {
    currentUser.textContent = `Logged in as ${state.user.username}`;
  }
}

function renderLists() {
  listsContainer.innerHTML = "";

  if (state.lists.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No lists yet. Create your first list.";
    empty.className = "subtitle";
    listsContainer.appendChild(empty);
    return;
  }

  for (const list of state.lists) {
    const fragment = listTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".list-card");
    const title = fragment.querySelector(".list-name");
    const count = fragment.querySelector(".count");
    const renameForm = fragment.querySelector(".rename-list-form");
    const renameInput = renameForm.querySelector("input[name='name']");
    const addTodoForm = fragment.querySelector(".add-todo-form");
    const todoInput = addTodoForm.querySelector("input[name='task']");
    const todoList = fragment.querySelector(".todo-list");

    title.textContent = list.name;
    count.textContent = `${list.todos.length} todos`;
    renameInput.value = list.name;

    for (const todo of list.todos) {
      const item = document.createElement("li");
      item.className = "todo-item";
      item.textContent = todo.task;
      todoList.appendChild(item);
    }

    renameForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await api(`/lists/${list.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: renameInput.value }),
        });
        await loadLists();
        showFeedback("List updated");
      } catch (error) {
        showFeedback(error.message, "error");
      }
    });

    addTodoForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await api(`/lists/${list.id}/todos`, {
          method: "POST",
          body: JSON.stringify({ task: todoInput.value }),
        });
        todoInput.value = "";
        await loadLists();
        showFeedback("Todo created");
      } catch (error) {
        showFeedback(error.message, "error");
      }
    });

    card.dataset.listId = list.id;
    listsContainer.appendChild(fragment);
  }
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

async function loadSession() {
  if (!state.token) {
    renderAuthState();
    return;
  }

  try {
    const me = await api("/me");
    state.user = me.user;
    await loadLists();
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    state.token = "";
    state.user = null;
  }

  renderAuthState();
}

async function loadLists() {
  state.lists = await api("/lists");
  renderLists();
}

loginTab.addEventListener("click", () => setAuthMode("login"));
signupTab.addEventListener("click", () => setAuthMode("signup"));
topSignup.addEventListener("click", () => setAuthMode("signup"));

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFeedback();

  const body = {
    username: usernameInput.value.trim(),
    password: passwordInput.value,
  };

  try {
    if (state.authMode === "signup") {
      await api("/signup", { method: "POST", body: JSON.stringify(body) });
      setAuthMode("login");
      showFeedback("Account created. Login to continue.");
      authForm.reset();
      return;
    }

    const login = await api("/login", { method: "POST", body: JSON.stringify(body) });
    state.token = login.token;
    localStorage.setItem(TOKEN_KEY, login.token);

    const me = await api("/me");
    state.user = me.user;
    await loadLists();
    renderAuthState();
    authForm.reset();
    showFeedback("Login successful.");
  } catch (error) {
    showFeedback(error.message, "error");
  }
});

createListForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFeedback();

  try {
    await api("/lists", {
      method: "POST",
      body: JSON.stringify({ name: listNameInput.value }),
    });
    listNameInput.value = "";
    await loadLists();
    showFeedback("List created");
  } catch (error) {
    showFeedback(error.message, "error");
  }
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem(TOKEN_KEY);
  state.token = "";
  state.user = null;
  state.lists = [];
  renderLists();
  renderAuthState();
  clearFeedback();
});

refreshListsButton.addEventListener("click", async () => {
  clearFeedback();
  try {
    await loadLists();
    showFeedback("Lists refreshed");
  } catch (error) {
    showFeedback(error.message, "error");
  }
});

setAuthMode("login");
loadSession();
