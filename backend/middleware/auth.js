const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {

    const verified = jwt.verify(token, process.env.JWT_SECRET || "nexai_secret_key_123");
    req.user = verified; 
    next(); 
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;