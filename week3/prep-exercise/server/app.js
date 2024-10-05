import express from "express";
import { register, login, getProfile, logout } from "./user.js";

const app = express();
app.use(express.json());

// Routes
app.post("/auth/register", register);
app.post("/auth/login", login);
app.get("/auth/profile", getProfile);
app.post("/auth/logout", logout);

// Serve the front-end application from the `client` folder
app.use(express.static("client"));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
