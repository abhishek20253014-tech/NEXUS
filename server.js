import express from "express";

const app = express();

/* ----------- MIDDLEWARE ----------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

/* ----------- VIEW ENGINE ----------- */
app.set("view engine", "ejs");
app.set("views", "./views");

/* ------------- GET ROUTES ------------- */

// Home → login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Pages
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));
app.get("/dashboard", (req, res) => res.render("dashboard"));
app.get("/form", (req, res) => res.render("form"));
app.get("/submissions", (req, res) => res.render("submissions"));
app.get("/profile", (req, res) => res.render("profile"));

/* ------------- POST ROUTES ------------- */

// Login
app.post("/login", (req, res) => {
  console.log("Login:", req.body);
  res.redirect("/dashboard");
});

// Register
app.post("/register", (req, res) => {
  console.log("Register:", req.body);
  res.redirect("/dashboard");
});

// Form submit
app.post("/submit", (req, res) => {
  console.log("Submission:", req.body);
  res.redirect("/submissions");
});

/* ------------- START SERVER ------------- */
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
