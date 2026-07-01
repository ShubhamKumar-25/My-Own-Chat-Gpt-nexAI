const express = require('express');
const cors = require('cors');
require('dotenv').config();
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes'); 

const app = express();

const allowedOrigins = [
  'http://localhost:5173', 
  process.env.FRONTEND_URL 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy Blocked: Unauthorized Origin'));
    }
  },
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