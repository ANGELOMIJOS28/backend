require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// -------------------
//  SEQUELIZE CONNECT
// -------------------
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    logging: false
  }
);

// -------------------
//  TODO MODEL
// -------------------
const Todo = sequelize.define("todo", {
  title: { type: DataTypes.STRING, allowNull: false },
  task: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "pending" }
});

// Sync auto-creates table if missing
sequelize.sync().then(() => {
  console.log("Database synced! (Tables created automatically)");
});

// -------------------
//  CRUD ROUTES
// -------------------
app.get("/todos", async (req, res) => {
  const todos = await Todo.findAll();
  res.json(todos);
});

app.post("/todos", async (req, res) => {
  const todo = await Todo.create(req.body);
  res.json(todo);
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  await Todo.update(req.body, { where: { id } });
  res.json({ message: "Updated successfully" });
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  await Todo.destroy({ where: { id } });
  res.json({ message: "Deleted successfully" });
});

// -------------------
//  START SERVER
// -------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
