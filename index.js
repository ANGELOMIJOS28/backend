import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY date ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new task
app.post("/tasks", async (req, res) => {
  try {
    const { title, date, priority } = req.body;
    const result = await pool.query(
      "INSERT INTO tasks (title, date, priority, completed) VALUES ($1, $2, $3, false) RETURNING *",
      [title, date, priority]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, priority, completed } = req.body;
    const result = await pool.query(
      "UPDATE tasks SET title=$1, date=$2, priority=$3, completed=$4 WHERE id=$5 RETURNING *",
      [title, date, priority, completed, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

