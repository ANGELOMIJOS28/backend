require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// -----------------------
// MYSQL CONNECTION POOL
// -----------------------
let db;

async function connectDB() {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT),
      waitForConnections: true,
      connectionLimit: 10,
      ssl: { rejectUnauthorized: false }
    });

    console.log("Connected to Railway MySQL!");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

connectDB();

// -----------------------
// ROUTES
// -----------------------

// GET ALL TODOS
app.get("/todos", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM todos");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// ADD TODO
app.post("/todos", async (req, res) => {
  try {
    const { title, task, status } = req.body;

    const [result] = await db.query(
      "INSERT INTO todos (title, task, status) VALUES (?, ?, ?)",
      [title, task, status || "pending"]
    );

    res.json({
      id: result.insertId,
      title,
      task,
      status: status || "pending",
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// UPDATE TODO
app.put("/todos/:id", async (req, res) => {
  try {
    const { title, task, status } = req.body;
    const { id } = req.params;

    await db.query(
      "UPDATE todos SET title=?, task=?, status=? WHERE id=?",
      [title, task, status, id]
    );

    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// DELETE TODO
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM todos WHERE id=?", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// -----------------------
// SERVER
// -----------------------
app.listen(process.env.PORT || 4000, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
