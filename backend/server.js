// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const rateLimit = require("express-rate-limit");
// const chatRoutes = require('./routes/chatRoutes');
// const authRoutes = require('./routes/authRoutes'); 

// const app = express();

// // Safe Allowed Origins Array
// const allowedOrigins = [
//   'http://localhost:5173', // Local React/Vite App
// ];

// if (process.env.FRONTEND_URL) {
//   allowedOrigins.push(process.env.FRONTEND_URL);
// }

// // app.use(cors({
// //   origin: function (origin, callback) {
// //     // !origin checks for server-to-server or postman requests
// //     if (!origin || allowedOrigins.includes(origin)) {
// //       callback(null, true);
// //     } else {
// //       callback(new Error('CORS Policy Blocked: Unauthorized Origin'));
// //     }
// //   },
// //   credentials: true
// // }));

// app.use(cors({
//   origin: '*', 
//   credentials: true
// }));

// // app.use(cors({
// //   origin: function (origin, callback) {
// //     if (!origin || allowedOrigins.includes(origin)) {
// //       callback(null, true);
// //     } else {
// //       callback(new Error("CORS Policy Blocked"));
// //     }
// //   },
// //   credentials: true
// // }));


// // General API Limiter
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 Minutes
//   max: 100,
//   message: {
//     success: false,
//     message: "Too many requests. Please try again after 15 minutes."
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Login Limiter
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message: {
//     success: false,
//     message: "Too many login attempts. Try again after 15 minutes."
//   }
// });

// // Signup Limiter
// const signupLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 3,
//   message: {
//     success: false,
//     message: "Too many signup attempts. Please try later."
//   }
// });

// // AI Chat Limiter
// const chatLimiter = rateLimit({
//   windowMs: 60 * 1000, // 1 Minute
//   max: 20,
//   message: {
//     success: false,
//     message: "Chat request limit exceeded. Wait for a minute."
//   }
// });

// app.use(express.json());

// // Routes
// // app.use('/api/chat', chatRoutes);
// // app.use('/api/auth', authRoutes);
// // General API Limit
// app.use("/api", apiLimiter);

// // Auth Routes
// app.use("/api/auth/login", loginLimiter);
// app.use("/api/auth/signup", signupLimiter);
// app.use("/api/auth", authRoutes);

// // Chat Routes
// app.use("/api/chat", chatLimiter, chatRoutes);

// app.get("/", (req, res) => {
//     res.json({
//         success: true,
//         message: "Backend is running 🚀"
//     });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });









// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");

// require("dotenv").config();

// const chatRoutes = require("./routes/chatRoutes");
// const authRoutes = require("./routes/authRoutes");

// const app = express();

// // -------------------------
// // Allowed Origins
// // -------------------------
// const allowedOrigins = [
//   "http://localhost:5173"
// ];

// if (process.env.FRONTEND_URL) {
//   allowedOrigins.push(
//     process.env.FRONTEND_URL.trim().replace(/\/$/, "")
//   );
// }

// // -------------------------
// // Security Headers
// // -------------------------
// app.use(helmet());

// // -------------------------
// // CORS
// // -------------------------
// app.use(cors({
//   origin: function (origin, callback) {

//     // Requests without Origin:
//     // curl, Postman, server-to-server, etc.
//     if (!origin) {
//       return callback(null, true);
//     }

//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     return callback(
//       new Error("CORS Policy Blocked")
//     );
//   },

//   credentials: true
// }));

// // -------------------------
// // Request Body Limit
// // -------------------------
// app.use(express.json({
//   limit: "50kb"
// }));

// // -------------------------
// // Rate Limiters
// // -------------------------
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Too many requests. Please try again later."
//   }
// });

// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Too many login attempts. Try again later."
//   }
// });

// const signupLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 3,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Too many signup attempts. Please try later."
//   }
// });

// const chatLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 20,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Chat request limit exceeded. Please wait."
//   }
// });

// // -------------------------
// // Health Check
// // -------------------------
// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "Backend is running 🚀"
//   });
// });

// // -------------------------
// // Global API Limiter
// // -------------------------
// app.use("/api", apiLimiter);

// // -------------------------
// // Auth Routes
// // -------------------------
// app.use("/api/auth/login", loginLimiter);
// app.use("/api/auth/signup", signupLimiter);
// app.use("/api/auth", authRoutes);

// // -------------------------
// // Chat Routes
// // -------------------------
// app.use("/api/chat", chatLimiter, chatRoutes);

// // -------------------------
// // Error Handler
// // -------------------------
// app.use((err, req, res, next) => {
//   console.error(err.message);

//   res.status(500).json({
//     success: false,
//     message: "Internal server error"
//   });
// });

// // -------------------------
// // Server
// // -------------------------
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });













const express = require('express');
const cors = require('cors');
require('dotenv').config();
const rateLimit = require("express-rate-limit");
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes'); 

const app = express();

// 1. Safe Allowed Origins Array
const allowedOrigins = [
  'http://localhost:5173', // Local React/Vite App
  'https://my-own-chat-gpt-nex-ai.vercel.app' // Production Frontend Vercel URL
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// 2. CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allows server-to-server, Postman, or mobile apps requests
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Policy Blocked: Unauthorized Origin"));
    }
  },
  credentials: true
}));

// Body Parser Middleware
app.use(express.json());

// 3. Rate Limiters Definitions
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
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Signup Limiter
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 3,
  message: {
    success: false,
    message: "Too many signup attempts. Please try later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI Chat Limiter
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 Minute
  max: 20,
  message: {
    success: false,
    message: "Chat request limit exceeded. Wait for a minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. Routes Application

// Base API route par general limit lagao
app.use("/api", apiLimiter);

// Specific Auth endpoints par pehle limiter apply karo, fir authRoutes ko bypass karo
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/signup", signupLimiter);
app.use("/api/auth", authRoutes);

// Chat Routes with specific Chat Limiter
app.use("/api/chat", chatLimiter, chatRoutes);

// Health Check Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend is running 🚀"
    });
});

// 5. Global Error Handling Middleware (CORS aur doosre errors ke liye)
app.use((err, req, res, next) => {
    if (err.message && err.message.includes('CORS Policy Blocked')) {
        return res.status(403).json({
            success: false,
            message: err.message
        });
    }
    
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong on the server!"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});