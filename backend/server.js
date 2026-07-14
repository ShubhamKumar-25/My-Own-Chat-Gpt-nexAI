const express = require('express');
const cors = require('cors');
require('dotenv').config();
const rateLimit = require("express-rate-limit");
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes'); 

const app = express();

// Safe Allowed Origins Array
const allowedOrigins = [
  'http://localhost:5173', // Local React/Vite App
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// app.use(cors({
//   origin: function (origin, callback) {
//     // !origin checks for server-to-server or postman requests
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('CORS Policy Blocked: Unauthorized Origin'));
//     }
//   },
//   credentials: true
// }));

// app.use(cors({
//   origin: '*', 
//   credentials: true
// }));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Policy Blocked"));
    }
  },
  credentials: true
}));


// General API Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login Limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Try again after 15 minutes."
  }
});

// Signup Limiter
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many signup attempts. Please try later."
  }
});

// AI Chat Limiter
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 Minute
  max: 20,
  message: {
    success: false,
    message: "Chat request limit exceeded. Wait for a minute."
  }
});

app.use(express.json());

// Routes
// app.use('/api/chat', chatRoutes);
// app.use('/api/auth', authRoutes);
// General API Limit
app.use("/api", apiLimiter);

// Auth Routes
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/signup", signupLimiter);
app.use("/api/auth", authRoutes);

// Chat Routes
app.use("/api/chat", chatLimiter, chatRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend is running 🚀"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});