import jwt from "jsonwebtoken";
import { loginUser, signupUser } from "../../src/modules/auth/auth.service.js";
import { env } from "../../src/config/env.js";
import { resetStore, users } from "../../src/store/in-memory.store.js";

describe("auth.service", () => {
  beforeEach(() => {
    resetStore();
  });

  it("returns 400 when signup payload is incomplete", () => {
    const result = signupUser({ username: "alice" });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe("username and password are required");
  });

  it("creates a user with a hashed password", () => {
    const result = signupUser({ username: "alice", password: "secret123" });

    expect(result.status).toBe(201);
    expect(result.body.user.username).toBe("alice");
    expect(users.length).toBe(1);
    expect(users[0].password).not.toBe("secret123");
  });

  it("returns 401 for invalid credentials", () => {
    signupUser({ username: "alice", password: "secret123" });
    const result = loginUser({ username: "alice", password: "wrong" });

    expect(result.status).toBe(401);
    expect(result.body.message).toBe("invalid credentials");
  });

  it("returns a signed JWT for valid credentials", () => {
    const signup = signupUser({ username: "alice", password: "secret123" });
    const result = loginUser({ username: "alice", password: "secret123" });

    expect(result.status).toBe(200);
    expect(result.body.token).toBeTruthy();

    const payload = jwt.verify(result.body.token, env.jwtSecret);
    expect(payload.userId).toBe(signup.body.user.id);
    expect(payload.username).toBe("alice");
    expect(payload.role).toBe("user");
  });
});
