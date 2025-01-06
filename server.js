const bodyParser = require("body-parser");
const express = require("express");
const exphbs = require("express-handlebars");
const mysql = require("mysql2");
require("dotenv").config();
const app = express();

const PORT = process.env.PORT || 3000;

// Handlebars configuration
app.engine("handlebars", exphbs.create({ extname: ".handlebars" }).engine);
app.set("view engine", "handlebars");
app.set("views", "./views");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

// database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.log("Database Error");
  } else {
    console.log("Server successfully connected to DATABASE");
  }
});

// route starts from here
app.get("/", (req, res) => {
  const query = "SELECT * FROM user_expenses";

  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send("Data could not be found");
    }
    // res.json(result);
    res.render("home", { task: result });
  });
});

//   get a single user by id
app.get("/user/:id", (req, res) => {
  const query = "SELECT * FROM user_expenses WHERE id = ?";
  const { id } = req.params;
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).send("Data could not be found");
    } else if (result.length === 0) {
      res.status(404).send("Data could not be found");
    } else {
      res.status(200).json(result[0]);
    }
  });
});


// Add a new task
app.post("/add-expense", (req, res) => {
  const { user_id, category, amount, description, expense_date } = req.body;
  const query =
    "INSERT INTO user_expenses (user_id,category,amount,description,expense_date) VALUES (?, ?, ?, ?, ?)";
  db.query(
    query,
    [user_id, category, amount, description, expense_date],
    (err, result) => {
      if (err) {
        res.status(500).send("Error adding task");
      } else {
        console.log(result, "hello");
        res.redirect("/");
        // console.log("user add");
        // res.status(200).send("User added");
      }
    }
  );
});

// edit user by id

app.get("/edit/:id", (req, res) => {
  const taskId = req.params.id;
  const query = "SELECT * FROM user_expenses WHERE id = ?";
  db.query(query, [taskId], (err, result) => {
    if (err) {
      res.status(500).send("Error fetching task");
    } else if (result.length === 0) {
      res.status(404).send("Task not found");
    } else {
      res.render("edit", { task: result[0] });
    }
  });
});

// Update user by id

// Update user by id
app.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { user_id, category, amount, description, expense_date } = req.body;
  const query =
    "UPDATE user_expenses SET user_id = ?, category = ?, amount = ?, description = ?, expense_date = ? WHERE id = ?";
  db.query(
    query,
    [user_id, category, amount, description, expense_date, id],
    (err) => {
      if (err) {
        console.error("Error updating data", err);
        res.status(500).send("Error updating task");
      } else {
        res.redirect("/");
      }
    }
  );
});

// delete a user by id

// delete a user by id
app.post("/delete/:id", (req, res) => {
  const { id } = req.params;  // Extract id from params
  const query = "DELETE FROM user_expenses WHERE id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting data", err);
      return res.status(500).send("Error deleting task");
    }
    res.redirect("/");
  });
});


// server listening

app.listen(PORT, () => {
  console.log("Server is listening");
});
