import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { users } from "../../store/in-memory.store.js";

export function signupUser({ username, password }) {
  if (!username || !password) {
    return {
      status: 400,
      body: { message: "username and password are required" },
    };
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return {
      status: 400,
      body: { message: "user already exists" },
    };
  }

  const hashedPassword = bcrypt.hashSync(password, env.bcryptSaltRounds);

  const newUser = {
    id: crypto.randomUUID(),
    username,
    password: hashedPassword,
  };

  users.push(newUser);

  return {
    status: 201,
    body: {
      message: "user created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
      },
    },
  };
}

export function loginUser({ username, password }) {
  const user = users.find((item) => item.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return {
      status: 401,
      body: { message: "invalid credentials" },
    };
  }

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: "user",
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    status: 200,
    body: {
      message: "login successful",
      token,
    },
  };
}
