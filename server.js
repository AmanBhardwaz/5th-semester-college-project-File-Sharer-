require("dotenv").config();
const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const session = require("express-session");

const app = express();

const SESSION_SECRET = process.env.SESSION_SECRET;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/callback";
const PORT = process.env.PORT || 5000;

if (!SESSION_SECRET) {
  console.error("Missing SESSION_SECRET in .env");
  process.exit(1);
}

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET in .env");
  process.exit(1);
}

// === MongoDB Configuration ===
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/file-encryption-db";
const client = new MongoClient(MONGODB_URI);
let db;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db();
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

connectDB();

// === Session Configuration ===
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === "production"
    }
  })
);

// === Patch for cookie-session (so Passport works fine) ===
app.use((req, res, next) => {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = cb => cb();
  }
  if (req.session && !req.session.save) {
    req.session.save = cb => cb();
  }
  next();
});

// === Initialize Passport ===
app.use(passport.initialize());
app.use(passport.session());

// === Google OAuth Strategy ===
passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: REDIRECT_URI,
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user));

// === Serve Frontend ===
app.use(express.static(path.join(__dirname, "public")));

// === Routes ===

// Serve registration page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Handle registration
app.post("/register", express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    // Save user to database
    await db.collection("users").insertOne(newUser);
    
    // Log in the user
    req.session.user = newUser;
    res.redirect("/dashboard.html");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Serve login page
app.get("/login", (req, res) => {
  // If user is already logged in via Google, redirect to dashboard
  if (req.user) {
    return res.redirect("/dashboard.html");
  }
  // Otherwise serve the login page
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Handle password login
app.post("/login/password", express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    // Log in the user
    req.session.user = user;
    res.redirect("/dashboard.html");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Start Google login
app.get("/login/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback after Google login
app.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Store Google user in session
    req.session.user = req.user;
    res.redirect("/dashboard.html"); // redirect to frontend profile page
  }
);

// API to get logged-in user
app.get("/api/user", (req, res) => {
  // Check for Google OAuth user first
  if (req.user) {
    const displayName = req.user.displayName || (req.user.name ? req.user.name.givenName + ' ' + req.user.name.familyName : 'User');
    const email = req.user.emails && req.user.emails[0] ? req.user.emails[0].value : 'No email provided';
    
    return res.json({
      loggedIn: true,
      name: displayName,
      email: email,
      photo: req.user.photos && req.user.photos[0] ? req.user.photos[0].value : null,
    });
  }
  
  // Check for password login user
  if (req.session.user) {
    return res.json({
      loggedIn: true,
      name: req.session.user.name,
      email: req.session.user.email,
      photo: null,
    });
  }
  
  // No user logged in
  return res.json({ loggedIn: false });
});

// Logout
app.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
});

// === Start Server ===
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));