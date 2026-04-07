import request from "supertest";
import app from "../../src/app.js";
import { resetStore } from "../../src/store/in-memory.store.js";

describe("API integration", () => {
  beforeEach(() => {
    resetStore();
  });

  it("rejects protected route access without JWT", async () => {
    const response = await request(app).get("/api/lists");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Missing authorization header");
  });

  it("supports auth and list flow for owner", async () => {
    await request(app).post("/api/signup").send({ username: "alice", password: "pw12345" });
    const login = await request(app).post("/api/login").send({ username: "alice", password: "pw12345" });
    const token = login.body.token;

    const createdList = await request(app)
      .post("/api/lists")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Sprint" });

    expect(createdList.status).toBe(201);

    const createdTodo = await request(app)
      .post(`/api/lists/${createdList.body.id}/todos`)
      .set("Authorization", `Bearer ${token}`)
      .send({ task: "Implement endpoint" });

    expect(createdTodo.status).toBe(201);

    const lists = await request(app).get("/api/lists").set("Authorization", `Bearer ${token}`);
    expect(lists.status).toBe(200);
    expect(lists.body.length).toBe(1);
    expect(lists.body[0].todos.length).toBe(1);
    expect(lists.body[0].todos[0].task).toBe("Implement endpoint");
  });

  it("blocks non-owner from updating an existing list", async () => {
    await request(app).post("/api/signup").send({ username: "owner", password: "pw12345" });
    await request(app).post("/api/signup").send({ username: "other", password: "pw12345" });

    const ownerLogin = await request(app).post("/api/login").send({ username: "owner", password: "pw12345" });
    const otherLogin = await request(app).post("/api/login").send({ username: "other", password: "pw12345" });

    const ownerToken = ownerLogin.body.token;
    const otherToken = otherLogin.body.token;

    const list = await request(app)
      .post("/api/lists")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Owner list" });

    const update = await request(app)
      .patch(`/api/lists/${list.body.id}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ name: "Hacked name" });

    expect(update.status).toBe(403);
    expect(update.body.message).toBe("Forbidden: only owner can update this list");
  });
});
