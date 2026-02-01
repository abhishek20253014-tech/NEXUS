import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

// Debug: Check if client ID is loaded (logging only the length/prefix for security)
if (process.env.GOOGLE_CLIENT_ID === 'your_client_id_here' || !process.env.GOOGLE_CLIENT_ID) {
  console.warn("⚠️  WARNING: GOOGLE_CLIENT_ID is either missing or still using the placeholder 'your_client_id_here' in your .env file.");
} else {
  console.log(`✅ GOOGLE_CLIENT_ID loaded (Prefix: ${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...)`);
}

const app = express();

/* ----------- PASSPORT CONFIG ----------- */

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
  (accessToken, refreshToken, profile, done) => {
    // In a real app, you would find or create a user in your database here.
    // For this mock, we'll just return the profile information.
    const user = {
      username: profile.displayName.replace(/\s+/g, '_').toLowerCase(),
      email: profile.emails[0].value,
      googleId: profile.id,
      photo: profile.photos[0].value
    };
    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

/* ----------- MIDDLEWARE ----------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Use session user or mock user
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Dummy in-memory session (kept for compatibility with existing code)
let currentUser = {
  username: "shresth_01",
  email: "user@example.com"
};

/* ----------- VIEW ENGINE ----------- */
app.set("view engine", "ejs");
app.set("views", "./views");

// Dummy user for local development (if not logged in)
const defaultUser = {
  username: "shresth_01",
  email: "user@example.com"
};

/* ------------- GET ROUTES ------------- */

// Home → login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Google OAuth Routes
app.get("/auth/google", (req, res, next) => {
  const loginHint = req.query.email || "";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    loginHint: loginHint
  })(req, res, next);
});

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect to dashboard.
    res.redirect("/dashboard");
  }
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect("/login");
  });
});

// Pages
app.get("/login", (req, res) => res.render("login", { title: 'Login' }));
app.get("/register", (req, res) => res.render("register", { title: 'Register' }));
app.get("/dashboard", (req, res) => res.render("dashboard", { title: 'Dashboard', user: req.user || defaultUser }));
app.get("/form", (req, res) => res.render("form", { title: 'New Submission', user: req.user || defaultUser }));
app.get("/submissions", (req, res) => res.render("submissions", { title: 'Submissions', user: req.user || defaultUser }));
app.get("/profile", (req, res) => res.render("profile", { title: 'Profile', user: req.user || defaultUser }));

/* ------------- POST ROUTES ------------- */

// Login
app.post("/login", (req, res) => {
  console.log("Login:", req.body);
  // Just update mock user with email if logged in
  currentUser.email = req.body.email;
  res.redirect("/dashboard");
});

// Register
app.post("/register", (req, res) => {
  const { username, email } = req.body;
  console.log("Register:", req.body);

  // Basic mock "unique" check
  if (username === "admin") {
    return res.send("Username already taken!");
  }

  currentUser = { username, email };
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
