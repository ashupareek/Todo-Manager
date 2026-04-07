import {
  createList,
  createTodo,
  getAllLists,
  updateList,
} from "../../src/modules/lists/lists.service.js";
import { resetStore } from "../../src/store/in-memory.store.js";

describe("lists.service", () => {
  beforeEach(() => {
    resetStore();
  });

  it("creates list for creator and returns 201", () => {
    const result = createList({ name: "Backlog", creatorId: "u1" });

    expect(result.status).toBe(201);
    expect(result.body.name).toBe("Backlog");
    expect(result.body.creatorId).toBe("u1");
  });

  it("prevents update when requester is not owner", () => {
    const created = createList({ name: "Backlog", creatorId: "owner" });
    const result = updateList({
      listId: created.body.id,
      name: "Renamed",
      userId: "other",
    });

    expect(result.status).toBe(403);
    expect(result.body.message).toBe("Forbidden: only owner can update this list");
  });

  it("creates todos only for list owner", () => {
    const list = createList({ name: "Backlog", creatorId: "owner" }).body;
    const forbidden = createTodo({ listId: list.id, task: "Task A", userId: "other" });
    const allowed = createTodo({ listId: list.id, task: "Task A", userId: "owner" });

    expect(forbidden.status).toBe(403);
    expect(allowed.status).toBe(201);
    expect(allowed.body.completed).toBe(false);
  });

  it("returns lists enriched with todos", () => {
    const list = createList({ name: "Backlog", creatorId: "owner" }).body;
    createTodo({ listId: list.id, task: "Task A", userId: "owner" });
    createTodo({ listId: list.id, task: "Task B", userId: "owner" });

    const lists = getAllLists();
    expect(lists.length).toBe(1);
    expect(lists[0].todos.length).toBe(2);
  });
});
