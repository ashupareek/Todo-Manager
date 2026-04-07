import app from "../../src/app.js";
import { resetStore } from "../../src/store/in-memory.store.js";

let server;
let baseUrl;

function jsonRequest(path, { method = "GET", token, body } = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("E2E app flow", () => {
  beforeEach(async () => {
    resetStore();
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  });

  it("serves UI and supports full API lifecycle", async () => {
    const uiResponse = await fetch(`${baseUrl}/`);
    const uiHtml = await uiResponse.text();
    expect(uiResponse.status).toBe(200);
    expect(uiHtml).toMatch(/Todo Manager/);

    const signup = await jsonRequest("/api/signup", {
      method: "POST",
      body: { username: "alex", password: "pass1234" },
    });
    expect(signup.status).toBe(201);

    const login = await jsonRequest("/api/login", {
      method: "POST",
      body: { username: "alex", password: "pass1234" },
    });
    const loginBody = await login.json();
    expect(login.status).toBe(200);
    expect(loginBody.token).toBeTruthy();

    const createList = await jsonRequest("/api/lists", {
      method: "POST",
      token: loginBody.token,
      body: { name: "Roadmap" },
    });
    const listBody = await createList.json();
    expect(createList.status).toBe(201);

    const createTodo = await jsonRequest(`/api/lists/${listBody.id}/todos`, {
      method: "POST",
      token: loginBody.token,
      body: { task: "Ship initial UI" },
    });
    expect(createTodo.status).toBe(201);

    const lists = await jsonRequest("/api/lists", { token: loginBody.token });
    const listsBody = await lists.json();
    expect(lists.status).toBe(200);
    expect(listsBody.length).toBe(1);
    expect(listsBody[0].todos.length).toBe(1);
    expect(listsBody[0].todos[0].task).toBe("Ship initial UI");
  });
});
