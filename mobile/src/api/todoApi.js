import { apiRequest } from "./client";

export function signup(body) {
  return apiRequest("/signup", {
    method: "POST",
    body,
  });
}

export function login(body) {
  return apiRequest("/login", {
    method: "POST",
    body,
  });
}

export function me(token) {
  return apiRequest("/me", { token });
}

export function getLists(token) {
  return apiRequest("/lists", { token });
}

export function createList(token, body) {
  return apiRequest("/lists", {
    method: "POST",
    token,
    body,
  });
}

export function updateList(token, listId, body) {
  return apiRequest(`/lists/${listId}`, {
    method: "PATCH",
    token,
    body,
  });
}

export function createTodo(token, listId, body) {
  return apiRequest(`/lists/${listId}/todos`, {
    method: "POST",
    token,
    body,
  });
}
