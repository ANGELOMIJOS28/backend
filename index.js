require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// -------------------
//  MYSQL CONNECTION
// -------------------
let db;

async function connectDB() {
  db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10
  });

  console.log("MySQL connected successfully!");
}

connectDB();

// -------------------
//  CRUD ROUTES
// -------------------

// GET ALL TODOS
app.get("/todos", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM todos");
  res.json(rows);
});

// ADD TODO
app.post("/todos", async (req, res) => {
  const { title, task, status } = req.body;

  const [result] = await db.query(
    "INSERT INTO todos (title, task, status) VALUES (?, ?, ?)",
    [title, task, status || "pending"]
  );

  res.json({ id: result.insertId, title, task, status });
});

// UPDATE TODO
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, task, status } = req.body;

  await db.query(
    "UPDATE todos SET title = ?, task = ?, status = ? WHERE id = ?",
    [title, task, status, id]
  );

  res.json({ message: "Updated successfully" });
});

// DELETE TODO
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM todos WHERE id = ?", [id]);

  res.json({ message: "Deleted successfully" });
});

// -------------------
//  START SERVER (ONLINE ONLY)
// -------------------
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
