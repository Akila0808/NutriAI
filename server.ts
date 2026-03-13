import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("nutriscan.db");
db.pragma("foreign_keys = ON");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    name TEXT,
    lifestyle TEXT,
    goal TEXT,
    age INTEGER,
    weight REAL,
    height REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS meal_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    food_name TEXT,
    calories REAL,
    carbs REAL,
    protein REAL,
    fat REAL,
    fiber REAL,
    health_score INTEGER,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'water', 'exercise', 'walk'
    value REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS unknown_food (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_data TEXT,
    suggested_label TEXT,
    user_label TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // User Endpoints
  app.post("/api/users/onboard", (req, res) => {
    const { email, name, lifestyle, goal, age, weight, height } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO users (email, name, lifestyle, goal, age, weight, height)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          name=excluded.name,
          lifestyle=excluded.lifestyle,
          goal=excluded.goal,
          age=excluded.age,
          weight=excluded.weight,
          height=excluded.height
      `);
      stmt.run(email, name, lifestyle, goal, age, weight, height);
      
      // Fetch the user to get the correct ID (whether it was an insert or update)
      const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: number };
      res.json({ id: user.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/users/:email", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(req.params.email);
    res.json(user || null);
  });

  // Meal Log Endpoints
  app.post("/api/meals", (req, res) => {
    const { user_id, food_name, calories, carbs, protein, fat, fiber, health_score, image_url } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO meal_logs (user_id, food_name, calories, carbs, protein, fat, fiber, health_score, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(user_id, food_name, calories, carbs, protein, fat, fiber, health_score, image_url);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/meals/:user_id", (req, res) => {
    const meals = db.prepare("SELECT * FROM meal_logs WHERE user_id = ? ORDER BY created_at DESC").all(req.params.user_id);
    res.json(meals);
  });

  // Habit Tracker Endpoints
  app.post("/api/habits", (req, res) => {
    const { user_id, type, value } = req.body;
    const stmt = db.prepare("INSERT INTO habits (user_id, type, value) VALUES (?, ?, ?)");
    const info = stmt.run(user_id, type, value);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/habits/:user_id", (req, res) => {
    const habits = db.prepare("SELECT * FROM habits WHERE user_id = ? AND date(created_at) = date('now')").all(req.params.user_id);
    res.json(habits);
  });

  // Unknown Food for Continuous Learning
  app.post("/api/unknown-food", (req, res) => {
    const { image_data, suggested_label } = req.body;
    const stmt = db.prepare("INSERT INTO unknown_food (image_data, suggested_label) VALUES (?, ?)");
    const info = stmt.run(image_data, suggested_label);
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
