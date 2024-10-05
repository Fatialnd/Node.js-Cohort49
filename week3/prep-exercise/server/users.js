import newDatabase from "./database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = "your-secret-key"; // Use an environment variable in production
const isPersistent = false; // Set to true for persistent storage
const database = newDatabase({ isPersistent });

// Register Middleware
export const register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = database.create({ username, password: hashedPassword });
    res.status(201).json({ id: user.id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: "Error registering user." });
  }
};

// Login Middleware
export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const users = database.getAll();
    const user = users.find((user) => user.username === username);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user." });
  }
};

// Get Profile Middleware
export const getProfile = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Authorization header is required." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token." });
    }

    const user = database.getById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ id: user.id, username: user.username });
  });
};

// Logout Middleware
export const logout = (req, res) => {
  res.status(204).send(); // The client should handle token deletion
};
