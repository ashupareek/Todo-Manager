import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import listsRoute from "./routes/lists.js";

const app = express();
app.use(express.json());

const port = 3000;
const JWT_SECRET = "THIS_IS_A_SECRET";

const users = [];

function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing authorization header" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.get("/", (req, res) => {
  res.send("Todo Manager API is running");
});

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }

  const userExisted = users.some((user) => user.username === username);

  if (userExisted) {
    return res.status(400).json({ message: "user already exists" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: crypto.randomUUID(),
    username,
    password: hashedPassword,
  };

  users.push(newUser);

  res.status(201).json({
    message: "user created successfully",
    user: {
      id: newUser.id,
      username: newUser.username,
    },
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "invalid credentials" });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: "user",
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  res.status(200).json({
    message: "login successful",
    token,
  });
});

app.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "token is valid",
    user: req.user,
  });
});

app.use("/lists", logger, authMiddleware, listsRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});