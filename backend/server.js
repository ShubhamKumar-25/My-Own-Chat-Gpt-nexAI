const express = require('express');
const cors = require('cors');
require('dotenv').config();
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

app.use(cors({
  origin: '*', 
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

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