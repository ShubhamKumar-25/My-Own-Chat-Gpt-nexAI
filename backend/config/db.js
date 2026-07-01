
// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'nexai_db',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// module.exports = pool;







const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path"); // 1. Path module ko import kiya
require("dotenv").config();

// 2. Safe path resolution: Agar DB_SSL_CA defined nahi hai, toh default path use hoga
const certPath = process.env.DB_SSL_CA 
  ? path.resolve(process.env.DB_SSL_CA) 
  : path.join(__dirname, "..", "certs", "isrgrootx1.pem");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: {
    // 3. fs.readFileSync ab hamesha ek valid string path receive karega
    ca: fs.readFileSync(certPath),
    rejectUnauthorized: true,
  },
});

module.exports = pool;