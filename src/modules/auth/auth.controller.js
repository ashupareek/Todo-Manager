import { loginUser, signupUser } from "./auth.service.js";

export function signup(req, res) {
  const result = signupUser(req.body);
  res.status(result.status).json(result.body);
}

export function login(req, res) {
  const result = loginUser(req.body);
  res.status(result.status).json(result.body);
}

export function getCurrentUser(req, res) {
  res.status(200).json({
    message: "token is valid",
    user: req.user,
  });
}
