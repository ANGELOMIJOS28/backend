const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// RAILWAY MYSQL CONNECTION
const db = mysql.createConnection({
    host: "shinkansen.proxy.rlwy.net",
    user: "root",
    password: "gsPCpwSsuhbbrrmubThRQxXjHSHmAVLz",
    port: 39375,
    database: "railway"
});

db.connect(err => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        return;
    }
    console.log("✅ Connected to Railway MySQL!");
});

// EXAMPLE ROUTE
app.get("/", (req, res) => {
    res.send("Server Running!");
});

app.listen(10000, () => {
    console.log("Server running on port 10000");
});



// ===== CRUD ROUTES =====

// GET all todos
app.get("/todos", (req, res) => {
  db.query("SELECT * FROM todos", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ADD todo
app.post("/todos", (req, res) => {
  const { title, task } = req.body;
  const status = "pending";

  db.query(
    "INSERT INTO todos (title, task, status) VALUES (?, ?, ?)",
    [title, task, status],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, title, task, status });
    }
  );
});

// UPDATE todo
app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { title, task, status } = req.body;

  db.query(
    "UPDATE todos SET title=?, task=?, status=? WHERE id=?",
    [title, task, status || "pending", id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Todo updated successfully" });
    }
  );
});

// DELETE todo
app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM todos WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Todo deleted successfully" });
  });
});

// // Start server
// const PORT = process.env.PORT || 10000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
